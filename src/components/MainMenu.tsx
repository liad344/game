import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/useGameStore';

export function MainMenu() {
  const { coupons } = useGameStore();
  const couponCount = coupons.length;
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.3
      } 
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-700 flex flex-col items-center justify-center p-4">
      <motion.div 
        className="flex flex-col items-center justify-center gap-10 p-10 bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl max-w-lg w-full"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div 
          className="text-center"
          variants={itemVariants}
        >
          <h1 className="text-5xl font-bold text-white mb-2">
            <span className="inline-block animate-bounce mr-2">🎮</span>
            Mini Games
          </h1>
          <p className="text-lg text-purple-200">Choose a game to play</p>
        </motion.div>
        
        <div className="grid gap-6 w-full">
          <motion.div variants={itemVariants}>
            <Link to="/game-menu" 
              className="group flex items-center justify-between p-5 w-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <span className="text-2xl text-white font-semibold flex items-center">
                <span className="text-4xl mr-3">🎲</span>
                Game Menu
              </span>
              <span className="text-2xl group-hover:translate-x-2 transition-transform duration-300">→</span>
            </Link>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <Link to="/plant-login" 
              className="group flex items-center justify-between p-5 w-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <span className="text-2xl text-white font-semibold flex items-center">
                <span className="text-4xl mr-3">🌱</span>
                Water Plant
              </span>
              <span className="text-2xl group-hover:translate-x-2 transition-transform duration-300">→</span>
            </Link>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <Link to="/car-puzzle-login" 
              className="group flex items-center justify-between p-5 w-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <span className="text-2xl text-white font-semibold flex items-center">
                <span className="text-4xl mr-3">🚗</span>
                Car Puzzle
              </span>
              <span className="text-2xl group-hover:translate-x-2 transition-transform duration-300">→</span>
            </Link>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <Link to="/maze-login" 
              className="group flex items-center justify-between p-5 w-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <span className="text-2xl text-white font-semibold flex items-center">
                <span className="text-4xl mr-3">🧩</span>
                Maze Explorer
              </span>
              <span className="text-2xl group-hover:translate-x-2 transition-transform duration-300">→</span>
            </Link>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <Link to="/prizes" 
              className="group flex items-center justify-between p-5 w-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <span className="text-2xl text-white font-semibold flex items-center">
                <span className="text-4xl mr-3">🏆</span>
                My Prizes
                {couponCount > 0 && (
                  <span className="ml-3 px-2 py-1 bg-white text-orange-500 text-sm font-bold rounded-full">
                    {couponCount}
                  </span>
                )}
              </span>
              <span className="text-2xl group-hover:translate-x-2 transition-transform duration-300">→</span>
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
