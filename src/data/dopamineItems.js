export const CATEGORIES = ['Appetizers', 'Entrees', 'Sides', 'Desserts', 'Specials'];

export const CATEGORY_META = {
  Appetizers: { emoji: '🥗', time: 'Under 10 min', description: 'Quick dopamine bursts, easy to start' },
  Entrees:    { emoji: '🍽️', time: '30+ min',      description: 'Substantial activities with real energy' },
  Sides:      { emoji: '🥦', time: 'Any',           description: 'Add-ons that make tasks more engaging' },
  Desserts:   { emoji: '🍰', time: 'Any',           description: 'Go-to habits that feel good. Use mindfully.' },
  Specials:   { emoji: '🌟', time: 'Varies',        description: 'Occasional treats and planned events' },
};

export const DEFAULT_ITEMS = {
  Appetizers: [
    'Dance to one song',
    'Do some jumping jacks',
    'Step outside for 5 min',
    'Do a breathing exercise',
    '3-item gratitude list',
    'Drink a full glass of water',
    '5-minute tidy',
    'Light a candle or diffuser',
    'Stretch for 5 minutes',
    'Text a friend something kind',
    'Doodle for 5 minutes',
  ],
  Entrees: [
    'Go for a longer walk',
    'Play an instrument',
    'Work out or exercise class',
    'Bath or shower reset',
    'Read a book',
    'Do a creative project',
    'Journal freely',
    'Bake or try a new recipe',
    'Go to a coffee shop',
    'Quality time with a friend',
    'Make a new playlist',
  ],
  Sides: [
    'Play music while working',
    'Use a fidget toy',
    'Favorite drink while working',
    'Light a candle or scent',
    'Put on rain sounds',
    'Walk during a phone call',
    'Gamify a chore with a timer',
    'Podcast while doing tasks',
  ],
  Desserts: [
    'Scroll social media (timed)',
    'Watch a comfort show',
    'Watch YouTube videos',
    'Guilt-free nap',
    'Order food delivery',
    'Read a fun novel',
  ],
  Specials: [
    'Book a concert or event',
    'Plan a weekend trip',
    'Schedule a massage or spa',
    'Host a game night',
    'Go to the beach',
    'Book a mani/pedi or facial',
  ],
};
