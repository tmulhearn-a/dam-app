import { Routes, Route, useNavigate } from 'react-router-dom';
import { useState, useCallback, useEffect, useMemo } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage.js';
import Home from './screens/Home.jsx';
import AddTask from './screens/AddTask.jsx';
import DopamineMenu from './screens/DopamineMenu.jsx';
import DerailModal from './screens/DerailModal.jsx';
import ConflictModal from './screens/ConflictModal.jsx';
import FloatingButtons from './components/FloatingButtons.jsx';

const PRIORITY_ORDER = { 'On Fire': 0, 'Big Rock': 1, 'Easy Ball': 2, 'Back Burner': 3 };

function migrateTask(t) {
  if (t.status) return t;
  return {
    ...t,
    status: t.completed ? 'completed' : 'backlog',
    hasBeenActive: false,
    activeStartedAt: null,
    category: t.category ?? null,
    isParentTask: t.isParentTask ?? false,
    subtasks: t.subtasks ?? [],
    isBackgroundTask: t.isBackgroundTask ?? false,
    bgTimerMinutes: t.bgTimerMinutes ?? null,
    bgTimerStartedAt: t.bgTimerStartedAt ?? null,
    hardDeadline: t.hardDeadline ?? null,
    softDeadline: t.softDeadline ?? null,
    repeat: t.repeat ?? 'none',
    notes: t.notes ?? '',
    prepNote: t.prepNote ?? '',
  };
}

// Auto-promote top-priority backlog tasks to fill up to 2 Next Actions slots
function autoFillNext(tasks) {
  const nextCount = tasks.filter(t => t.status === 'next').length;
  if (nextCount >= 2) return tasks;
  const slots = 2 - nextCount;
  const candidates = tasks
    .filter(t => t.status === 'backlog' && !t.isBackgroundTask)
    .sort((a, b) =>
      (PRIORITY_ORDER[a.priority] ?? 4) - (PRIORITY_ORDER[b.priority] ?? 4) ||
      a.createdAt - b.createdAt
    );
  const toPromote = new Set(candidates.slice(0, slots).map(t => t.id));
  if (toPromote.size === 0) return tasks;
  return tasks.map(t => toPromote.has(t.id) ? { ...t, status: 'next' } : t);
}

export default function App() {
  const [tasks, setTasks] = useLocalStorage('dam_tasks', []);
  const [derails, setDerails] = useLocalStorage('dam_derails', []);
  const [customCategories, setCustomCategories] = useLocalStorage('dam_custom_categories', []);
  const [customRoutines, setCustomRoutines] = useLocalStorage('dam_custom_routines', []);
  const [derailOpen, setDerailOpen] = useState(false);
  const [celebrateId, setCelebrateId] = useState(null);
  const [conflictModal, setConflictModal] = useState(null);
  const navigate = useNavigate();

  // One-time migration of legacy tasks (no 'status' field) on mount
  useEffect(() => {
    const needsMigration = tasks.some(t => !t.status);
    if (needsMigration) {
      setTasks(prev => autoFillNext(prev.map(migrateTask)));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const migratedTasks = useMemo(() => tasks.map(migrateTask), [tasks]);

  const addTask = useCallback((taskData) => {
    const {
      text, priority, category, duration,
      isParentTask, subtasks,
      isBackgroundTask, bgTimerMinutes,
      hardDeadline, softDeadline, repeat,
      notes, prepNote,
    } = taskData;

    setTasks(prev => {
      const migrated = prev.map(migrateTask);
      let status;
      if (isBackgroundTask) {
        status = 'background';
      } else {
        const nextCount = migrated.filter(t => t.status === 'next').length;
        status = nextCount < 2 ? 'next' : 'backlog';
      }
      const newTask = {
        id: `t_${Date.now()}`,
        text,
        priority,
        category: category || null,
        duration: duration || null,
        isParentTask: !!isParentTask,
        subtasks: (subtasks || []).map((s, i) => ({
          id: `s_${Date.now()}_${i}`,
          text: s.text,
          order: s.order || 'consecutive',
          isBackground: !!s.isBackground,
          bgTimerMinutes: s.bgTimerMinutes || null,
          duration: s.duration || null,
          completed: false,
          skipped: false,
        })),
        isBackgroundTask: !!isBackgroundTask,
        bgTimerMinutes: bgTimerMinutes || null,
        bgTimerStartedAt: isBackgroundTask && bgTimerMinutes ? Date.now() : null,
        hardDeadline: hardDeadline || null,
        softDeadline: softDeadline || null,
        repeat: repeat || 'none',
        notes: notes || '',
        prepNote: prepNote || '',
        status,
        hasBeenActive: false,
        activeStartedAt: null,
        completed: false,
        createdAt: Date.now(),
        completedAt: null,
      };
      return autoFillNext([newTask, ...migrated]);
    });
    navigate('/');
  }, [setTasks, navigate]);

  const completeTask = useCallback((id) => {
    setCelebrateId(id);
    setTimeout(() => setCelebrateId(null), 1800);
    setTasks(prev => {
      const migrated = prev.map(migrateTask);
      const updated = migrated.map(t =>
        t.id === id ? { ...t, status: 'completed', completed: true, completedAt: Date.now() } : t
      );
      return autoFillNext(updated);
    });
  }, [setTasks]);

  const setActiveTask = useCallback((id) => {
    const currentActive = migratedTasks.find(t => t.status === 'active');
    const nextActions = migratedTasks.filter(t => t.status === 'next');

    if (!currentActive) {
      setTasks(prev => autoFillNext(prev.map(migrateTask).map(t =>
        t.id === id
          ? { ...t, status: 'active', hasBeenActive: true, activeStartedAt: Date.now() }
          : t
      )));
      return;
    }

    // Boot the current active task out
    const bootedDest = currentActive.isBackgroundTask ? 'background' : 'next';

    if (bootedDest === 'next' && nextActions.length >= 2) {
      // Conflict — ask user which 2 to keep in Next Actions
      setConflictModal({
        incomingId: id,
        bootedId: currentActive.id,
        existingNextIds: nextActions.slice(0, 2).map(t => t.id),
      });
      return;
    }

    setTasks(prev => autoFillNext(prev.map(migrateTask).map(t => {
      if (t.id === id) return { ...t, status: 'active', hasBeenActive: true, activeStartedAt: Date.now() };
      if (t.id === currentActive.id) return { ...t, status: bootedDest, activeStartedAt: null };
      return t;
    })));
  }, [migratedTasks, setTasks]);

  const resolveConflict = useCallback((keepIds) => {
    if (!conflictModal) return;
    const { incomingId, bootedId, existingNextIds } = conflictModal;
    const allThreeIds = [bootedId, ...existingNextIds];
    const dropId = allThreeIds.find(id => !keepIds.includes(id));

    setTasks(prev => autoFillNext(prev.map(migrateTask).map(t => {
      if (t.id === incomingId) return { ...t, status: 'active', hasBeenActive: true, activeStartedAt: Date.now() };
      if (keepIds.includes(t.id)) return { ...t, status: 'next' };
      if (t.id === dropId) return { ...t, status: t.hasBeenActive ? 'next' : 'backlog', activeStartedAt: null };
      return t;
    })));
    setConflictModal(null);
  }, [conflictModal, setTasks]);

  const advanceBgTask = useCallback((id) => {
    // v1 PWA: "done early" completes the background task
    // Full app: advances to next chain step
    setCelebrateId(id);
    setTimeout(() => setCelebrateId(null), 1800);
    setTasks(prev => autoFillNext(prev.map(migrateTask).map(t =>
      t.id === id ? { ...t, status: 'completed', completed: true, completedAt: Date.now() } : t
    )));
  }, [setTasks]);

  const logDerail = useCallback((category) => {
    setDerails(prev => [
      { id: `d_${Date.now()}`, category, timestamp: Date.now() },
      ...prev,
    ]);
    setDerailOpen(false);
  }, [setDerails]);

  const saveCategory = useCallback((cat) => {
    setCustomCategories(prev => [...prev, cat]);
  }, [setCustomCategories]);

  const saveRoutine = useCallback((routine) => {
    setCustomRoutines(prev => [...prev, routine]);
  }, [setCustomRoutines]);

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            <Home
              tasks={migratedTasks}
              onComplete={completeTask}
              onDoingNow={setActiveTask}
              onBgDone={advanceBgTask}
              celebrateId={celebrateId}
              customCategories={customCategories}
            />
          }
        />
        <Route
          path="/add"
          element={
            <AddTask
              onAdd={addTask}
              customCategories={customCategories}
              onSaveCategory={saveCategory}
              customRoutines={customRoutines}
              onSaveRoutine={saveRoutine}
            />
          }
        />
        <Route
          path="/dopamine"
          element={<DopamineMenu />}
        />
      </Routes>

      <FloatingButtons
        onAdd={() => navigate('/add')}
        onDopamine={() => navigate('/dopamine')}
        onDerail={() => setDerailOpen(true)}
      />

      {derailOpen && (
        <DerailModal
          onLog={logDerail}
          onClose={() => setDerailOpen(false)}
        />
      )}

      {conflictModal && (
        <ConflictModal
          tasks={migratedTasks}
          conflictModal={conflictModal}
          onResolve={resolveConflict}
          onCancel={() => setConflictModal(null)}
        />
      )}
    </>
  );
}
