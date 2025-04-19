import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const titles = [
  {
    id: 1,
    emoji: '🎮',
    title: 'Mini Games Collection',
    color: 'from-indigo-600 to-purple-600',
    description: 'A collection of fun, interactive mini-games created with React, TypeScript, and Framer Motion.',
    buttonText: 'Start Playing',
    buttonLink: '/menu',
    buttonColor: 'from-indigo-500 to-purple-500',
  },
  {
    id: 2,
    emoji: '🌱',
    title: 'Water the Plant',
    color: 'from-emerald-600 to-green-600',
    description: 'Nurture your plant by providing water. Watch it grow from a seedling to a beautiful sprout!',
    buttonText: 'Play Now',
    buttonLink: '/plant-login',
    buttonColor: 'from-emerald-500 to-green-500',
  },
  {
    id: 3,
    emoji: '🚗',
    title: 'Car Puzzle',
    color: 'from-blue-600 to-cyan-600',
    description: 'Solve the puzzle by guiding cars to their matching color exits. A test of spatial thinking!',
    buttonText: 'Start Game',
    buttonLink: '/car-puzzle-login',
    buttonColor: 'from-blue-500 to-cyan-500',
  },
];

export function IntroPage() {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const handleExpand = (id: number) => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    
    // If clicking on already expanded card, collapse it
    if (expandedId === id) {
      setExpandedId(null);
      setTimeout(() => setIsTransitioning(false), 500);
      return;
    }
    
    // If collapsing one and expanding another
    if (expandedId !== null) {
      setExpandedId(null);
      setTimeout(() => {
        setExpandedId(id);
        setTimeout(() => setIsTransitioning(false), 500);
      }, 300);
      return;
    }
    
    // Just expanding from none expanded
    setExpandedId(id);
    setTimeout(() => setIsTransitioning(false), 500);
  };
  
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-6">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-900/40 via-purple-900/30 to-blue-900/40 z-0"></div>
        {/* Animated particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: Math.random() * 15 + 5,
              height: Math.random() * 15 + 5,
              backgroundColor: [
                'rgba(129, 140, 248, 0.2)', // indigo
                'rgba(168, 85, 247, 0.2)',  // purple
                'rgba(59, 130, 246, 0.2)',  // blue
                'rgba(16, 185, 129, 0.2)',  // emerald
              ][Math.floor(Math.random() * 4)],
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            animate={{
              y: [null, Math.random() * -500 - 100],
              opacity: [0.7, 0]
            }}
            transition={{
              repeat: Infinity,
              duration: Math.random() * 20 + 20,
              ease: "linear",
              delay: Math.random() * 10,
            }}
          />
        ))}
      </div>
      
      <motion.h1
        className="text-5xl font-bold text-white mb-16 text-center relative z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        Welcome to Mini Games
      </motion.h1>
      
      <div className="relative z-10 w-full max-w-4xl grid grid-cols-1 gap-6">
        <AnimatePresence>
          {titles.map((item) => (
            <motion.div
              key={item.id}
              className={`bg-gradient-to-r ${item.color} rounded-2xl overflow-hidden shadow-xl cursor-pointer`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ 
                opacity: 1, 
                y: 0,
                height: expandedId === item.id ? 'auto' : '80px'
              }}
              transition={{ 
                duration: 0.5, 
                delay: item.id * 0.2,
                height: { duration: 0.4 },
              }}
              onClick={() => handleExpand(item.id)}
              layoutId={`card-${item.id}`}
            >
              <div className="w-full h-full p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <motion.div 
                      className="text-3xl mr-4"
                      animate={expandedId === item.id ? {
                        scale: [1, 1.2, 1],
                        rotate: [0, 10, -10, 0]
                      } : {}}
                      transition={{ duration: 0.6 }}
                    >
                      {item.emoji}
                    </motion.div>
                    <motion.h2 
                      className="text-xl md:text-2xl font-bold text-white"
                      layoutId={`title-${item.id}`}
                    >
                      {item.title}
                    </motion.h2>
                  </div>
                  <motion.div
                    animate={{
                      rotate: expandedId === item.id ? 180 : 0
                    }}
                    transition={{ duration: 0.4 }}
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-6 w-6 text-white/70" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </motion.div>
                </div>
                
                {expandedId === item.id && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    className="mt-6"
                  >
                    <p className="text-white/90 mb-8 text-lg">
                      {item.description}
                    </p>
                    <Link to={item.buttonLink}>
                      <motion.button
                        className={`bg-gradient-to-r ${item.buttonColor} py-3 px-8 rounded-full text-white font-bold shadow-lg`}
                        whileHover={{ scale: 1.05, boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.2)" }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {item.buttonText}
                      </motion.button>
                    </Link>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      
      <motion.div
        className="mt-12 text-center relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        <p className="text-white/70 mb-4">Made with React + Framer Motion</p>
        <Link to="/menu">
          <motion.button
            className="bg-white/10 backdrop-blur-sm text-white py-2 px-6 rounded-full hover:bg-white/20 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            Skip Intro →
          </motion.button>
        </Link>
      </motion.div>
    </div>
  );
}