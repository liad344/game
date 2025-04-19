// src/components/Winning.tsx
import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/useGameStore';
import seedling from '../assets/1.png';
import sprout from '../assets/2.png';

type GameType = 'plant' | 'car-puzzle' | 'unknown';

export function Winning() {
  const location = useLocation();
  const navigate = useNavigate();
  const resetGame = useGameStore((state) => state.resetGame);
  const [gameType, setGameType] = useState<GameType>('unknown');
  const [showPrize, setShowPrize] = useState(false);
  const [confetti, setConfetti] = useState<{ x: number; y: number; size: number; color: string }[]>([]);

  // Determine which game was completed based on the previous route
  useEffect(() => {
    const path = localStorage.getItem('lastGamePath');
    if (path?.includes('plant')) {
      setGameType('plant');
    } else if (path?.includes('car-puzzle')) {
      setGameType('car-puzzle');
    } else {
      setGameType('unknown');
    }
    
    // Create confetti
    const newConfetti = [];
    for (let i = 0; i < 50; i++) {
      newConfetti.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 8 + 4,
        color: [
          '#FF6B6B', '#4ECDC4', '#FFE66D', '#1A535C', '#FF9F1C',
          '#7FB800', '#E55934', '#8661C1', '#F9C80E', '#2EC4B6'
        ][Math.floor(Math.random() * 10)]
      });
    }
    setConfetti(newConfetti);
    
    // Store the current location to return to the right game
    return () => {
      localStorage.setItem('lastGamePath', location.pathname);
    };
  }, [location]);

  const handleRestart = () => {
    resetGame();
    if (gameType === 'plant') {
      navigate('/plant');
    } else if (gameType === 'car-puzzle') {
      navigate('/car-puzzle');
    } else {
      navigate('/menu');
    }
  };

  const togglePrize = () => {
    setShowPrize(!showPrize);
  };

  const getGameContent = () => {
    switch (gameType) {
      case 'plant':
        return {
          title: '🌼 Plant Mastery Achieved!',
          subtitle: 'Your green thumb has brought life to a beautiful plant!',
          description: 'Your dedication and care has paid off! The seedling has grown into a healthy, thriving plant thanks to your excellent watering skills.',
          prize: sprout,
          prizeLabel: 'Fully Grown Plant',
          bgClass: 'from-green-900 via-emerald-800 to-teal-800',
          buttonClass: 'from-emerald-600 to-green-500',
          emoji: '🌱'
        };
      case 'car-puzzle':
        return {
          title: '🚗 Puzzle Master!',
          subtitle: 'You\'ve successfully solved all the car puzzles!',
          description: 'Your strategic thinking and spatial awareness have helped you navigate all the cars to their correct exits. Impressive problem-solving skills!',
          prize: seedling, // Using seedling image as a placeholder
          prizeLabel: 'Championship Trophy',
          bgClass: 'from-blue-900 via-indigo-800 to-purple-800',
          buttonClass: 'from-blue-600 to-indigo-500',
          emoji: '🏆'
        };
      default:
        return {
          title: '🎉 Congratulations!',
          subtitle: 'You\'ve completed the challenge!',
          description: 'Well done on your achievement! You\'ve shown great skill and determination.',
          prize: seedling,
          prizeLabel: 'Mystery Prize',
          bgClass: 'from-purple-900 via-pink-800 to-rose-800',
          buttonClass: 'from-purple-600 to-pink-500',
          emoji: '🎁'
        };
    }
  };

  const content = getGameContent();

  return (
    <div className={`min-h-screen bg-gradient-to-br ${content.bgClass} flex flex-col justify-center items-center p-6 relative overflow-hidden`}>
      {/* Animated confetti background */}
      {confetti.map((particle, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
          }}
          initial={{ y: -20, opacity: 0 }}
          animate={{ 
            y: [null, 500], 
            opacity: [0, 1, 1, 0],
            rotate: [0, 360 * (Math.random() > 0.5 ? 1 : -1)]
          }}
          transition={{ 
            duration: Math.random() * 5 + 3, 
            repeat: Infinity, 
            delay: Math.random() * 2,
            ease: "linear"
          }}
        />
      ))}
      
      <motion.div
        className="max-w-md w-full bg-white/10 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/20 relative z-10"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="absolute -top-16 left-1/2 transform -translate-x-1/2 text-7xl"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
        >
          {content.emoji}
        </motion.div>
        
        <motion.h1 
          className="text-4xl font-bold text-white text-center mt-10 mb-4"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {content.title}
        </motion.h1>
        
        <motion.p 
          className="text-xl text-white/90 text-center mb-6"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {content.subtitle}
        </motion.p>
        
        <motion.div 
          className="bg-white/5 backdrop-blur-sm rounded-xl p-5 mb-8 border border-white/10"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-white/80">
            {content.description}
          </p>
        </motion.div>
        
        <motion.div
          className="w-full mb-8"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <motion.button
            onClick={togglePrize}
            className={`w-full py-4 bg-gradient-to-r ${content.buttonClass} text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2`}
            whileHover={{ scale: 1.03, boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.2)" }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="text-2xl">🎁</span>
            <span>{showPrize ? "Hide Prize" : "Claim Your Prize!"}</span>
            <motion.span
              animate={{ rotate: showPrize ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              ↓
            </motion.span>
          </motion.button>
          
          <AnimatePresence>
            {showPrize && (
              <motion.div
                className="mt-4 p-6 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg flex flex-col items-center"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <p className="text-white/90 font-medium mb-3">{content.prizeLabel}</p>
                <motion.div
                  className="bg-white/20 p-4 rounded-xl shadow-inner"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <motion.img 
                    src={content.prize}
                    alt="Prize" 
                    className="w-40 h-40 object-contain"
                    animate={{ 
                      y: [0, -5, 0],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ 
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <motion.button
            onClick={handleRestart}
            className={`flex-1 py-3 px-6 bg-gradient-to-r ${content.buttonClass} text-white font-medium rounded-xl shadow-lg flex items-center justify-center gap-2`}
            whileHover={{ scale: 1.03, boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.2)" }}
            whileTap={{ scale: 0.98 }}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <span>🔄</span>
            <span>Play Again</span>
          </motion.button>
          
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex-1"
          >
            <Link to="/menu">
              <motion.button
                className="w-full py-3 px-6 bg-white/10 backdrop-blur-sm text-white font-medium rounded-xl hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <span>🏠</span>
                <span>Menu</span>
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}