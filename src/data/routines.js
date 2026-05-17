export const DEFAULT_ROUTINES = [
  {
    id: 'r_morning',
    name: 'Morning routine',
    category: 'Personal Projects',
    subtasks: [
      { id: 'rs1', text: 'Wake up', order: 'consecutive', isBackground: false, bgTimerMinutes: null, duration: 2 },
      { id: 'rs2', text: 'Make bed', order: 'consecutive', isBackground: false, bgTimerMinutes: null, duration: 3 },
      { id: 'rs3', text: 'Brush teeth', order: 'consecutive', isBackground: false, bgTimerMinutes: null, duration: 3 },
      { id: 'rs4', text: 'Get dressed', order: 'consecutive', isBackground: false, bgTimerMinutes: null, duration: 5 },
      { id: 'rs5', text: 'Breakfast', order: 'consecutive', isBackground: false, bgTimerMinutes: null, duration: 15 },
    ],
  },
  {
    id: 'r_laundry',
    name: 'Laundry',
    category: 'Household Chores',
    subtasks: [
      { id: 'rs1', text: 'Start washer', order: 'consecutive', isBackground: true, bgTimerMinutes: 45, duration: null },
      { id: 'rs2', text: 'Move to dryer', order: 'consecutive', isBackground: true, bgTimerMinutes: 50, duration: null },
      { id: 'rs3', text: 'Fold', order: 'consecutive', isBackground: false, bgTimerMinutes: null, duration: 15 },
      { id: 'rs4', text: 'Put away', order: 'consecutive', isBackground: false, bgTimerMinutes: null, duration: 10 },
    ],
  },
  {
    id: 'r_dishwasher',
    name: 'Dishwasher',
    category: 'Household Chores',
    subtasks: [
      { id: 'rs1', text: 'Run cycle', order: 'consecutive', isBackground: true, bgTimerMinutes: 60, duration: null },
      { id: 'rs2', text: 'Hand wash remaining', order: 'consecutive', isBackground: false, bgTimerMinutes: null, duration: 10 },
      { id: 'rs3', text: 'Put away', order: 'consecutive', isBackground: false, bgTimerMinutes: null, duration: 10 },
    ],
  },
  {
    id: 'r_email',
    name: 'Email triage',
    category: 'Work',
    subtasks: [
      { id: 'rs1', text: 'Open inbox', order: 'consecutive', isBackground: false, bgTimerMinutes: null, duration: 2 },
      { id: 'rs2', text: 'Delete junk', order: 'consecutive', isBackground: false, bgTimerMinutes: null, duration: 5 },
      { id: 'rs3', text: 'Reply urgent', order: 'consecutive', isBackground: false, bgTimerMinutes: null, duration: 15 },
      { id: 'rs4', text: 'Flag follow-ups', order: 'consecutive', isBackground: false, bgTimerMinutes: null, duration: 5 },
    ],
  },
  {
    id: 'r_bedroom',
    name: 'Quick bedroom clean',
    category: 'Household Chores',
    subtasks: [
      { id: 'rs1', text: 'Make bed', order: 'consecutive', isBackground: false, bgTimerMinutes: null, duration: 3 },
      { id: 'rs2', text: 'Pick up floor', order: 'consecutive', isBackground: false, bgTimerMinutes: null, duration: 5 },
      { id: 'rs3', text: 'Wipe surfaces', order: 'consecutive', isBackground: false, bgTimerMinutes: null, duration: 3 },
      { id: 'rs4', text: 'Empty trash', order: 'consecutive', isBackground: false, bgTimerMinutes: null, duration: 2 },
    ],
  },
  {
    id: 'r_eod',
    name: 'End of day work wrap',
    category: 'Work',
    subtasks: [
      { id: 'rs1', text: 'Clear desk', order: 'consecutive', isBackground: false, bgTimerMinutes: null, duration: 5 },
      { id: 'rs2', text: 'Close tabs', order: 'consecutive', isBackground: false, bgTimerMinutes: null, duration: 3 },
      { id: 'rs3', text: "Write tomorrow's top 2 tasks", order: 'consecutive', isBackground: false, bgTimerMinutes: null, duration: 5 },
    ],
  },
];
