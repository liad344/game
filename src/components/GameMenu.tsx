// src/components/GameMenu.tsx
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export function GameMenu() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.2,
        delayChildren: 0.3
      } 
    }
  };
  
  const itemVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: { 
      x: 0, 
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-500 to-orange-600 flex flex-col items-center justify-center p-6">
      <motion.div 
        className="bg-white/10 backdrop-blur-md rounded-3xl p-8 max-w-md w-full shadow-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.h1 
          className="text-4xl font-bold text-white text-center mb-8"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <span className="inline-block mr-3 animate-bounce">🎮</span>
          Game Selection
        </motion.h1>
        
        <motion.div 
          className="space-y-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <Link to="/plant-login" 
              className="group block p-5 bg-gradient-to-r from-green-500 to-emerald-400 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-4xl mr-4">🌱</span>
                  <div>
                    <h3 className="text-xl font-bold text-white">Water Plant</h3>
                    <p className="text-green-100 text-sm">Grow your seedling with care</p>
                  </div>
                </div>
                <span className="text-2xl text-white group-hover:translate-x-1 transition-transform duration-200">→</span>
              </div>
            </Link>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <Link to="/car-puzzle-login" 
              className="group block p-5 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-4xl mr-4">🚗</span>
                  <div>
                    <h3 className="text-xl font-bold text-white">Car Puzzle</h3>
                    <p className="text-blue-100 text-sm">Guide cars to matching exits</p>
                  </div>
                </div>
                <span className="text-2xl text-white group-hover:translate-x-1 transition-transform duration-200">→</span>
              </div>
            </Link>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <div className="group block p-5 bg-gradient-to-r from-gray-500 to-gray-400 rounded-xl shadow-md opacity-70">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-4xl mr-4">🔜</span>
                  <div>
                    <h3 className="text-xl font-bold text-white">Coming Soon</h3>
                    <p className="text-gray-100 text-sm">New game under development</p>
                  </div>
                </div>
                <span className="text-2xl text-white">→</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
        
        <motion.div 
          className="mt-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <Link to="/menu" className="text-white hover:text-yellow-200 transition-colors duration-300 font-medium text-lg">
            ← Back to Home
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}