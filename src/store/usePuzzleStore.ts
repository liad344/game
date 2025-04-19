import { create } from 'zustand';

type Car = {
  id: string;
  row: number;
  col: number;
  length: number;
  dir: 'h' | 'v';
  color: string;
};

type PuzzleStore = {
  levelIndex: number;
  levels: Car[][];
  cars: Car[];
  selectLevel: (index: number) => void;
  moveCar: (id: string, delta: number) => void;
  setCars: (cars: Car[]) => void;
};

const gridSize = 6;

export const usePuzzleStore = create<PuzzleStore>((set, get) => ({
  levelIndex: 0,
  levels: [
    [/* same car layouts you already defined... */],
    [/* level 2 */],
    [/* level 3 */]
  ],
  cars: [],

  selectLevel: (index) => {
    const level = get().levels[index];
    set({ levelIndex: index, cars: level });
  },

  setCars: (cars) => set({ cars }),

  moveCar: (id, delta) => {
    const cars = get().cars.map((car) => {
      if (car.id !== id) return car;
      let newRow = car.row;
      let newCol = car.col;

      const isOccupied = (r: number, c: number, skipId?: string) => {
        return get().cars.some((other) => {
          if (other.id === skipId) return false;
          for (let i = 0; i < other.length; i++) {
            const posR = other.row + (other.dir === 'v' ? i : 0);
            const posC = other.col + (other.dir === 'h' ? i : 0);
            if (posR === r && posC === c) return true;
          }
          return false;
        });
      };

      for (let i = 1; i <= Math.abs(delta); i++) {
        const step = delta > 0 ? i : -i;
        const testRow = car.dir === 'v' ? car.row + step : car.row;
        const testCol = car.dir === 'h' ? car.col + step : car.col;
        const testEnd = car.dir === 'v' ? testRow + car.length - 1 : testCol + car.length - 1;

        if (
          testRow < 0 ||
          testCol < 0 ||
          testEnd >= gridSize ||
          isOccupied(testRow, testCol, car.id)
        ) {
          return car; // blocked
        }

        newRow = car.dir === 'v' ? testRow : newRow;
        newCol = car.dir === 'h' ? testCol : newCol;
      }

      return { ...car, row: newRow, col: newCol };
    });

    set({ cars });
  }
}));
