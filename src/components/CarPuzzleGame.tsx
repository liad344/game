import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useGameStore } from "../store/useGameStore";

// Game constants
const BOARD_SIZE = 8;
const TILE_SIZE = 40;
const COLORS = ["red", "blue", "green", "yellow", "purple", "orange", "teal", "pink"];

// Shape definitions using relative coordinates
const SHAPES = {
  SINGLE: { 
    name: "Single", 
    cells: [[0, 0]],
    color: "#ef4444" // red
  },
  HORIZONTAL_2: { 
    name: "Horizontal-2", 
    cells: [[0, 0], [1, 0]],
    color: "#3b82f6" // blue
  },
  VERTICAL_2: { 
    name: "Vertical-2", 
    cells: [[0, 0], [0, 1]],
    color: "#22c55e" // green
  },
  HORIZONTAL_3: { 
    name: "Horizontal-3", 
    cells: [[0, 0], [1, 0], [2, 0]],
    color: "#eab308" // yellow
  },
  VERTICAL_3: { 
    name: "Vertical-3", 
    cells: [[0, 0], [0, 1], [0, 2]],
    color: "#a855f7" // purple
  },
  L_SHAPE: { 
    name: "L-Shape", 
    cells: [[0, 0], [0, 1], [1, 1]],
    color: "#f97316" // orange
  },
  REVERSE_L: { 
    name: "Reverse-L", 
    cells: [[0, 0], [0, 1], [-1, 1]],
    color: "#0d9488" // teal
  },
  T_SHAPE: { 
    name: "T-Shape", 
    cells: [[0, 0], [-1, 1], [0, 1], [1, 1]],
    color: "#ec4899" // pink
  }
};

// Level definitions
const baseLevels = [
  // Level 1 - Easy - Each piece can be moved to its target edge
  [
    // Blue shape with a red dot - dot goes to top, shape goes to right
    { id: 1, x: 5, y: 1, shape: "HORIZONTAL_2", color: "blue", dotColor: "red", targetEdge: "right", dotTargetEdge: "top", dotAtEdge: false },
    // Red shape with a blue dot - dot goes to right, shape goes to top
    { id: 2, x: 2, y: 2, shape: "SINGLE", color: "red", dotColor: "blue", targetEdge: "top", dotTargetEdge: "right", dotAtEdge: false },
    // Yellow shape with a green dot - dot goes to bottom, shape goes to right
    { id: 3, x: 4, y: 4, shape: "HORIZONTAL_3", color: "yellow", dotColor: "green", targetEdge: "right", dotTargetEdge: "bottom", dotAtEdge: false },
    // Green shape with a yellow dot - dot goes to right, shape goes to bottom
    { id: 4, x: 2, y: 5, shape: "VERTICAL_2", color: "green", dotColor: "yellow", targetEdge: "bottom", dotTargetEdge: "right", dotAtEdge: false },
  ],
  // Level 2 - Medium
  [
    { id: 1, x: 1, y: 1, shape: "L_SHAPE", color: "orange", dotColor: "teal", targetEdge: "left", dotTargetEdge: "bottom", dotAtEdge: false },
    { id: 2, x: 3, y: 0, shape: "VERTICAL_3", color: "purple", dotColor: "orange", targetEdge: "top", dotTargetEdge: "left", dotAtEdge: false },
    { id: 3, x: 5, y: 5, shape: "HORIZONTAL_2", color: "blue", dotColor: "purple", targetEdge: "right", dotTargetEdge: "top", dotAtEdge: false },
    { id: 4, x: 0, y: 6, shape: "SINGLE", color: "green", dotColor: "blue", targetEdge: "bottom", dotTargetEdge: "right", dotAtEdge: false },
  ],
  // Level 3 - Hard
  [
    { id: 1, x: 0, y: 1, shape: "REVERSE_L", color: "teal", dotColor: "pink", targetEdge: "left", dotTargetEdge: "top", dotAtEdge: false },
    { id: 2, x: 3, y: 3, shape: "T_SHAPE", color: "pink", dotColor: "yellow", targetEdge: "top", dotTargetEdge: "right", dotAtEdge: false },
    { id: 3, x: 5, y: 2, shape: "HORIZONTAL_3", color: "yellow", dotColor: "green", targetEdge: "right", dotTargetEdge: "bottom", dotAtEdge: false },
    { id: 4, x: 2, y: 6, shape: "VERTICAL_2", color: "green", dotColor: "red", targetEdge: "bottom", dotTargetEdge: "top", dotAtEdge: false },
    { id: 5, x: 7, y: 0, shape: "SINGLE", color: "red", dotColor: "teal", targetEdge: "top", dotTargetEdge: "left", dotAtEdge: false },
  ],
];

// Helper function to generate a random piece
const generateRandomPiece = (id, occupied) => {
  const shapeKeys = Object.keys(SHAPES);
  let validPlacementFound = false;
  let piece = null;
  
  let attempts = 0;
  while (!validPlacementFound && attempts < 100) {
    attempts++;
    
    // Select random shape and color
    const shapeKey = shapeKeys[Math.floor(Math.random() * shapeKeys.length)];
    const shape = SHAPES[shapeKey];
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    
    // Try random position
    const x = Math.floor(Math.random() * BOARD_SIZE);
    const y = Math.floor(Math.random() * BOARD_SIZE);
    
    // Check if all cells of this shape are within board and unoccupied
    const cells = shape.cells.map(([dx, dy]) => ({ x: x + dx, y: y + dy }));
    const isValid = cells.every(cell => 
      cell.x >= 0 && cell.x < BOARD_SIZE && 
      cell.y >= 0 && cell.y < BOARD_SIZE && 
      !occupied[cell.y][cell.x]
    );
    
    if (isValid) {
      validPlacementFound = true;
      // Assign different colors for shape and dot
      // Make sure dot color is different from shape color
      const availableColors = COLORS.filter(c => c !== color);
      const dotColor = availableColors[Math.floor(Math.random() * availableColors.length)];
      
      // Assign different target edges for shape and dot
      const edges = ["top", "right", "bottom", "left"];
      const targetEdge = edges[Math.floor(Math.random() * 4)];
      // Make sure dot target edge is different from shape target edge
      const availableEdges = edges.filter(e => e !== targetEdge);
      const dotTargetEdge = availableEdges[Math.floor(Math.random() * availableEdges.length)];
      
      piece = { 
        id, 
        x, 
        y, 
        shape: shapeKey, 
        color,
        dotColor,
        targetEdge,
        dotTargetEdge,
        dotAtEdge: false
      };      
      // Mark cells as occupied
      cells.forEach(cell => {
        occupied[cell.y][cell.x] = true;
      });
    }
  }
  
  return piece;
};

// Function to generate random level
const generateRandomLevel = () => {
  const pieces = [];
  const occupied = Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(false));
  
  // Add 4-6 random pieces
  const numPieces = Math.floor(Math.random() * 3) + 4; // 4-6 pieces
  
  for (let i = 0; i < numPieces; i++) {
    const piece = generateRandomPiece(i + 1, occupied);
    if (piece) {
      pieces.push(piece);
    }
  }
  
  return pieces;
};

// Function to get cell coordinates for a piece
const getPieceCells = (piece) => {
  const shape = SHAPES[piece.shape];
  if (!shape) {
    console.error(`Shape not found for piece ${piece.id}: ${piece.shape}`);
    return [];
  }
  
  // Map each relative cell position to absolute board coordinates
  return shape.cells.map(([dx, dy]) => {
    const absoluteX = piece.x + dx;
    const absoluteY = piece.y + dy;
    
    // Ensure coordinates are valid (in bounds)
    if (absoluteX < 0 || absoluteX >= BOARD_SIZE || absoluteY < 0 || absoluteY >= BOARD_SIZE) {
      console.warn(`Cell (${absoluteX}, ${absoluteY}) for piece ${piece.id} is out of bounds!`);
    }
    
    return { 
      x: absoluteX, 
      y: absoluteY 
    };
  });
};

// Function to check if a piece's dot is at the target edge
const isDotAtTargetEdge = (piece) => {
  // Get shape definition - The dot is always the first cell in the cells array
  const shape = SHAPES[piece.shape];
  if (!shape) {
    console.error(`Shape not found for piece ${piece.id}: ${piece.shape}`);
    return false;
  }
  
  // Get the location of the first cell (dot) within the shape
  const [dotDx, dotDy] = shape.cells[0];
  
  // Get the absolute position of the dot
  const dotX = piece.x + dotDx;
  const dotY = piece.y + dotDy;
  
  let result = false;
  
  // Check if the dot is at the matching edge - use dotTargetEdge instead of targetEdge
  if (piece.dotTargetEdge === "top" && dotY === 0) {
    result = true;
  } 
  else if (piece.dotTargetEdge === "right" && dotX === BOARD_SIZE - 1) {
    result = true;
  }
  else if (piece.dotTargetEdge === "bottom" && dotY === BOARD_SIZE - 1) {
    result = true;
  }
  else if (piece.dotTargetEdge === "left" && dotX === 0) {
    result = true;
  }
  
  // Debug log
  console.log(`Piece ${piece.id} DOT EDGE CHECK: position (${dotX},${dotY}), dot target edge: ${piece.dotTargetEdge}, result: ${result ? "AT EDGE" : "not at edge"}`);
  
  return result;
};

// Function to check if all cells of the piece are at the target edge
const isFullyAtTargetEdge = (piece) => {
  try {
    // Get the shape definition
    const shape = SHAPES[piece.shape];
    if (!shape) {
      console.error(`❌ Shape not found for piece ${piece.id}: ${piece.shape}`);
      console.error(`Available shapes: ${Object.keys(SHAPES).join(', ')}`);
      return false;
    }
    
    // Get the piece cells with absolute coordinates
    const cells = getPieceCells(piece);
    if (!cells || cells.length === 0) {
      console.error(`❌ No cells found for piece ${piece.id}`);
      return false;
    }
    
    const targetEdge = piece.targetEdge;
    
    // Log the piece details with enhanced debugging
    console.log(`\n🔍 CHECKING IF PIECE CAN EXIT:`);
    console.log(`Piece ID: ${piece.id}`);
    console.log(`Shape: ${piece.shape}`);
    console.log(`Original shape definition: ${JSON.stringify(shape.cells)}`);
    console.log(`Position: (${piece.x}, ${piece.y})`);
    console.log(`Target edge: ${targetEdge}`);
    console.log(`Dot activated: ${piece.dotAtEdge ? 'YES' : 'NO'}`);
    console.log(`Absolute cell coordinates: ${JSON.stringify(cells)}`);
    
    // For each cell, check if it's at the target edge with enhanced logging
    console.log(`\nChecking each cell against target edge ${targetEdge}:`);
    
    // RESTORED: Proper two-phase system
    // Phase 1: Dot reaches edge and glows
    // Phase 2: All cells of the piece's color must be at the target edge to exit
    
    // Check if all cells are at the target edge
    let allCellsAtEdge = true;
    
    for (const cell of cells) {
      let isAtEdge = false;
      
      if (targetEdge === "top") {
        isAtEdge = cell.y === 0;
      } 
      else if (targetEdge === "right") {
        isAtEdge = cell.x === BOARD_SIZE - 1;
      }
      else if (targetEdge === "bottom") {
        isAtEdge = cell.y === BOARD_SIZE - 1;
      }
      else if (targetEdge === "left") {
        isAtEdge = cell.x === 0;
      }
      
      console.log(`Cell at (${cell.x}, ${cell.y}): ${isAtEdge ? '✅ AT EDGE' : '❌ NOT AT EDGE'} - Target Edge: ${targetEdge}`);
      
      if (!isAtEdge) {
        allCellsAtEdge = false;
      }
    }
    
    // Final result with detailed information
    console.log(`\nFinal result for piece ${piece.id}: ${allCellsAtEdge ? '✅ CAN EXIT' : '❌ CANNOT EXIT YET'}`);
    console.log(`Shape: ${piece.shape}, Position: (${piece.x}, ${piece.y}), DotAtEdge: ${piece.dotAtEdge}`);
    console.log(`Shape definition contains ${shape.cells.length} cells, Actual cells: ${cells.length}`);
    
    return allCellsAtEdge;
  } catch (error) {
    console.error(`❌ Error in isFullyAtTargetEdge: ${error}`);
    console.error(`Failed for piece: ${JSON.stringify(piece)}`);
    return false;
  }
};

// Function to check if a piece can exit (two-phase system)
const canPieceExit = (piece) => {
  // First phase: the dot must reach the target edge (and be activated)
  // Second phase: all cells must be at the target edge
  
  // If dot is not yet activated
  if (!piece.dotAtEdge) {
    // Check if it should be activated
    return isDotAtTargetEdge(piece);
  }
  
  // If dot is already activated, check if all cells are at edge
  console.log(`Can piece ${piece.id} exit? Dot is activated, checking cells...`);
  const result = isFullyAtTargetEdge(piece);
  console.log(`Exit check result: ${result}`);
  return result;
};

export function CarPuzzleGame() {
  const navigate = useNavigate();
  const [levelIndex, setLevelIndex] = useState(0);
  const [pieces, setPieces] = useState(baseLevels[0]);
  const [exitedPieces, setExitedPieces] = useState([]);
  const [timer, setTimer] = useState(180);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [moveHistory, setMoveHistory] = useState([]);
  const [boardState, setBoardState] = useState([]);
  const [rotationMode, setRotationMode] = useState(false);
  const [showDotTutorial, setShowDotTutorial] = useState(false);

  // Initialize the board state
  useEffect(() => {
    // Every time pieces change, make sure board state is updated
    updateBoardState();
  }, [pieces]);
  
  // Load the level
  useEffect(() => {
    console.log(`Loading level ${levelIndex}`);
    const loadLevel = () => {
      // Copy the base level pieces and ensure all dots start not at edge
      const newPieces = baseLevels[levelIndex].map(piece => ({
        ...piece,
        dotAtEdge: false // Force this to be false on level load
      }));
      
      // Clear any previous state
      setBoardState([]);
      setExitedPieces([]);
      setSelectedPiece(null);
      setShowDotTutorial(false);
      setMoveHistory([]);
      
      // Set the new pieces
      setPieces(newPieces);
      
      // Force a board state update after a slight delay
      setTimeout(() => {
        updateBoardState();
      }, 100);
    };
    
    loadLevel();
  }, [levelIndex]);

  // Timer effect
  useEffect(() => {
    const countdown = setInterval(() => {
      setTimer((prev) => {
        if (prev === 1) clearInterval(countdown);
        return prev > 0 ? prev - 1 : 0;
      });
    }, 1000);
    return () => clearInterval(countdown);
  }, [levelIndex]);

  // Function to update the board state
  const updateBoardState = () => {
    // Create empty board
    const board = Array.from({ length: BOARD_SIZE }, () => 
      Array(BOARD_SIZE).fill(null)
    );
    
    // Fill in pieces
    pieces.forEach(piece => {
      if (!exitedPieces.includes(piece.id)) {
        const cells = getPieceCells(piece);
        cells.forEach(cell => {
          if (cell.x >= 0 && cell.x < BOARD_SIZE && cell.y >= 0 && cell.y < BOARD_SIZE) {
            board[cell.y][cell.x] = piece.id;
          }
        });
      }
    });
    
    setBoardState(board);
  };

  // Function to reset the level
  const resetLevel = () => {
    const level = levelIndex < baseLevels.length ? baseLevels[levelIndex] : generateRandomLevel();
    // Ensure all pieces have dotAtEdge set to false
    setPieces(level.map(piece => ({ ...piece, dotAtEdge: false })));
    setExitedPieces([]);
    setTimer(180);
    setMoveHistory([]);
    setSelectedPiece(null);
  };

  // Function to go to next level
  const nextLevel = () => {
    const next = levelIndex + 1;
    
    // Check if player has completed all predefined levels
    if (next >= baseLevels.length) {
      // Player has completed all levels, go to win screen
      localStorage.setItem('lastGamePath', '/car-puzzle');
      navigate('/win');
      return;
    }
    
    const level = baseLevels[next];
    setLevelIndex(next);
    // Ensure all pieces have dotAtEdge set to false
    setPieces(level.map(piece => ({ ...piece, dotAtEdge: false })));
    setExitedPieces([]);
    setTimer(180);
    setMoveHistory([]);
    setSelectedPiece(null);
    
    // Add a coupon when completing a level
    const gameStore = useGameStore;
    if (gameStore && gameStore.getState && gameStore.getState().addCoupon) {
      gameStore.getState().addCoupon('carPuzzle', next);
    }
  };
  
  // Function to undo the last move
  const undoMove = () => {
    if (moveHistory.length > 0) {
      const lastMove = moveHistory[moveHistory.length - 1];
      
      setPieces(prevPieces => 
        prevPieces.map(piece => {
          if (piece.id === lastMove.pieceId) {
            // Handle rotation undo
            if (lastMove.rotation) {
              // When undoing rotation, preserve dotAtEdge flag
              return { 
                ...piece, 
                shape: lastMove.fromShape
                // Keep the existing dotAtEdge value
              };
            }
            // Handle movement undo
            else {
              // When undoing movement, preserve dotAtEdge flag
              return { 
                ...piece, 
                x: lastMove.fromX, 
                y: lastMove.fromY
                // Keep the existing dotAtEdge value
              };
            }
          }
          return piece;
        })
      );
      
      setMoveHistory(prev => prev.slice(0, -1));
    }
  };

  // Function to check if move is valid
  const isValidMove = (pieceId, newX, newY) => {
    const piece = pieces.find(p => p.id === pieceId);
    if (!piece) return false;
    
    const shape = SHAPES[piece.shape];
    if (!shape) {
      console.error(`Shape not found for piece ${pieceId}: ${piece.shape}`);
      return false;
    }
    
    // Get the cells in the new position
    const newCells = shape.cells.map(([dx, dy]) => ({ 
      x: newX + dx, 
      y: newY + dy 
    }));
    
    // Log the movement attempt for debugging
    console.log(`Moving piece ${pieceId} to (${newX}, ${newY}):`, newCells);
    
    // Check if all cells are within bounds
    const withinBounds = newCells.every(cell => 
      cell.x >= 0 && cell.x < BOARD_SIZE && 
      cell.y >= 0 && cell.y < BOARD_SIZE
    );
    
    if (!withinBounds) {
      console.log(`Move rejected: Out of bounds`);
      return false;
    }
    
    // Check for collisions with other pieces
    const validMove = newCells.every(cell => {
      // If the cell is out of bounds, it's not valid (redundant check, but kept for safety)
      if (cell.x < 0 || cell.x >= BOARD_SIZE || cell.y < 0 || cell.y >= BOARD_SIZE) {
        return false;
      }
      
      // Check if the cell is occupied by another piece
      const occupyingPieceId = boardState[cell.y]?.[cell.x];
      return occupyingPieceId === null || occupyingPieceId === pieceId;
    });
    
    console.log(`Move ${validMove ? 'accepted' : 'rejected'}: ${validMove ? 'No collisions' : 'Collision detected'}`);
    return validMove;
  };

  // Function to move a piece
  const movePiece = (pieceId, deltaX, deltaY) => {
    setPieces(prevPieces => {
      const newPieces = prevPieces.map(piece => {
        if (piece.id !== pieceId) return piece;
        
        const newX = piece.x + deltaX;
        const newY = piece.y + deltaY;
        
        // Check if move is valid
        if (isValidMove(pieceId, newX, newY)) {
          // Record this move in history
          setMoveHistory(prev => [...prev, { 
            pieceId, 
            fromX: piece.x, 
            fromY: piece.y,
            toX: newX,
            toY: newY
          }]);
          
          // When moving a piece, preserve the dotAtEdge flag state
          // This ensures once a dot has reached the edge, it stays "activated"
          return { 
            ...piece, 
            x: newX, 
            y: newY
            // Keep the existing dotAtEdge value
          };
        }
        
        return piece;
      });
      
      return newPieces;
    });
  };


  // Helper function to dump all shapes for debugging
  const debugDumpShapes = useCallback(() => {
    console.log("===== ALL SHAPE DEFINITIONS =====");
    Object.keys(SHAPES).forEach(key => {
      console.log(`Shape ${key}:`, SHAPES[key]);
    });
    console.log("================================");
  }, []);
  
  // Process move and update state
  const processMoveAndUpdateState = useCallback(() => {
    // Debug: dump all shapes to verify they're defined correctly
    debugDumpShapes();
    
    // Debug: current state of the board
    console.log("\n📊 CURRENT GAME STATE:");
    console.log("Current pieces:", pieces.map(p => 
      `ID: ${p.id}, Shape: ${p.shape}, Pos: (${p.x},${p.y}), DotAtEdge: ${p.dotAtEdge}`
    ));
    console.log("Exited pieces:", exitedPieces);
    console.log("Move history length:", moveHistory.length);
    
    // First pass: Check which dots have newly reached edges (only activates, never deactivates)
    const piecesWithDotsAtEdge = pieces.filter(piece => {
      // Skip pieces that have already exited
      if (exitedPieces.includes(piece.id)) {
        console.log(`Skipping piece ${piece.id} - already exited`);
        return false;
      }
      
      // Skip pieces whose dot is already activated
      if (piece.dotAtEdge) {
        console.log(`Skipping dot check for piece ${piece.id} - dot already activated`);
        return false;
      }
      
      // Check if dot has reached the target edge
      const reachedEdge = isDotAtTargetEdge(piece);
      if (reachedEdge) {
        console.log(`🎯 Piece ${piece.id} dot has reached target edge ${piece.targetEdge}`);
      }
      return reachedEdge;
    });
    
    // If we have pieces that need their dots marked as at edge
    if (piecesWithDotsAtEdge.length > 0) {
      console.log(`\n✨ DOTS REACHED TARGET EDGE: ${piecesWithDotsAtEdge.map(p => p.id).join(', ')}`);
      
      // Update all pieces in one go
      const updatedPieces = pieces.map(piece => {
        const shouldUpdateDot = piecesWithDotsAtEdge.some(p => p.id === piece.id);
        return shouldUpdateDot ? { ...piece, dotAtEdge: true } : piece;
      });
      
      // Show tutorial if this is the first dot to reach edge
      if (!showDotTutorial && !pieces.some(p => p.dotAtEdge)) {
        setShowDotTutorial(true);
        setTimeout(() => setShowDotTutorial(false), 6000);
      }
      
      // Update pieces and exit this function to avoid processing exits in the same cycle
      setPieces(updatedPieces);
      return;
    }
    
    // Second pass: Always check for pieces that can exit
    console.log("\n🚪 CHECKING FOR PIECES THAT CAN EXIT...");
    
    // Check each piece individually and log results
    let piecesToExit = [];
    
    // Find pieces with activated dots that haven't exited yet
    const activatedPieces = pieces.filter(p => 
      !exitedPieces.includes(p.id) && p.dotAtEdge
    );
    
    console.log(`Found ${activatedPieces.length} pieces with activated dots:`);
    activatedPieces.forEach(p => {
      console.log(`- Piece ${p.id} (${p.shape}) at (${p.x}, ${p.y}) targeting ${p.targetEdge}`);
      
      // Also verify shape definition exists
      const shape = SHAPES[p.shape];
      if (!shape) {
        console.error(`❌ WARNING: Shape definition missing for ${p.shape}!`);
      } else {
        console.log(`  Shape has ${shape.cells.length} cells: ${JSON.stringify(shape.cells)}`);
      }
    });
    
    // Clear detection state for this cycle
    window._debugCellsByPiece = {};
    
    // For each piece with activated dot, check if it can exit
    for (const piece of activatedPieces) {
      console.log(`\n📍 Checking piece ${piece.id} (${piece.shape}) for exit...`);
      
      // Get shape definition
      const shape = SHAPES[piece.shape];
      if (!shape) {
        console.error(`❌ Shape definition missing for ${piece.shape}!`);
        console.error(`Available shapes: ${Object.keys(SHAPES).join(', ')}`);
        continue;
      }
      
      // Store debug info about each cell's position
      window._debugCellsByPiece[piece.id] = shape.cells.map(([dx, dy]) => ({
        relX: dx,
        relY: dy,
        absX: piece.x + dx,
        absY: piece.y + dy,
        isAtEdge: 
          (piece.targetEdge === "top" && piece.y + dy === 0) ||
          (piece.targetEdge === "right" && piece.x + dx === BOARD_SIZE - 1) ||
          (piece.targetEdge === "bottom" && piece.y + dy === BOARD_SIZE - 1) ||
          (piece.targetEdge === "left" && piece.x + dx === 0)
      }));
      
      // Check if piece can exit
      console.log(`Running full exit check for piece ${piece.id} (dot already activated)`);
      const canExit = isFullyAtTargetEdge(piece);
      
      console.log(`Exit check result for piece ${piece.id}: ${canExit ? '✅ CAN EXIT' : '❌ CANNOT EXIT YET'}`);
      
      if (canExit) {
        console.log(`✅ ADDING PIECE ${piece.id} TO EXIT LIST`);
        piecesToExit.push(piece);
      }
    }
    
    if (piecesToExit.length > 0) {
      console.log(`\n🏆 PIECES FULLY AT EDGE AND EXITING: ${piecesToExit.map(p => p.id).join(', ')}`);
      
      // Add the pieces to the exited list
      setExitedPieces(prev => {
        const newExitedPieces = [...prev, ...piecesToExit.map(p => p.id)];
        console.log(`Updated exited pieces list: ${newExitedPieces}`);
        return newExitedPieces;
      });
      
      // Force update board state after pieces exit
      setTimeout(() => {
        updateBoardState();
      }, 50);
    }
  }, [pieces, exitedPieces, showDotTutorial, debugDumpShapes, moveHistory]);
  
  // Trigger state updates after pieces change
  useEffect(() => {
    console.log("Triggering processMoveAndUpdateState");
    processMoveAndUpdateState();
  }, [processMoveAndUpdateState]);

  const allExited = exitedPieces.length === pieces.length;

  // Function to get gradient color based on piece color
  const getPieceGradient = (color) => {
    const colorMap = {
      "red": "from-red-500 to-red-600",
      "blue": "from-blue-500 to-blue-600",
      "green": "from-green-500 to-green-600",
      "yellow": "from-yellow-500 to-yellow-600",
      "purple": "from-purple-500 to-purple-600",
      "orange": "from-orange-500 to-orange-600",
      "teal": "from-teal-500 to-teal-600",
      "pink": "from-pink-500 to-pink-600"
    };
    
    return colorMap[color] || "from-gray-500 to-gray-600";
  };
  
  // Function to get dot color based on piece dotColor
  const getDotGradient = (dotColor) => {
    const colorMap = {
      "red": "from-red-400 to-red-500",
      "blue": "from-blue-400 to-blue-500",
      "green": "from-green-400 to-green-500",
      "yellow": "from-yellow-400 to-yellow-500",
      "purple": "from-purple-400 to-purple-500",
      "orange": "from-orange-400 to-orange-500",
      "teal": "from-teal-400 to-teal-500",
      "pink": "from-pink-400 to-pink-500"
    };
    
    return colorMap[dotColor] || "from-white to-gray-200";
  };

  // Function to get edge color
  const getEdgeColor = (edge) => {
    const colorMap = {
      "top": "#ef4444", // red
      "right": "#3b82f6", // blue
      "bottom": "#22c55e", // green
      "left": "#eab308", // yellow
    };
    
    return colorMap[edge] || "#6b7280"; // gray default
  };

  // Function to rotate a shape's cells (90 degrees clockwise)
  const rotateCells = (cells) => {
    if (!cells || cells.length === 0) {
      console.error("❌ Cannot rotate empty cells array");
      return cells;
    }
    
    console.log(`\n🔄 ROTATING CELLS: ${JSON.stringify(cells)}`);
    
    // Find the minimum and maximum coordinates to determine the bounding box
    const minX = Math.min(...cells.map(([x]) => x));
    const maxX = Math.max(...cells.map(([x]) => x));
    const minY = Math.min(...cells.map(([_, y]) => y));
    const maxY = Math.max(...cells.map(([_, y]) => y));
    
    // Calculate the center of rotation
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    
    console.log(`Bounding box: (${minX},${minY}) to (${maxX},${maxY})`);
    console.log(`Center of rotation: (${centerX},${centerY})`);
    
    // Rotate each cell 90 degrees clockwise around the center
    const rotatedCells = cells.map(([x, y], index) => {
      // Translate to origin
      const relX = x - centerX;
      const relY = y - centerY;
      
      // Rotate 90 degrees clockwise: (x, y) -> (y, -x)
      const rotX = relY;
      const rotY = -relX;
      
      // Translate back and round to nearest integer
      const finalX = Math.round(rotX + centerX);
      const finalY = Math.round(rotY + centerY);
      
      console.log(`Cell ${index}: (${x},${y}) -> (${finalX},${finalY})`);
      
      return [finalX, finalY];
    });
    
    // Important: Ensure the first cell (dot) is always first in the array!
    console.log(`Rotated cells: ${JSON.stringify(rotatedCells)}`);
    
    return rotatedCells;
  };
  
  // Function to check if a rotation is valid
  const isValidRotation = (pieceId) => {
    const piece = pieces.find(p => p.id === pieceId);
    if (!piece) {
      console.error(`Piece ${pieceId} not found for rotation validation`);
      return false;
    }
    
    // Get the original shape
    const originalShape = SHAPES[piece.shape];
    if (!originalShape) {
      console.error(`Shape ${piece.shape} not found for piece ${pieceId}`);
      return false;
    }
    
    // Create a rotated version of the shape
    const rotatedCells = rotateCells(originalShape.cells);
    
    console.log(`Validating rotation for piece ${pieceId} at (${piece.x}, ${piece.y})`);
    console.log(`Original cells: ${JSON.stringify(originalShape.cells)}`);
    console.log(`Rotated cells: ${JSON.stringify(rotatedCells)}`);
    
    // Check if all rotated cells would be within bounds and not colliding
    let isValid = true;
    
    for (const [dx, dy] of rotatedCells) {
      const newX = piece.x + dx;
      const newY = piece.y + dy;
      
      // Check boundaries
      if (newX < 0 || newX >= BOARD_SIZE || newY < 0 || newY >= BOARD_SIZE) {
        console.log(`Cell (${newX}, ${newY}) would be out of bounds after rotation`);
        isValid = false;
        break;
      }
      
      // Check collisions with other pieces (if we have a board state)
      if (boardState && boardState[newY] && boardState[newY][newX] !== null && boardState[newY][newX] !== piece.id) {
        console.log(`Cell (${newX}, ${newY}) would collide with piece ${boardState[newY][newX]} after rotation`);
        isValid = false;
        break;
      }
    }
    
    console.log(`Rotation validation result: ${isValid ? 'VALID' : 'INVALID'}`);
    return isValid;
  };
  
  // Function to rotate a piece
  const rotatePiece = (pieceId) => {
    // Check if rotation is valid before proceeding
    if (!isValidRotation(pieceId)) {
      console.log(`Invalid rotation for piece ${pieceId}`);
      return;
    }
    
    setPieces(prevPieces => {
      const newPieces = prevPieces.map(piece => {
        if (piece.id !== pieceId) return piece;
        
        // Get the original shape and create a new rotated shape
        const originalShape = SHAPES[piece.shape];
        if (!originalShape) {
          console.error(`Original shape not found for piece ${pieceId}: ${piece.shape}`);
          return piece; // Return piece unchanged if we can't find its shape
        }
        
        // Rotate the cells
        const rotatedCells = rotateCells(originalShape.cells);
        
        // Extract the base shape name (removing rotation suffix if present)
        const baseShapeName = piece.shape.split('_ROTATED_')[0];
        
        // Create a more consistent key for the rotated shape based on rotation count
        // This makes rotation keys more predictable and debuggable
        let rotationCount = 1;
        if (piece.shape.includes('_ROTATED_')) {
          const existingCount = parseInt(piece.shape.split('_ROTATED_')[1]) || 0;
          rotationCount = (existingCount % 4) + 1; // Cycle through 1-4 (90°, 180°, 270°, 360°/0°)
        }
        
        const rotatedShapeKey = `${baseShapeName}_ROTATED_${rotationCount}`;
        
        // Make a complete copy of the original shape with the rotated cells
        SHAPES[rotatedShapeKey] = {
          cells: rotatedCells,
          name: `${originalShape.name} (Rotated ${rotationCount * 90}°)`,
          color: originalShape.color
        };
        
        // Log the rotation for debugging and verification
        console.log(`\n=== ROTATION DETAILS ===`);
        console.log(`Rotating piece ${pieceId} (${piece.shape}):`);
        console.log(`Original shape:`, originalShape);
        console.log(`Original cells: ${JSON.stringify(originalShape.cells)}`);
        console.log(`Rotated cells: ${JSON.stringify(rotatedCells)}`);
        console.log(`Base shape name: ${baseShapeName}`);
        console.log(`Rotation count: ${rotationCount}`);
        console.log(`New shape key: ${rotatedShapeKey}`);
        console.log(`New shape definition:`, SHAPES[rotatedShapeKey]);
        console.log(`========================`);
        
        // Record this rotation in history for undo functionality
        setMoveHistory(prev => [...prev, { 
          pieceId, 
          fromShape: piece.shape,
          toShape: rotatedShapeKey,
          rotation: true
        }]);
        
        // Return the piece with the new shape key but preserve other state like dotAtEdge
        return { 
          ...piece, 
          shape: rotatedShapeKey,
          // Explicitly preserving the dotAtEdge flag to ensure it doesn't get lost during rotation
          dotAtEdge: piece.dotAtEdge
        };
      });
      
      // Before returning, verify none of the shapes were lost
      newPieces.forEach(piece => {
        if (!SHAPES[piece.shape]) {
          console.error(`CRITICAL ERROR: Shape ${piece.shape} not found for piece ${piece.id} after rotation!`);
        } else {
          console.log(`✓ Verified shape ${piece.shape} exists for piece ${piece.id} after rotation`);
          console.log(`Shape cells: ${JSON.stringify(SHAPES[piece.shape].cells)}`);
        }
      });
      
      return newPieces;
    });
  };
  
  // Function to toggle rotation mode
  const toggleRotationMode = () => {
    setRotationMode(!rotationMode);
  };
  
  // Function to handle piece selection
  const handlePieceClick = (pieceId) => {
    if (rotationMode) {
      if (selectedPiece === pieceId) {
        rotatePiece(pieceId);
      } else {
        setSelectedPiece(pieceId);
      }
    } else {
      setSelectedPiece(selectedPiece === pieceId ? null : pieceId);
    }
  };

  // Handle key press for movement
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!selectedPiece) return;
      
      switch (e.key) {
        case "ArrowUp":
          movePiece(selectedPiece, 0, -1);
          break;
        case "ArrowRight":
          movePiece(selectedPiece, 1, 0);
          break;
        case "ArrowDown":
          movePiece(selectedPiece, 0, 1);
          break;
        case "ArrowLeft":
          movePiece(selectedPiece, -1, 0);
          break;
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedPiece]);

  // Helper function to provide game instructions based on state
  const getInstructions = () => {
    const dotsActive = pieces.some(p => p.dotAtEdge && !exitedPieces.includes(p.id));
    
    if (!dotsActive) {
      return "Phase 1: Move a piece so its DOT reaches the MATCHING COLOR EDGE!";
    } else {
      return "Phase 2: Now align ALL CELLS of the piece with its TARGET EDGE!";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-blue-900 flex flex-col items-center justify-center py-8 px-4">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="bg-white/5 backdrop-blur-md rounded-t-2xl p-4 shadow-lg">
          <div className="flex justify-between items-center">
            <motion.div 
              className="flex items-center gap-2 bg-blue-600/20 py-2 px-4 rounded-full text-blue-50"
              whileHover={{ scale: 1.05 }}
            >
              <span className="text-yellow-400">⭐</span>
              <span className="font-bold">Level {levelIndex + 1}</span>
            </motion.div>
            
            <motion.div 
              className="flex items-center gap-2 bg-green-600/20 py-2 px-4 rounded-full text-green-50"
              whileHover={{ scale: 1.05 }}
            >
              <span className="text-green-400">🧩</span>
              <span className="font-bold">{exitedPieces.length}/{pieces.length}</span>
            </motion.div>
            
            <motion.div 
              className="flex items-center gap-2 py-2 px-4 rounded-full text-purple-50"
              style={{ 
                backgroundColor: pieces.some(p => p.dotAtEdge && !exitedPieces.includes(p.id)) 
                  ? "rgba(147, 51, 234, 0.4)" 
                  : "rgba(147, 51, 234, 0.2)" 
              }}
              whileHover={{ scale: 1.05 }}
              animate={pieces.some(p => p.dotAtEdge && !exitedPieces.includes(p.id)) ? {
                scale: [1, 1.05, 1],
                backgroundColor: [
                  "rgba(147, 51, 234, 0.4)", 
                  "rgba(147, 51, 234, 0.5)", 
                  "rgba(147, 51, 234, 0.4)"
                ]
              } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {pieces.some(p => p.dotAtEdge && !exitedPieces.includes(p.id)) ? (
                <>
                  <span className="text-purple-200">✨</span>
                  <span className="font-bold">{pieces.filter(p => p.dotAtEdge && !exitedPieces.includes(p.id)).length} Dots Ready</span>
                </>
              ) : (
                <>
                  <span className="text-purple-400">✨</span>
                  <span className="font-bold">0 Dots Ready</span>
                </>
              )}
            </motion.div>
            
            <motion.div 
              className={`flex items-center gap-2 ${timer < 30 ? 'bg-red-600/40' : 'bg-purple-600/20'} py-2 px-4 rounded-full ${timer < 30 ? 'text-red-50' : 'text-purple-50'}`}
              whileHover={{ scale: 1.05 }}
              animate={timer < 30 ? { scale: [1, 1.05, 1], transition: { repeat: Infinity, duration: 1 } } : {}}
            >
              <span>⏱️</span>
              <span className="font-bold">{timer}s</span>
            </motion.div>
          </div>
        </div>
        
        <motion.div 
          className="relative grid grid-cols-8 grid-rows-8 gap-0.5 w-full max-w-[320px] h-[320px] border-4 border-blue-700/50 shadow-lg shadow-blue-900/30 bg-gradient-to-br from-gray-900 to-gray-800 rounded-b-2xl mx-auto"
          whileHover={{ boxShadow: "0px 0px 15px rgba(59, 130, 246, 0.5)" }}
        >
          {/* Game board edges (targets) - simplified */}
          {/* Top edge - Shape targets (Left Half) */}
          <div
            className="absolute top-0 left-0 w-1/2 h-3 z-10 border-r border-white/30"
            style={{ 
              backgroundColor: "#ef4444", // red - SHAPE TARGET
              boxShadow: pieces.some(p => p.targetEdge === "top" && p.dotAtEdge) 
                ? "0 0 10px 4px rgba(239, 68, 68, 0.7)" 
                : "none"
            }}
          />
          
          {/* Top edge - Dot targets (Right Half) */}
          <div
            className="absolute top-0 right-0 w-1/2 h-3 z-10"
            style={{ 
              backgroundColor: "#3b82f6", // blue - DOT TARGET
              boxShadow: pieces.some(p => p.dotTargetEdge === "top")
                ? "0 0 10px 4px rgba(59, 130, 246, 0.7)"
                : "none"
            }}
          />
          
          {/* Right edge - Shape targets (Top Half) */}
          <div
            className="absolute top-0 right-0 h-1/2 w-3 z-10 border-b border-white/30"
            style={{ 
              backgroundColor: "#3b82f6", // blue - SHAPE TARGET
              boxShadow: pieces.some(p => p.targetEdge === "right" && p.dotAtEdge)
                ? "0 0 10px 4px rgba(59, 130, 246, 0.7)"
                : "none"
            }}
          />
          
          {/* Right edge - Dot targets (Bottom Half) */}
          <div
            className="absolute bottom-0 right-0 h-1/2 w-3 z-10"
            style={{ 
              backgroundColor: "#eab308", // yellow - DOT TARGET
              boxShadow: pieces.some(p => p.dotTargetEdge === "right")
                ? "0 0 10px 4px rgba(234, 179, 8, 0.7)"
                : "none"
            }}
          />
          
          {/* Bottom edge - Shape targets (Right Half) */}
          <div
            className="absolute bottom-0 right-0 w-1/2 h-3 z-10 border-l border-white/30"
            style={{ 
              backgroundColor: "#22c55e", // green - SHAPE TARGET
              boxShadow: pieces.some(p => p.targetEdge === "bottom" && p.dotAtEdge)
                ? "0 0 10px 4px rgba(34, 197, 94, 0.7)"
                : "none"
            }}
          />
          
          {/* Bottom edge - Dot targets (Left Half) */}
          <div
            className="absolute bottom-0 left-0 w-1/2 h-3 z-10"
            style={{ 
              backgroundColor: "#ef4444", // red - DOT TARGET
              boxShadow: pieces.some(p => p.dotTargetEdge === "bottom")
                ? "0 0 10px 4px rgba(239, 68, 68, 0.7)"
                : "none"
            }}
          />
          
          {/* Left edge - Shape targets (Bottom Half) */}
          <div
            className="absolute bottom-0 left-0 h-1/2 w-3 z-10 border-t border-white/30"
            style={{ 
              backgroundColor: "#eab308", // yellow - SHAPE TARGET
              boxShadow: pieces.some(p => p.targetEdge === "left" && p.dotAtEdge)
                ? "0 0 10px 4px rgba(234, 179, 8, 0.7)"
                : "none"
            }}
          />
          
          {/* Left edge - Dot targets (Top Half) */}
          <div
            className="absolute top-0 left-0 h-1/2 w-3 z-10"
            style={{ 
              backgroundColor: "#22c55e", // green - DOT TARGET
              boxShadow: pieces.some(p => p.dotTargetEdge === "left")
                ? "0 0 10px 4px rgba(34, 197, 94, 0.7)"
                : "none"
            }}
          />
          
          {/* Show grid cells */}
          {Array.from({ length: BOARD_SIZE * BOARD_SIZE }).map((_, idx) => {
            const x = idx % BOARD_SIZE;
            const y = Math.floor(idx / BOARD_SIZE);
            return (
              <div 
                key={`cell-${x}-${y}`}
                className="border border-gray-800/30"
                style={{
                  width: TILE_SIZE,
                  height: TILE_SIZE,
                  gridRow: y + 1,
                  gridColumn: x + 1,
                }}
              />
            );
          })}

          {/* Render game pieces */}
          {/* Remove overlay for pieces with dot at target edge - we're using a more subtle approach now */}

          <AnimatePresence>
            {pieces.map((piece) => {
              if (exitedPieces.includes(piece.id)) return null;
              
              const cells = getPieceCells(piece);
              const isSelected = selectedPiece === piece.id;
              const pieceGradient = getPieceGradient(piece.color);
              const targetEdgeColor = getEdgeColor(piece.targetEdge);
              
              return (
                <motion.div
                  key={piece.id}
                  className={`absolute rounded-md cursor-pointer transition-all ${isSelected ? 'ring-2 ring-white' : ''}`}
                  style={{
                    width: TILE_SIZE * (SHAPES[piece.shape].cells.reduce((max, [x]) => Math.max(max, x), 0) + 1),
                    height: TILE_SIZE * (SHAPES[piece.shape].cells.reduce((max, [_, y]) => Math.max(max, y), 0) + 1),
                    left: piece.x * TILE_SIZE,
                    top: piece.y * TILE_SIZE,
                    zIndex: isSelected ? 30 : 20,
                  }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ 
                    opacity: 1, 
                    scale: isSelected ? 1.05 : 1,
                    boxShadow: isSelected ? '0px 0px 10px rgba(255, 255, 255, 0.5)' : 'none'
                  }}
                  transition={{ duration: 0.3 }}
                  onClick={() => handlePieceClick(piece.id)}
                >
                  {cells.map(({x: cellX, y: cellY}, index) => {
                    const relX = cellX - piece.x;
                    const relY = cellY - piece.y;
                    
                    return (
                      <motion.div
                        key={`cell-${piece.id}-${index}`}
                        className={`absolute bg-gradient-to-br ${pieceGradient} rounded-md shadow-inner`}
                        style={{
                          width: TILE_SIZE - 4,
                          height: TILE_SIZE - 4,
                          left: relX * TILE_SIZE + 2,
                          top: relY * TILE_SIZE + 2,
                        }}
                      >
                        {index === 0 && (
                          <div 
                            className="absolute inset-0 flex items-center justify-center text-white font-bold"
                            style={{ fontSize: '0.6rem' }}
                          >
                            <motion.div 
                              className="relative w-8 h-8 flex items-center justify-center"
                              animate={piece.dotAtEdge ? { 
                                rotate: [0, 5, -5, 0],
                                scale: [1, 1.1, 1]
                              } : {}}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut"
                              }}
                            >
                              {/* Simple glow effect for dots at target edge */}
                              {piece.dotAtEdge && (
                                <div
                                  className="absolute rounded-full"
                                  style={{ 
                                    top: '-100%',
                                    left: '-100%',
                                    right: '-100%',
                                    bottom: '-100%',
                                    border: `2px solid ${targetEdgeColor}`,
                                    boxShadow: `0 0 12px 4px ${targetEdgeColor}`,
                                    opacity: 0.8
                                  }}
                                />
                              )}
                              
                              {/* Main dot - now use dotColor instead of targetEdgeColor */}
                              <motion.div 
                                className={`rounded-full bg-gradient-to-br ${getDotGradient(piece.dotColor)}`}
                                style={{ 
                                  width: piece.dotAtEdge ? '24px' : '20px',
                                  height: piece.dotAtEdge ? '24px' : '20px',
                                  boxShadow: piece.dotAtEdge ? 
                                    `0 0 10px 4px ${getEdgeColor(piece.dotTargetEdge)}` :
                                    'none',
                                  border: piece.dotAtEdge ? '2px solid white' : 'none',
                                  position: 'relative'
                                }}
                                animate={piece.dotAtEdge ? {
                                  scale: [1, 1.1, 1],
                                } : {}}
                                transition={{
                                  duration: 1,
                                  repeat: Infinity,
                                }}
                              >
                                {/* Center highlight */}
                                {piece.dotAtEdge && (
                                  <div 
                                    className="absolute inset-0 flex items-center justify-center text-white"
                                    style={{
                                      fontSize: '12px'
                                    }}
                                  >
                                    ✦
                                  </div>
                                )}
                              </motion.div>
                            </motion.div>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </motion.div>
              );
            })}
          </AnimatePresence>
          
          {/* Movement and rotation controls for selected piece */}
          {selectedPiece && (
            <div className="absolute inset-0 z-40 pointer-events-none">
              {/* Movement arrows (shown when not in rotation mode) */}
              {!rotationMode && [
                { direction: 'up', x: 0, y: -1, icon: '↑', className: 'top-0 left-1/2 transform -translate-x-1/2 -translate-y-full' },
                { direction: 'right', x: 1, y: 0, icon: '→', className: 'right-0 top-1/2 transform translate-x-full -translate-y-1/2' },
                { direction: 'down', x: 0, y: 1, icon: '↓', className: 'bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full' },
                { direction: 'left', x: -1, y: 0, icon: '←', className: 'left-0 top-1/2 transform -translate-x-full -translate-y-1/2' }
              ].map(({ direction, x, y, icon, className }) => {
                const selectedPieceObj = pieces.find(p => p.id === selectedPiece);
                const canMove = selectedPieceObj && isValidMove(selectedPiece, selectedPieceObj.x + x, selectedPieceObj.y + y);
                
                return (
                  <motion.div 
                    key={direction}
                    className={`absolute ${className} w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center pointer-events-auto cursor-pointer ${canMove ? 'text-white' : 'text-gray-500'}`}
                    whileHover={canMove ? { scale: 1.2, backgroundColor: 'rgba(255,255,255,0.2)' } : {}}
                    onClick={() => canMove && movePiece(selectedPiece, x, y)}
                  >
                    {icon}
                  </motion.div>
                );
              })}
              
              {/* Rotation button (shown in both modes) */}
              <motion.div 
                className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full ${rotationMode ? 'bg-purple-500/60' : 'bg-white/10'} backdrop-blur-sm flex items-center justify-center pointer-events-auto cursor-pointer z-50`}
                whileHover={{ scale: 1.1, backgroundColor: rotationMode ? 'rgba(168,85,247,0.7)' : 'rgba(255,255,255,0.2)' }}
                onClick={() => toggleRotationMode()}
              >
                <motion.div
                  animate={rotationMode ? { rotate: 360 } : { rotate: 0 }}
                  transition={{ duration: 1, repeat: rotationMode ? Infinity : 0 }}
                  className="text-white text-xl"
                >
                  🔄
                </motion.div>
              </motion.div>
              
              {/* Rotation indicator (shown only in rotation mode) */}
              {rotationMode && (
                <motion.div
                  className="absolute inset-0 rounded-md border-2 border-dashed pointer-events-none"
                  style={{ 
                    borderColor: 'rgba(168, 85, 247, 0.6)',
                  }}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ 
                    opacity: 1, 
                    scale: 1,
                    boxShadow: '0 0 15px rgba(168, 85, 247, 0.3)'
                  }}
                >
                  <div className="absolute top-0 left-0 w-full text-center text-purple-300 text-xs font-medium py-1 px-2 bg-purple-900/40 rounded-t-md backdrop-blur-sm">
                    Rotation Mode {isValidRotation(selectedPiece) ? '✓' : '✗'}
                  </div>
                  
                  {isValidRotation(selectedPiece) && (
                    <motion.div 
                      className="absolute bottom-0 left-0 w-full text-center text-purple-200 text-xs font-medium py-1 px-2 bg-purple-900/40 rounded-b-md backdrop-blur-sm"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      Click to rotate 90°
                    </motion.div>
                  )}
                </motion.div>
              )}
            </div>
          )}
        </motion.div>
      </motion.div>

      {allExited && (
        <motion.div 
          className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-50 rounded-b-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="bg-green-600/20 backdrop-blur-md p-6 rounded-2xl border border-green-500/30 shadow-lg shadow-green-500/20 max-w-xs w-full"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
          >
            <div className="flex flex-col items-center text-center">
              <motion.div 
                className="text-6xl mb-4"
                animate={{ 
                  rotate: [0, 10, -10, 10, 0],
                  scale: [1, 1.2, 1, 1.1, 1] 
                }}
                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
              >
                🎉
              </motion.div>
              <h2 className="text-2xl font-bold text-white mb-2">Level Complete!</h2>
              <p className="text-green-200 mb-2">You've mastered the two-phase exit strategy!</p>
              <p className="text-green-200 mb-6">All shapes have successfully exited the board.</p>
              <motion.button
                onClick={nextLevel}
                className="bg-gradient-to-r from-green-600 to-emerald-500 text-white py-3 px-8 rounded-full font-bold shadow-lg shadow-emerald-700/30"
                whileHover={{ scale: 1.05, boxShadow: "0px 5px 15px rgba(16, 185, 129, 0.4)" }}
                whileTap={{ scale: 0.98 }}
              >
                Next Level →
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {timer === 0 && !allExited && (
        <motion.div 
          className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-50 rounded-b-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="bg-red-600/20 backdrop-blur-md p-6 rounded-2xl border border-red-500/30 shadow-lg shadow-red-500/20 max-w-xs w-full"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
          >
            <div className="flex flex-col items-center text-center">
              <motion.div 
                className="text-6xl mb-4"
                animate={{
                  scale: [1, 1.2, 1]
                }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                ⏰
              </motion.div>
              <h2 className="text-2xl font-bold text-white mb-2">Time's Up!</h2>
              <p className="text-red-200 mb-2">Try again to solve the puzzle faster.</p>
              <p className="text-amber-200 text-sm mb-4">Remember: First get the DOT to its matching color edge, then move the entire SHAPE to its own color edge!</p>
              <motion.button
                onClick={resetLevel}
                className="bg-gradient-to-r from-red-600 to-orange-500 text-white py-3 px-8 rounded-full font-bold shadow-lg shadow-red-700/30"
                whileHover={{ scale: 1.05, boxShadow: "0px 5px 15px rgba(239, 68, 68, 0.4)" }}
                whileTap={{ scale: 0.98 }}
              >
                Try Again
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}

      <motion.div 
        className="mt-6 flex gap-4 flex-wrap justify-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <motion.button 
          onClick={resetLevel} 
          className="bg-gradient-to-r from-slate-700 to-slate-600 text-white px-4 py-2 rounded-xl shadow-lg"
          whileHover={{ scale: 1.05, boxShadow: "0px 5px 15px rgba(15, 23, 42, 0.3)" }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center gap-2">
            <span>🔄</span>
            <span>Reset</span>
          </div>
        </motion.button>
        
        <motion.button 
          onClick={undoMove}
          disabled={moveHistory.length === 0}
          className={`${moveHistory.length > 0 ? 'bg-gradient-to-r from-amber-600 to-amber-500' : 'bg-gradient-to-r from-gray-700 to-gray-600'} text-white px-4 py-2 rounded-xl shadow-lg`}
          whileHover={moveHistory.length > 0 ? { scale: 1.05, boxShadow: "0px 5px 15px rgba(217, 119, 6, 0.3)" } : {}}
          whileTap={moveHistory.length > 0 ? { scale: 0.98 } : {}}
        >
          <div className="flex items-center gap-2">
            <span>↩️</span>
            <span>Undo</span>
          </div>
        </motion.button>
        
        <motion.button 
          onClick={toggleRotationMode}
          className={`${rotationMode ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 ring-2 ring-white' : 'bg-gradient-to-r from-purple-700 to-purple-600'} text-white px-4 py-2 rounded-xl shadow-lg`}
          whileHover={{ scale: 1.05, boxShadow: "0px 5px 15px rgba(126, 34, 206, 0.3)" }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center gap-2">
            <motion.span
              animate={rotationMode ? { rotate: 360 } : { rotate: 0 }}
              transition={{ duration: 2, repeat: rotationMode ? Infinity : 0, ease: "linear" }}
            >
              🔄
            </motion.span>
            <span>{rotationMode ? "Exit Rotate" : "Rotate Mode"}</span>
          </div>
        </motion.button>
        
        {selectedPiece && (
          <motion.button 
            onClick={() => setSelectedPiece(null)}
            className="bg-gradient-to-r from-rose-700 to-rose-600 text-white px-4 py-2 rounded-xl shadow-lg"
            whileHover={{ scale: 1.05, boxShadow: "0px 5px 15px rgba(225, 29, 72, 0.3)" }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-2">
              <span>❌</span>
              <span>Deselect</span>
            </div>
          </motion.button>
        )}
        
        <motion.button 
          onClick={nextLevel} 
          className="bg-gradient-to-r from-blue-600 to-indigo-500 text-white px-4 py-2 rounded-xl shadow-lg"
          whileHover={{ scale: 1.05, boxShadow: "0px 5px 15px rgba(59, 130, 246, 0.3)" }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center gap-2">
            <span>⏩</span>
            <span>Skip Level</span>
          </div>
        </motion.button>
      </motion.div>
      
      <motion.div
        className="mt-4 p-4 bg-white/5 backdrop-blur-sm rounded-xl max-w-md w-full text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <motion.p 
          className="text-lg font-bold mb-3 py-2 px-4 rounded-lg bg-indigo-900/30 border border-indigo-500/20"
          animate={{ 
            scale: [1, 1.03, 1],
            backgroundColor: ["rgba(49, 46, 129, 0.3)", "rgba(79, 70, 229, 0.2)", "rgba(49, 46, 129, 0.3)"]
          }}
          transition={{ repeat: Infinity, duration: 3 }}
        >
          {getInstructions()}
        </motion.p>
        
        <p className="text-blue-200 text-sm mb-2">How to play:</p>
        <p className="text-white/70 text-xs mb-1">• Click a shape to select it</p>
        <p className="text-white/70 text-xs mb-1">• Use arrow keys or direction buttons to move</p>
        <p className="text-white/70 text-xs mb-1">• Toggle rotation mode to rotate shapes 90° clockwise</p>
        <p className="text-white/70 text-xs mb-1">• Each piece has a SHAPE COLOR and a DOT</p>
        <p className="text-white/70 text-xs mb-1">• First, move the SHAPE so its DOT reaches the matching COLOR EDGE</p>
        <p className="text-white text-xs font-bold mb-1 bg-gradient-to-r from-pink-500 to-purple-500 inline-block text-transparent bg-clip-text">• 💡 DOT GLOWS BRIGHTLY when it reaches the correct edge! 💡</p>
        <p className="text-white/70 text-xs mb-1">• Once the dot glows, move the ENTIRE SHAPE so ALL CELLS are at the edge</p>
        <p className="text-white/70 text-xs mb-1">• EXAMPLE: If a YELLOW SHAPE has a BLUE DOT, first put the DOT at the BLUE edge to make it glow</p>
        <p className="text-white/70 text-xs mb-1">• THEN, move the ENTIRE YELLOW SHAPE so all cells touch the YELLOW edge</p>
        <p className="text-white/70 text-xs">• Use rotation when needed to position correctly!</p>
      </motion.div>
      
      <motion.div
        className="mt-4 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <Link to="/menu" className="text-blue-300 hover:text-blue-200 transition-colors">
          ← Return to Main Menu
        </Link>
      </motion.div>
      
      {/* Simple Dot at Edge Tutorial Toast */}
      <AnimatePresence>
        {showDotTutorial && (
          <motion.div 
            className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 pointer-events-auto"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <motion.div 
              className="bg-blue-900/80 backdrop-blur-md px-4 py-3 rounded-lg border border-blue-500/30 shadow-lg max-w-xs"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatType: "loop" }}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">✨</span>
                <div>
                  <h3 className="text-sm font-bold text-white">Dot reached the edge!</h3>
                  <p className="text-blue-200 text-xs">Now move all shape cells to the edge to exit.</p>
                </div>
                <motion.button
                  onClick={() => setShowDotTutorial(false)}
                  className="text-white text-xs bg-blue-700/50 px-2 py-1 rounded hover:bg-blue-700/80"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  ✓
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}