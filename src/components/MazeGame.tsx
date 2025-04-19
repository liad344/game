import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/useGameStore';
import playerIcon from '../assets/player.png';
import ghostIcon from '../assets/ghost.png';
import fastIcon from '../assets/fast.png';
import slowIcon from '../assets/slow.png';
import goalIcon from '../assets/goal.png';

const GRID_SIZE = 15;
const CELL_SIZE = 24;

const Direction = {
  UP: 'up',
  RIGHT: 'right',
  DOWN: 'down',
  LEFT: 'left'
};

type Cell = {
  x: number;
  y: number;
  visited: boolean;
  walls: {
    top: boolean;
    right: boolean;
    bottom: boolean;
    left: boolean;
  };
};

type Player = {
  x: number;
  y: number;
};

export function MazeGame() {
  const navigate = useNavigate();
  const [maze, setMaze] = useState<Cell[][]>([]);
  const [player, setPlayer] = useState<Player>({ x: 0, y: 0 });
  const [goal, setGoal] = useState<{ x: number; y: number }>({ x: GRID_SIZE - 1, y: GRID_SIZE - 1 });
  const [isGameWon, setIsGameWon] = useState(false);
  const [timer, setTimer] = useState(120);
  const [level, setLevel] = useState(1);
  const [slowMode, setSlowMode] = useState(false);
  const [slowModeTimeLeft, setSlowModeTimeLeft] = useState(0);
  const [ghostMode, setGhostMode] = useState(false);
  const [ghostModeTimeLeft, setGhostModeTimeLeft] = useState(0);
  const [fastMode, setFastMode] = useState(false);
  const [fastModeTimeLeft, setFastModeTimeLeft] = useState(0);
  const [powerDots, setPowerDots] = useState<{x: number, y: number, type: 'ghost' | 'slow' | 'fast'}[]>([]);
  const [blockedStart, setBlockedStart] = useState(false);

  // Initialize and generate the maze
  useEffect(() => {
    generateMaze();
  }, [level]);

  // Track level start time for "too easy" detection
  const [levelStartTime, setLevelStartTime] = useState(Date.now());
  const [showTooEasyModal, setShowTooEasyModal] = useState(false);
  
  // Reset level start time when level changes
  useEffect(() => {
    setLevelStartTime(Date.now());
  }, [level]);
  
  // Timer countdown
  useEffect(() => {
    if (isGameWon) return;
    
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isGameWon]);

  // Check if player reached goal
  useEffect(() => {
    if (player.x === goal.x && player.y === goal.y) {
      // Calculate time taken to complete level
      const completionTime = (Date.now() - levelStartTime) / 1000; // in seconds
      
      if (completionTime < 15) {
        // Level completed too quickly - show modal instead of giving coupon
        setShowTooEasyModal(true);
      } else {
        // Level completed in reasonable time - mark as won
        setIsGameWon(true);
      }
    }
  }, [player, goal, levelStartTime]);

  // Check if player reached a power dot
  useEffect(() => {
    const dotIndex = powerDots.findIndex(dot => dot.x === player.x && dot.y === player.y);
    if (dotIndex >= 0) {
      const dot = powerDots[dotIndex];
      
      // Remove the eaten dot
      setPowerDots(prev => prev.filter((_, i) => i !== dotIndex));
      
      // Activate the appropriate power mode based on dot type
      if (dot.type === 'ghost') {
        // Clear any existing ghost mode timer
        setGhostMode(true);
        setGhostModeTimeLeft(2); // 2 seconds of ghost mode
      } 
      else if (dot.type === 'slow') {
        // Activate slow mode
        setSlowMode(true);
        setSlowModeTimeLeft(5); // 5 seconds of slow mode
      }
      else if (dot.type === 'fast') {
        // Activate fast mode
        setFastMode(true);
        setFastModeTimeLeft(3); // 3 seconds of fast mode
      }
    }
  }, [player, powerDots]);
  
  // Handle ghost mode timer
  useEffect(() => {
    if (!ghostMode || ghostModeTimeLeft <= 0) return;
    
    const timer = setInterval(() => {
      setGhostModeTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setGhostMode(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [ghostMode, ghostModeTimeLeft]);
  
  // Handle slow mode timer
  useEffect(() => {
    if (!slowMode || slowModeTimeLeft <= 0) return;
    
    const timer = setInterval(() => {
      setSlowModeTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setSlowMode(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [slowMode, slowModeTimeLeft]);
  
  // Handle fast mode timer
  useEffect(() => {
    if (!fastMode || fastModeTimeLeft <= 0) return;
    
    const timer = setInterval(() => {
      setFastModeTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setFastMode(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [fastMode, fastModeTimeLeft]);

  const generateMaze = () => {
    // Reset all special effects
    setGhostMode(false);
    setGhostModeTimeLeft(0);
    setSlowMode(false);
    setSlowModeTimeLeft(0);
    setFastMode(false);
    setFastModeTimeLeft(0);
    
    // For level 4 only, set blocked start
    setBlockedStart(level === 4);
    
    // Create initial grid with all walls
    const newMaze: Cell[][] = Array(GRID_SIZE).fill(0).map((_, y) =>
      Array(GRID_SIZE).fill(0).map((_, x) => ({
        x,
        y,
        visited: false,
        walls: {
          top: true,
          right: true,
          bottom: true,
          left: true
        }
      }))
    );

    // Use depth-first search for maze generation
    const startX = 0;
    const startY = 0;

    const stack: [number, number][] = [[startX, startY]];
    newMaze[startY][startX].visited = true;

    while (stack.length > 0) {
      const [currentX, currentY] = stack[stack.length - 1];
      const neighbors: [number, number, keyof Cell['walls'], keyof Cell['walls']][] = [];

      // Check each neighbor (up, right, down, left)
      if (currentY > 0 && !newMaze[currentY - 1][currentX].visited) {
        neighbors.push([currentX, currentY - 1, 'top', 'bottom']);
      }
      if (currentX < GRID_SIZE - 1 && !newMaze[currentY][currentX + 1].visited) {
        neighbors.push([currentX + 1, currentY, 'right', 'left']);
      }
      if (currentY < GRID_SIZE - 1 && !newMaze[currentY + 1][currentX].visited) {
        neighbors.push([currentX, currentY + 1, 'bottom', 'top']);
      }
      if (currentX > 0 && !newMaze[currentY][currentX - 1].visited) {
        neighbors.push([currentX - 1, currentY, 'left', 'right']);
      }

      if (neighbors.length > 0) {
        // Choose a random neighbor
        const [nextX, nextY, wallCurrent, wallNext] = neighbors[
          Math.floor(Math.random() * neighbors.length)
        ];

        // Remove walls between current and next
        newMaze[currentY][currentX].walls[wallCurrent] = false;
        newMaze[nextY][nextX].walls[wallNext] = false;

        // Mark next as visited and add to stack
        newMaze[nextY][nextX].visited = true;
        stack.push([nextX, nextY]);
      } else {
        // Backtrack if no unvisited neighbors
        stack.pop();
      }
    }

    // For level 4 (blocked start), we'll temporarily block the start but set up a timer to unblock
    if (level === 4) {
      // Block all exits from starting position
      if (newMaze[0][0].walls.right === false) newMaze[0][0].walls.right = true;
      if (newMaze[0][0].walls.bottom === false) newMaze[0][0].walls.bottom = true;
      
      // Unblock after 5 seconds
      setTimeout(() => {
        setMaze(prevMaze => {
          const newMaze = [...prevMaze];
          // Find at least one path to unblock from the start
          if (prevMaze[0][1] && !prevMaze[0][1].walls.left) {
            newMaze[0][0] = {...newMaze[0][0], walls: {...newMaze[0][0].walls, right: false}};
          } else if (prevMaze[1] && prevMaze[1][0] && !prevMaze[1][0].walls.top) {
            newMaze[0][0] = {...newMaze[0][0], walls: {...newMaze[0][0].walls, bottom: false}};
          }
          setBlockedStart(false);
          return newMaze;
        });
      }, 5000);
    }
    
    // Add power dots based on the level
    const powerDotPositions = [];
    
    // Level 3: Ghost power dots
    if (level === 3) {
      // Place 3 ghost power dots
      for (let i = 0; i < 3; i++) {
        let x, y;
        do {
          x = Math.floor(Math.random() * (GRID_SIZE - 2)) + 1; // Avoid edges
          y = Math.floor(Math.random() * (GRID_SIZE - 2)) + 1;
        } while (
          (x === 0 && y === 0) || // Not at start
          (x === GRID_SIZE - 1 && y === GRID_SIZE - 1) || // Not at goal
          powerDotPositions.some(dot => dot.x === x && dot.y === y) // Not on another dot
        );
        powerDotPositions.push({ x, y, type: 'ghost' });
      }
    }
    
    // Level 5: Slow power dots
    else if (level === 5) {
      // Place 3 slow power dots
      for (let i = 0; i < 3; i++) {
        let x, y;
        do {
          x = Math.floor(Math.random() * (GRID_SIZE - 2)) + 1;
          y = Math.floor(Math.random() * (GRID_SIZE - 2)) + 1;
        } while (
          (x === 0 && y === 0) ||
          (x === GRID_SIZE - 1 && y === GRID_SIZE - 1) ||
          powerDotPositions.some(dot => dot.x === x && dot.y === y)
        );
        powerDotPositions.push({ x, y, type: 'slow' });
      }
    } 
    
    // Level 6: Fast power dots
    else if (level === 6) {
      // Place 3 fast power dots
      for (let i = 0; i < 3; i++) {
        let x, y;
        do {
          x = Math.floor(Math.random() * (GRID_SIZE - 2)) + 1;
          y = Math.floor(Math.random() * (GRID_SIZE - 2)) + 1;
        } while (
          (x === 0 && y === 0) ||
          (x === GRID_SIZE - 1 && y === GRID_SIZE - 1) ||
          powerDotPositions.some(dot => dot.x === x && dot.y === y)
        );
        powerDotPositions.push({ x, y, type: 'fast' });
      }
    }
    
    // Level 7: Mixed power dots (final level)
    else if (level === 7) {
      // Place 2 of each type of power dot
      const types: ('ghost' | 'slow' | 'fast')[] = ['ghost', 'ghost', 'slow', 'slow', 'fast', 'fast'];
      for (let i = 0; i < types.length; i++) {
        let x, y;
        do {
          x = Math.floor(Math.random() * (GRID_SIZE - 2)) + 1;
          y = Math.floor(Math.random() * (GRID_SIZE - 2)) + 1;
        } while (
          (x === 0 && y === 0) ||
          (x === GRID_SIZE - 1 && y === GRID_SIZE - 1) ||
          powerDotPositions.some(dot => dot.x === x && dot.y === y)
        );
        powerDotPositions.push({ x, y, type: types[i] });
      }
    }
    
    setPowerDots(powerDotPositions);
    
    // For level 5, make a much more complex maze with longer paths
    if (level === 5) {
      // Add some random extra paths to create loops in the maze
      for (let i = 0; i < GRID_SIZE * 2; i++) {
        const x = Math.floor(Math.random() * (GRID_SIZE - 1));
        const y = Math.floor(Math.random() * (GRID_SIZE - 1));
        
        // Randomly remove a wall to create a loop
        const direction = Math.floor(Math.random() * 2);
        if (direction === 0 && x < GRID_SIZE - 1) {
          // Remove right wall
          newMaze[y][x].walls.right = false;
          newMaze[y][x + 1].walls.left = false;
        } else if (y < GRID_SIZE - 1) {
          // Remove bottom wall
          newMaze[y][x].walls.bottom = false;
          newMaze[y + 1][x].walls.top = false;
        }
      }
    }

    // Reset player position
    setPlayer({ x: 0, y: 0 });
    
    // Set goal based on level
    setGoal({ x: GRID_SIZE - 1, y: GRID_SIZE - 1 });
    
    // Set maze
    setMaze(newMaze);
    
    // Reset game state
    setIsGameWon(false);
    setGhostMode(false);
    setGhostModeTimeLeft(0);
    
    // Adjust timer based on level difficulty
    const timers = [120, 110, 100, 90, 80, 70, 60];
    setTimer(timers[level - 1] || 120);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isGameWon || timer === 0 || blockedStart) return;

    let newX = player.x;
    let newY = player.y;

    // Determine direction of movement
    switch (e.key) {
      case 'ArrowUp':
        if (ghostMode || !maze[player.y][player.x].walls.top) newY--;
        break;
      case 'ArrowRight':
        if (ghostMode || !maze[player.y][player.x].walls.right) newX++;
        break;
      case 'ArrowDown':
        if (ghostMode || !maze[player.y][player.x].walls.bottom) newY++;
        break;
      case 'ArrowLeft':
        if (ghostMode || !maze[player.y][player.x].walls.left) newX--;
        break;
    }

    // Boundary check - even in ghost mode, you can't leave the maze
    if (newX < 0 || newX >= GRID_SIZE || newY < 0 || newY >= GRID_SIZE) {
      return;
    }

    // Update player position if it's a valid move
    if (newX !== player.x || newY !== player.y) {
      // Apply movement modifiers based on active modes
      if (slowMode) {
        // Slow movement with delay
        setTimeout(() => {
          setPlayer({ x: newX, y: newY });
        }, 300);
      } 
      else if (fastMode) {
        // Fast movement with double distance (if possible)
        const direction = {
          x: newX - player.x,
          y: newY - player.y
        };
        
        // Try to move twice as far in the same direction
        const fastX = newX + direction.x;
        const fastY = newY + direction.y;
        
        // Check if the fast position is valid
        if (fastX >= 0 && fastX < GRID_SIZE && fastY >= 0 && fastY < GRID_SIZE) {
          // Check if the path continues in that direction
          const canContinue = (
            // Moving horizontally
            (direction.x !== 0 && (
              (direction.x > 0 && !maze[newY][newX].walls.right) ||
              (direction.x < 0 && !maze[newY][newX].walls.left)
            )) ||
            // Moving vertically
            (direction.y !== 0 && (
              (direction.y > 0 && !maze[newY][newX].walls.bottom) ||
              (direction.y < 0 && !maze[newY][newX].walls.top)
            ))
          );
          
          if (ghostMode || canContinue) {
            // Apply double movement for fast mode
            setPlayer({ x: fastX, y: fastY });
            return;
          }
        }
        
        // If fast movement isn't possible, just do regular movement
        setPlayer({ x: newX, y: newY });
      } 
      else {
        // Normal movement
        setPlayer({ x: newX, y: newY });
      }
    }
  };

  const handleDirectionClick = (direction: string) => {
    if (isGameWon || timer === 0 || blockedStart) return;

    let newX = player.x;
    let newY = player.y;

    // Determine direction of movement
    switch (direction) {
      case Direction.UP:
        if (ghostMode || !maze[player.y][player.x].walls.top) newY--;
        break;
      case Direction.RIGHT:
        if (ghostMode || !maze[player.y][player.x].walls.right) newX++;
        break;
      case Direction.DOWN:
        if (ghostMode || !maze[player.y][player.x].walls.bottom) newY++;
        break;
      case Direction.LEFT:
        if (ghostMode || !maze[player.y][player.x].walls.left) newX--;
        break;
    }

    // Boundary check - even in ghost mode, you can't leave the maze
    if (newX < 0 || newX >= GRID_SIZE || newY < 0 || newY >= GRID_SIZE) {
      return;
    }

    // Update player position if it's a valid move
    if (newX !== player.x || newY !== player.y) {
      // Apply movement modifiers based on active modes
      if (slowMode) {
        // Slow movement with delay
        setTimeout(() => {
          setPlayer({ x: newX, y: newY });
        }, 300);
      } 
      else if (fastMode) {
        // Fast movement with double distance (if possible)
        const directionVector = {
          x: newX - player.x,
          y: newY - player.y
        };
        
        // Try to move twice as far in the same direction
        const fastX = newX + directionVector.x;
        const fastY = newY + directionVector.y;
        
        // Check if the fast position is valid
        if (fastX >= 0 && fastX < GRID_SIZE && fastY >= 0 && fastY < GRID_SIZE) {
          // Check if the path continues in that direction
          const canContinue = (
            // Moving horizontally
            (directionVector.x !== 0 && (
              (directionVector.x > 0 && !maze[newY][newX].walls.right) ||
              (directionVector.x < 0 && !maze[newY][newX].walls.left)
            )) ||
            // Moving vertically
            (directionVector.y !== 0 && (
              (directionVector.y > 0 && !maze[newY][newX].walls.bottom) ||
              (directionVector.y < 0 && !maze[newY][newX].walls.top)
            ))
          );
          
          if (ghostMode || canContinue) {
            // Apply double movement for fast mode
            setPlayer({ x: fastX, y: fastY });
            return;
          }
        }
        
        // If fast movement isn't possible, just do regular movement
        setPlayer({ x: newX, y: newY });
      } 
      else {
        // Normal movement
        setPlayer({ x: newX, y: newY });
      }
    }
  };

  const moveToNextLevel = () => {
    // Move to the next level with proper cleanup and reset
    const nextLevel = level + 1;
    
    // If completed all levels, navigate to win screen
    if (nextLevel > 7) {
      localStorage.setItem('lastGamePath', '/maze');
      navigate('/win');
      return;
    }
    
    // Otherwise, go to the next level
    setLevel(nextLevel);
    
    // Reset all special effects
    setGhostMode(false);
    setGhostModeTimeLeft(0);
    setSlowMode(false);
    setSlowModeTimeLeft(0);
    setFastMode(false);
    setFastModeTimeLeft(0);
    setBlockedStart(false);
    
    // Add a coupon when completing a level
    if (useGameStore.getState().addCoupon) {
      useGameStore.getState().addCoupon('maze', nextLevel - 1);
    }
  };
  
  const skipLevel = () => {
    moveToNextLevel();
  };

  const resetLevel = () => {
    generateMaze();
    setLevelStartTime(Date.now());
    setShowTooEasyModal(false);
  };
  
  // Function to regenerate a more difficult level
  const regenerateHarderLevel = () => {
    // Here we could add logic to make the maze more complex
    // For now, we just regenerate the maze
    generateMaze();
    setLevelStartTime(Date.now());
    setShowTooEasyModal(false);
  };

  // Apply focus to the container div on render to capture keyboard events
  useEffect(() => {
    const gameContainer = document.getElementById('maze-game-container');
    if (gameContainer) {
      gameContainer.focus();
    }
  }, []);

  return (
    <div 
      id="maze-game-container"
      className="min-h-screen bg-gradient-to-br from-indigo-900 to-purple-800 flex flex-col items-center justify-center p-4"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <motion.div
        className="w-full max-w-md bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-between items-center mb-4">
          <motion.div 
            className="bg-purple-600/20 py-2 px-4 rounded-full text-purple-50 flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
          >
            <span className="text-yellow-400">🌟</span>
            <span className="font-bold">Level {level}{level === 5 ? " (Final)" : ""}</span>
          </motion.div>
          
          <motion.div 
            className={`flex items-center gap-2 ${timer < 30 ? 'bg-red-600/40' : 'bg-blue-600/20'} py-2 px-4 rounded-full ${timer < 30 ? 'text-red-50' : 'text-blue-50'}`}
            whileHover={{ scale: 1.05 }}
            animate={timer < 30 ? { scale: [1, 1.05, 1], transition: { repeat: Infinity, duration: 1 } } : {}}
          >
            <span>⏱️</span>
            <span className="font-bold">{timer}s</span>
          </motion.div>
        </div>
        
        {/* Level special effects indicators */}
        <div className="flex justify-center gap-2 mb-4 flex-wrap">
          {slowMode && (
            <motion.div 
              className="bg-amber-600/30 py-1 px-3 rounded-full text-amber-50 text-xs flex items-center gap-1"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span>🐢</span>
              <span>Slow Mode: {slowModeTimeLeft}s</span>
            </motion.div>
          )}
          
          {ghostMode && (
            <motion.div 
              className="bg-purple-600/30 py-1 px-3 rounded-full text-purple-50 text-xs flex items-center gap-1"
              animate={{ 
                opacity: [0.8, 1, 0.8],
                boxShadow: ['0 0 5px rgba(168, 85, 247, 0.5)', '0 0 15px rgba(168, 85, 247, 0.8)', '0 0 5px rgba(168, 85, 247, 0.5)']
              }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <span>👻</span>
              <span>Ghost Mode: {ghostModeTimeLeft}s</span>
            </motion.div>
          )}
          
          {fastMode && (
            <motion.div 
              className="bg-blue-600/30 py-1 px-3 rounded-full text-blue-50 text-xs flex items-center gap-1"
              animate={{ 
                scale: [0.95, 1.05, 0.95],
                boxShadow: ['0 0 5px rgba(59, 130, 246, 0.5)', '0 0 15px rgba(59, 130, 246, 0.8)', '0 0 5px rgba(59, 130, 246, 0.5)']
              }}
              transition={{ duration: 0.7, repeat: Infinity }}
            >
              <span>⚡</span>
              <span>Fast Mode: {fastModeTimeLeft}s</span>
            </motion.div>
          )}
          
          {blockedStart && (
            <motion.div 
              className="bg-red-600/30 py-1 px-3 rounded-full text-red-50 text-xs flex items-center gap-1"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              <span>🔒</span>
              <span>Trapped! Wait for escape...</span>
            </motion.div>
          )}
        </div>
        
        <div className="relative mx-auto" style={{ width: GRID_SIZE * CELL_SIZE, height: GRID_SIZE * CELL_SIZE }}>
          {/* Render maze grid */}
          <div className="absolute inset-0 bg-gray-800 rounded-lg overflow-hidden">
            {maze.map((row, y) =>
              row.map((cell, x) => (
                <div
                  key={`${x}-${y}`}
                  className="absolute bg-gray-800"
                  style={{
                    left: x * CELL_SIZE,
                    top: y * CELL_SIZE,
                    width: CELL_SIZE,
                    height: CELL_SIZE,
                  }}
                >
                  {/* Top wall */}
                  {cell.walls.top && (
                    <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-400" />
                  )}
                  {/* Right wall */}
                  {cell.walls.right && (
                    <div className="absolute top-0 right-0 bottom-0 w-1 bg-indigo-400" />
                  )}
                  {/* Bottom wall */}
                  {cell.walls.bottom && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-400" />
                  )}
                  {/* Left wall */}
                  {cell.walls.left && (
                    <div className="absolute top-0 left-0 bottom-0 w-1 bg-indigo-400" />
                  )}
                </div>
              ))
            )}

            {/* Power Dots */}
            {powerDots.map((dot, index) => {
              // Choose color based on dot type
              let gradientColors;
              let dotIcon;
              let shadowColor;
              
              if (dot.type === 'ghost') {
                gradientColors = "from-purple-400 to-violet-500";
                shadowColor = "rgba(168, 85, 247, 0.6)";
                dotIcon = ghostIcon;
              } 
              else if (dot.type === 'slow') {
                gradientColors = "from-amber-400 to-yellow-500";
                shadowColor = "rgba(251, 191, 36, 0.6)";
                dotIcon = slowIcon;
              }
              else if (dot.type === 'fast') {
                gradientColors = "from-blue-400 to-cyan-500";
                shadowColor = "rgba(56, 189, 248, 0.6)";
                dotIcon = fastIcon;
              }
              
              return (
                <motion.div
                  key={`dot-${index}`}
                  className={`absolute bg-gradient-to-br ${gradientColors} rounded-full shadow-lg z-5`}
                  style={{
                    width: CELL_SIZE * 0.5,
                    height: CELL_SIZE * 0.5,
                    left: dot.x * CELL_SIZE + CELL_SIZE * 0.25,
                    top: dot.y * CELL_SIZE + CELL_SIZE * 0.25,
                  }}
                  initial={{ scale: 0 }}
                  animate={{ 
                    scale: [0.8, 1.2, 0.8],
                    boxShadow: [
                      `0 0 10px ${shadowColor}`,
                      `0 0 20px ${shadowColor.replace('0.6', '0.8')}`,
                      `0 0 10px ${shadowColor}`
                    ]
                  }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <div className="w-full h-full flex items-center justify-center">
                    <img src={dotIcon} alt="power" className="w-full h-full object-contain p-1" />
                  </div>
                </motion.div>
              );
            })}

            {/* Player */}
            <motion.div
              className={`absolute ${ghostMode ? 'bg-gradient-to-br from-purple-400/70 to-indigo-500/70' : 'bg-gradient-to-br from-green-400 to-emerald-500'} rounded-full shadow-lg z-10`}
              style={{
                width: CELL_SIZE * 0.7,
                height: CELL_SIZE * 0.7,
                left: player.x * CELL_SIZE + CELL_SIZE * 0.15,
                top: player.y * CELL_SIZE + CELL_SIZE * 0.15,
                opacity: ghostMode ? 0.8 : 1
              }}
              initial={{ scale: 0 }}
              animate={ghostMode ? { 
                scale: [0.9, 1.1, 0.9],
                boxShadow: [
                  '0 0 10px rgba(139, 92, 246, 0.5)',
                  '0 0 15px rgba(139, 92, 246, 0.7)',
                  '0 0 10px rgba(139, 92, 246, 0.5)'
                ]
              } : { scale: 1 }}
              transition={{ duration: ghostMode ? 1 : 0.5, repeat: ghostMode ? Infinity : 0, type: ghostMode ? 'tween' : 'spring' }}
            >
              <motion.div 
                className="w-full h-full flex items-center justify-center"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              >
                <img 
                  src={ghostMode ? ghostIcon : playerIcon} 
                  alt="player" 
                  className="w-full h-full object-contain p-1" 
                />
              </motion.div>
            </motion.div>

            {/* Goal */}
            <motion.div
              className="absolute bg-gradient-to-br from-amber-400 to-orange-500 rounded-full shadow-lg"
              style={{
                width: CELL_SIZE * 0.7,
                height: CELL_SIZE * 0.7,
                left: goal.x * CELL_SIZE + CELL_SIZE * 0.15,
                top: goal.y * CELL_SIZE + CELL_SIZE * 0.15,
              }}
              initial={{ scale: 0 }}
              animate={{ 
                scale: [0.9, 1.1, 0.9],
                boxShadow: [
                  '0 0 10px rgba(251, 191, 36, 0.6)',
                  '0 0 20px rgba(251, 191, 36, 0.8)',
                  '0 0 10px rgba(251, 191, 36, 0.6)'
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="w-full h-full flex items-center justify-center">
                <img src={goalIcon} alt="goal" className="w-full h-full object-contain p-1" />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Direction controls for mobile */}
        <div className="mt-6 grid grid-cols-3 gap-2 max-w-[200px] mx-auto">
          <div></div>
          <motion.button
            onClick={() => handleDirectionClick(Direction.UP)}
            className="bg-indigo-600/30 hover:bg-indigo-600/50 text-white p-3 rounded-lg flex items-center justify-center"
            whileTap={{ scale: 0.9 }}
          >
            ↑
          </motion.button>
          <div></div>
          
          <motion.button
            onClick={() => handleDirectionClick(Direction.LEFT)}
            className="bg-indigo-600/30 hover:bg-indigo-600/50 text-white p-3 rounded-lg flex items-center justify-center"
            whileTap={{ scale: 0.9 }}
          >
            ←
          </motion.button>
          <div></div>
          <motion.button
            onClick={() => handleDirectionClick(Direction.RIGHT)}
            className="bg-indigo-600/30 hover:bg-indigo-600/50 text-white p-3 rounded-lg flex items-center justify-center"
            whileTap={{ scale: 0.9 }}
          >
            →
          </motion.button>
          
          <div></div>
          <motion.button
            onClick={() => handleDirectionClick(Direction.DOWN)}
            className="bg-indigo-600/30 hover:bg-indigo-600/50 text-white p-3 rounded-lg flex items-center justify-center"
            whileTap={{ scale: 0.9 }}
          >
            ↓
          </motion.button>
          <div></div>
        </div>

        {/* Action buttons */}
        <div className="mt-6 flex justify-center gap-3 flex-wrap">
          <motion.button
            onClick={resetLevel}
            className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-xl shadow-lg"
            whileHover={{ scale: 1.05, boxShadow: "0px 5px 15px rgba(239, 68, 68, 0.3)" }}
            whileTap={{ scale: 0.98 }}
          >
            Reset
          </motion.button>
          
          <motion.button
            onClick={skipLevel}
            className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-4 py-2 rounded-xl shadow-lg"
            whileHover={{ scale: 1.05, boxShadow: "0px 5px 15px rgba(124, 58, 237, 0.3)" }}
            whileTap={{ scale: 0.98 }}
          >
            Skip Level
          </motion.button>
          
          <Link to="/menu">
            <motion.button
              className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-4 py-2 rounded-xl shadow-lg"
              whileHover={{ scale: 1.05, boxShadow: "0px 5px 15px rgba(75, 85, 99, 0.3)" }}
              whileTap={{ scale: 0.98 }}
            >
              Menu
            </motion.button>
          </Link>
        </div>

        {/* Win overlay */}
        {isGameWon && (
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-20 rounded-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="bg-gradient-to-br from-purple-500/20 to-indigo-600/20 backdrop-blur-md p-6 rounded-2xl border border-purple-500/30 max-w-xs text-center"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
            >
              <motion.div
                className="text-6xl mb-4 mx-auto"
                animate={{
                  rotate: [0, 10, -10, 10, 0],
                  scale: [1, 1.2, 1, 1.1, 1]
                }}
                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
              >
                🎉
              </motion.div>
              <h2 className="text-2xl font-bold text-white mb-2">Level Complete!</h2>
              <p className="text-purple-200 mb-6">You've successfully navigated the maze!</p>
              {level < 7 ? (
                <motion.button
                  onClick={moveToNextLevel}
                  className="bg-gradient-to-r from-purple-600 to-indigo-500 text-white py-3 px-8 rounded-full font-bold shadow-lg"
                  whileHover={{ scale: 1.05, boxShadow: "0px 5px 15px rgba(124, 58, 237, 0.4)" }}
                  whileTap={{ scale: 0.98 }}
                >
                  Next Level →
                </motion.button>
              ) : (
                <motion.button
                  onClick={() => navigate('/win')}
                  className="bg-gradient-to-r from-green-600 to-emerald-500 text-white py-3 px-8 rounded-full font-bold shadow-lg"
                  whileHover={{ scale: 1.05, boxShadow: "0px 5px 15px rgba(16, 185, 129, 0.4)" }}
                  whileTap={{ scale: 0.98 }}
                >
                  Complete Game →
                </motion.button>
              )}
            </motion.div>
          </motion.div>
        )}

        {/* Time's up overlay */}
        {timer === 0 && !isGameWon && (
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-20 rounded-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="bg-gradient-to-br from-red-500/20 to-orange-600/20 backdrop-blur-md p-6 rounded-2xl border border-red-500/30 max-w-xs text-center"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
            >
              <motion.div
                className="text-6xl mb-4 mx-auto"
                animate={{
                  scale: [1, 1.2, 1]
                }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                ⏰
              </motion.div>
              <h2 className="text-2xl font-bold text-white mb-2">Time's Up!</h2>
              <p className="text-red-200 mb-6">Try again to solve the maze faster.</p>
              <motion.button
                onClick={resetLevel}
                className="bg-gradient-to-r from-red-600 to-orange-500 text-white py-3 px-8 rounded-full font-bold shadow-lg"
                whileHover={{ scale: 1.05, boxShadow: "0px 5px 15px rgba(239, 68, 68, 0.4)" }}
                whileTap={{ scale: 0.98 }}
              >
                Try Again
              </motion.button>
            </motion.div>
          </motion.div>
        )}
        
        {/* Too easy level overlay */}
        {showTooEasyModal && (
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-20 rounded-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="bg-gradient-to-br from-blue-500/20 to-purple-600/20 backdrop-blur-md p-6 rounded-2xl border border-blue-500/30 max-w-xs text-center"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
            >
              <motion.div
                className="text-6xl mb-4 mx-auto"
                animate={{
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                🏃
              </motion.div>
              <h2 className="text-2xl font-bold text-white mb-2">That Was Too Easy!</h2>
              <p className="text-blue-200 mb-6">You solved this level in under 15 seconds. Let's try something more challenging!</p>
              <motion.button
                onClick={regenerateHarderLevel}
                className="bg-gradient-to-r from-blue-600 to-purple-500 text-white py-3 px-8 rounded-full font-bold shadow-lg"
                whileHover={{ scale: 1.05, boxShadow: "0px 5px 15px rgba(59, 130, 246, 0.4)" }}
                whileTap={{ scale: 0.98 }}
              >
                Generate Harder Level
              </motion.button>
            </motion.div>
          </motion.div>
        )}

        {/* Instructions */}
        <motion.div
          className="mt-6 text-center text-purple-200 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <p>Use arrow keys or buttons to navigate through the maze.</p>
          <p>Reach the gold marker before time runs out!</p>
          
          {level === 1 && (
            <p className="mt-2 text-yellow-200">Level 1: Standard maze. Find your way to the goal!</p>
          )}
          
          {level === 2 && (
            <p className="mt-2 text-amber-200">Level 2: Find treasure dots to slow down time!</p>
          )}
          
          {level === 3 && (
            <p className="mt-2 text-violet-200">Level 3: Purple dots grant ghost mode - walk through walls!</p>
          )}
          
          {level === 4 && (
            <p className="mt-2 text-red-200">Level 4: You start trapped! Wait for the path to open...</p>
          )}
          
          {level === 5 && (
            <p className="mt-2 text-green-200">Level 5: Complex maze with speed power-ups!</p>
          )}
          
          {level === 6 && (
            <p className="mt-2 text-blue-200">Level 6: Fast mode power dots let you move double speed!</p>
          )}
          
          {level === 7 && (
            <p className="mt-2 text-pink-200">Level 7: Final challenge with all power types!</p>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}