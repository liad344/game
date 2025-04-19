import { create } from 'zustand';

const BOARD_SIZE = 6;
const colors = ['red', 'blue', 'green', 'yellow'];
const directions = ['horizontal', 'vertical'];

const getRandomInt = (max) => Math.floor(Math.random() * max);

const generateRandomLevel = () => {
  const newCars = [];
  const occupied = Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(false));

  for (let i = 0; i < 3; i++) {
    let tries = 0;
    while (tries < 50) {
      const direction = directions[getRandomInt(directions.length)];
      const length = getRandomInt(2) + 2;
      const color = colors[getRandomInt(colors.length)];
      const x = getRandomInt(BOARD_SIZE - (direction === 'horizontal' ? length - 1 : 0));
      const y = getRandomInt(BOARD_SIZE - (direction === 'vertical' ? length - 1 : 0));
      const range = Array.from({ length }, (_, i) => i);
      const isFree = range.every((i) => {
        const cx = direction === 'horizontal' ? x + i : x;
        const cy = direction === 'vertical' ? y + i : y;
        return !occupied[cy][cx];
      });
      if (isFree) {
        range.forEach((i) => {
          const cx = direction === 'horizontal' ? x + i : x;
          const cy = direction === 'vertical' ? y + i : y;
          occupied[cy][cx] = true;
        });
        newCars.push({ id: i + 1, x, y, length, direction, color });
        break;
      }
      tries++;
    }
  }

  return newCars;
};

// Owner phone number for WhatsApp (with country code but no '+')
const ownerPhoneNumber = "0544586872"; // Israeli number

// Structured coupon configuration by game and level
const couponConfig = {
  maze: [
    { 
      title: "Maze Explorer - Level 1 Reward", 
      description: "Complete Maze Level 1 and get 10% off your next purchase" 
    },
    { 
      title: "Maze Explorer - Level 2 Reward", 
      description: "Complete Maze Level 2 and get free shipping on your order" 
    },
    { 
      title: "Maze Explorer - Level 3 Reward", 
      description: "Ghost mode mastery! Get an exclusive VIP discount" 
    },
    { 
      title: "Maze Explorer - Level 4 Reward", 
      description: "Trapped no more! Earn a special weekend discount" 
    },
    { 
      title: "Maze Explorer - Level 5 Reward", 
      description: "Complex maze completed! Early access to our flash sale" 
    },
    { 
      title: "Maze Explorer - Level 6 Reward", 
      description: "Speed demon! Bonus rewards for your accomplishment" 
    },
    { 
      title: "Maze Explorer - Level 7 Reward", 
      description: "Maze master! Special birthday month offer" 
    }
  ],
  plant: [
    {
      title: "Plant Growing - Stage 1 Reward",
      description: "Seedling sprouted! Get 15% off select items"
    },
    {
      title: "Plant Growing - Stage 2 Reward",
      description: "Plant thriving! Get a buy-one-get-one free offer"
    },
    {
      title: "Plant Growing - Stage 3 Reward",
      description: "Plant developing nicely! Earn a special weekend discount"
    },
    {
      title: "Plant Growing - Stage 4 Reward",
      description: "Plant flourishing! Exclusive premium customer bonus"
    },
    {
      title: "Plant Growing - Final Stage Reward",
      description: "Plant fully grown! Special limited edition item access"
    }
  ],
  carPuzzle: [
    {
      title: "Car Puzzle - Level 1 Reward",
      description: "Puzzle solving beginner! Get a first-timer discount"
    },
    {
      title: "Car Puzzle - Level 2 Reward",
      description: "Puzzle solving intermediate! Special bundle offer"
    },
    {
      title: "Car Puzzle - Level 3 Reward",
      description: "Puzzle solving expert! Premier customer reward"
    }
  ]
};

// Total number of possible coupons across all games
const totalPossibleCoupons = 
  couponConfig.maze.length + 
  couponConfig.plant.length + 
  couponConfig.carPuzzle.length;

// Function to get a coupon with game type and level
const getCoupon = (gameType, level) => {
  // Default to maze level 1 if not specified
  gameType = gameType || 'maze';
  level = level || 0;
  
  let config;
  
  // Get the appropriate config based on game type and level
  if (gameType === 'maze' && level < couponConfig.maze.length) {
    config = couponConfig.maze[level];
  } else if (gameType === 'plant' && level < couponConfig.plant.length) {
    config = couponConfig.plant[level];
  } else if (gameType === 'carPuzzle' && level < couponConfig.carPuzzle.length) {
    config = couponConfig.carPuzzle[level];
  } else {
    // Fallback to a random coupon from maze
    const randomLevel = getRandomInt(couponConfig.maze.length);
    config = couponConfig.maze[randomLevel];
  }
  
  return {
    id: Date.now(),
    title: config.title,
    description: config.description,
    code: Math.floor(1000 + Math.random() * 9000).toString(), // 4-digit code between 1000-9999
    gameType,
    level
  };
};

export const useGameStore = create((set, get) => ({
  // Plant watering game state
  water: 0,
  plantStage: 0,
  waterings: 0,
  addWater: () => set((state) => ({ water: state.water + 100 })),
  incrementWaterings: () => set((state) => ({ waterings: state.waterings + 1 })),
  resetGame: () => set({ water: 0, plantStage: 0, waterings: 0 }),
  resetWater: () => set({ water: 0 }),

  // Car puzzle game state
  levelIndex: 0,
  cars: generateRandomLevel(),
  exitedCars: [],
  timer: 90,
  setCars: (cars) => set({ cars }),
  setExitedCars: (exited) => set({ exitedCars: exited }),
  setTimer: (seconds) => set({ timer: seconds }),
  nextLevel: () => {
    const next = get().levelIndex + 1;
    set({
      levelIndex: next,
      cars: generateRandomLevel(),
      exitedCars: [],
      timer: 90,
    });
    // Add coupon after completing a level
    get().addCoupon();
  },
  resetLevel: () => {
    set({
      cars: generateRandomLevel(),
      exitedCars: [],
      timer: 90,
    });
  },
  
  // Prizes and coupons state
  coupons: [],
  lastCoupon: null,
  showCouponToast: false,
  totalPossibleCoupons,
  addCoupon: (gameType, level) => set((state) => {
    console.log(`Adding a coupon for ${gameType || 'unknown'} level ${level || 0}!`);
    const newCoupon = getCoupon(gameType, level);
    return { 
      coupons: [...state.coupons, newCoupon],
      lastCoupon: newCoupon,
      showCouponToast: true
    };
  }),
  hideCouponToast: () => set({ showCouponToast: false }),
}));
