import { Routes, Route, useNavigate } from 'react-router-dom';
import { useState, useCallback } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage.js';
import Home from './screens/Home.jsx';
import AddTask from './screens/AddTask.jsx';
import DopamineMenu from './screens/DopamineMenu.jsx';
import DerailModal from './screens/DerailModal.jsx';
import FloatingButtons from './components/FloatingButtons.jsx';

export default function App() {
  const [tasks, setTasks] = useLocalStorage('dam_tasks', []);
  const [derails, setDerails] = useLocalStorage('dam_derails', []);
  const [derailOpen, setDerailOpen] = useState(false);
  const [celebrateId, setCelebrateId] = useState(null);
  const navigate = useNavigate();

  const addTask = useCallback((text, priority, duration) => {
    const task = {
      id: `t_${Date.now()}`,
      text,
      priority,
      duration,
      completed: false,
      createdAt: Date.now(),
      completedAt: null,
    };
    setTasks((prev) => [task, ...prev]);
    navigate('/');
  }, [setTasks, navigate]);

  const completeTask = useCallback((id) => {
    setCelebrateId(id);
    setTimeout(() => setCelebrateId(null), 1800);
    setTasks((prev) =>
      prev.map((t) => t.id === id ? { ...t, completed: true, completedAt: Date.now() } : t)
    );
  }, [setTasks]);

  const logDerail = useCallback((category) => {
    setDerails((prev) => [
      { id: `d_${Date.now()}`, category, timestamp: Date.now() },
      ...prev,
    ]);
    setDerailOpen(false);
  }, [setDerails]);

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            <Home
              tasks={tasks}
              onComplete={completeTask}
              celebrateId={celebrateId}
            />
          }
        />
        <Route
          path="/add"
          element={<AddTask onAdd={addTask} />}
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
    </>
  );
}
