// src/components/WaterPlant.tsx
import { useEffect, useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import seedling from '../assets/1.png';
import sprout from '../assets/2.png';

export function WaterPlant() {
  const navigate = useNavigate();
  const {
    water,
    plantStage,
    addWater,
    waterings,
    incrementWaterings,
    resetWater,
  } = useGameStore();

  const [progress, setProgress] = useState(0);
  const [isPouring, setIsPouring] = useState(false);
  const [wateringGoal, setWateringGoal] = useState([1, 2, 2, 3, 3]);

  // Create placeholder images for additional stages (stages 3-4)
  const stage3Empty = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22160%22%20height%3D%22160%22%20viewBox%3D%220%200%20160%20160%22%20fill%3D%22none%22%3E%3Cpath%20d%3D%22M80%2025C45.2%2025%2010%2068%2010%20135%22%20stroke%3D%22%2322c55e%22%20stroke-width%3D%226%22%20stroke-linecap%3D%22round%22%2F%3E%3Cpath%20d%3D%22M80%2025C114.8%2025%20150%2068%20150%20135%22%20stroke%3D%22%2322c55e%22%20stroke-width%3D%226%22%20stroke-linecap%3D%22round%22%2F%3E%3Cpath%20d%3D%22M80%2025V80%22%20stroke%3D%22%2322c55e%22%20stroke-width%3D%226%22%20stroke-linecap%3D%22round%22%2F%3E%3Ccircle%20cx%3D%2280%22%20cy%3D%2290%22%20r%3D%2210%22%20fill%3D%22%2322c55e%22%2F%3E%3Ccircle%20cx%3D%2255%22%20cy%3D%2270%22%20r%3D%228%22%20fill%3D%22%2322c55e%22%2F%3E%3Ccircle%20cx%3D%22105%22%20cy%3D%2270%22%20r%3D%228%22%20fill%3D%22%2322c55e%22%2F%3E%3C%2Fsvg%3E';
  
  const stage4Empty = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22160%22%20height%3D%22160%22%20viewBox%3D%220%200%20160%20160%22%20fill%3D%22none%22%3E%3Cpath%20d%3D%22M80%2010C35.82%2010%2010%2068%2010%20135%22%20stroke%3D%22%2322c55e%22%20stroke-width%3D%226%22%20stroke-linecap%3D%22round%22%2F%3E%3Cpath%20d%3D%22M80%2010C124.18%2010%20150%2068%20150%20135%22%20stroke%3D%22%2322c55e%22%20stroke-width%3D%226%22%20stroke-linecap%3D%22round%22%2F%3E%3Cpath%20d%3D%22M80%2010V90%22%20stroke%3D%22%2322c55e%22%20stroke-width%3D%226%22%20stroke-linecap%3D%22round%22%2F%3E%3Ccircle%20cx%3D%2280%22%20cy%3D%22100%22%20r%3D%2212%22%20fill%3D%22%2322c55e%22%2F%3E%3Ccircle%20cx%3D%2250%22%20cy%3D%2270%22%20r%3D%228%22%20fill%3D%22%2322c55e%22%2F%3E%3Ccircle%20cx%3D%22110%22%20cy%3D%2270%22%20r%3D%228%22%20fill%3D%22%2322c55e%22%2F%3E%3Ccircle%20cx%3D%22125%22%20cy%3D%2250%22%20r%3D%226%22%20fill%3D%22%2322c55e%22%2F%3E%3Ccircle%20cx%3D%2235%22%20cy%3D%2250%22%20r%3D%226%22%20fill%3D%22%2322c55e%22%2F%3E%3Ccircle%20cx%3D%2280%22%20cy%3D%2240%22%20r%3D%226%22%20fill%3D%22%2322c55e%22%2F%3E%3C%2Fsvg%3E';

  // Map plant stage to the appropriate image
  const stageImage = plantStage === 0 ? seedling : 
                     plantStage === 1 ? sprout : 
                     plantStage === 2 ? stage3Empty : 
                     stage4Empty;

  // Fill progress bar every second
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isPouring) {
        setProgress((prev) => Math.min(prev + 1, 100));
      }
    }, 10   );
    return () => clearInterval(interval);
  }, [isPouring]);

  const handleWaterPlant = () => {
    if (progress >= 100 && !isPouring) {
      setIsPouring(true);
      let drain = 100;

      const drainInterval = setInterval(() => {
        setProgress((prev) => {
          const next = Math.max(prev - 10, 0);
          drain -= 10;
          return next;
        });

        if (drain <= 0) {
          clearInterval(drainInterval);
          addWater();
          incrementWaterings();
          setIsPouring(false);
        }
      }, 100);
    }
  };

  // Plant growth + win screen logic
  useEffect(() => {
    const goal = wateringGoal[plantStage];
    if (waterings >= goal) {
      if (plantStage < 4) { // Updated to support 5 stages (0-4)
        useGameStore.setState((state) => ({
          plantStage: state.plantStage + 1,
          waterings: 0,
        }));
        resetWater();
        
        // Add a coupon when advancing to next plant stage
        if (useGameStore.getState().addCoupon) {
          useGameStore.getState().addCoupon('plant', plantStage);
        }
      } else {
        localStorage.setItem('lastGamePath', '/plant');
        navigate('/win');
      }
    }
  }, [waterings, plantStage]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-emerald-800 flex flex-col items-center justify-center p-6">
      <motion.div
        className="w-full max-w-lg bg-white/5 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-green-500/20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.h1 
          className="text-3xl font-bold text-green-400 text-center mb-4"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <span className="text-4xl mr-2">🌿</span> Plant Nursery
        </motion.h1>
        
        <div className="flex flex-col items-center">
          <motion.div 
            className="relative mb-8 p-6"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
          >
            {/* Sun animation */}
            <motion.div 
              className="absolute -top-10 right-0 w-16 h-16 rounded-full bg-gradient-to-r from-yellow-400 to-amber-300 shadow-lg shadow-yellow-400/30"
              animate={{ 
                y: [0, -5, 0],
                boxShadow: [
                  "0 0 20px 5px rgba(250, 204, 21, 0.3)",
                  "0 0 30px 10px rgba(250, 204, 21, 0.5)",
                  "0 0 20px 5px rgba(250, 204, 21, 0.3)"
                ]
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
            
            {/* Rain drops when watering */}
            {isPouring && (
              <div className="absolute left-0 right-0 top-0 flex justify-center">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-4 rounded-full bg-blue-500"
                    initial={{ y: -20, x: (i - 2) * 10, opacity: 0.8 }}
                    animate={{ y: 60, opacity: 0 }}
                    transition={{ duration: 0.7, repeat: 3, repeatType: "loop", delay: i * 0.1 }}
                  />
                ))}
              </div>
            )}
            
            <motion.div 
              className="bg-gradient-to-b from-amber-800/40 to-yellow-800/60 p-2 rounded-full shadow-lg inline-block border-4 border-amber-900/70 relative"
              whileHover={{ scale: 1.05 }}
            >
              <motion.img 
                src={stageImage} 
                alt="plant stage" 
                className="w-40 h-40 object-contain"
                animate={plantStage > 0 ? { 
                  rotate: [0, 1, -1, 0],
                  y: [0, -3, 0]
                } : {}}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              />
              
              {/* Plant stage indicator */}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 bg-green-700 rounded-full p-2 shadow-lg border-2 border-green-900">
                <div className="flex space-x-1">
                  {[0, 1, 2, 3, 4].map(stage => (
                    <div 
                      key={stage} 
                      className={`w-2 h-2 rounded-full ${plantStage >= stage ? 'bg-green-300' : 'bg-green-900/50'}`}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
          
          <motion.div 
            className="w-full space-y-4 mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center justify-between text-emerald-100 text-sm mb-1">
              <span>Water Tank</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full h-6 bg-emerald-900/30 rounded-full overflow-hidden border border-emerald-500/30 shadow-inner">
              <motion.div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all ease-linear"
                style={{ width: `${progress}%` }}
                animate={progress === 100 ? { 
                  boxShadow: ["0 0 10px 2px rgba(56, 189, 248, 0.3)", "0 0 15px 4px rgba(56, 189, 248, 0.5)", "0 0 10px 2px rgba(56, 189, 248, 0.3)"] 
                } : {}}
                transition={{ duration: 1, repeat: Infinity }}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="bg-emerald-900/20 backdrop-blur-sm p-3 rounded-xl border border-emerald-600/20">
                <div className="text-sm text-emerald-300 font-medium mb-1">Total Water</div>
                <div className="text-2xl font-bold text-emerald-100 flex items-center">
                  <span className="text-blue-400 mr-2">💧</span>
                  {water} ml
                </div>
              </div>
              
              <div className="bg-emerald-900/20 backdrop-blur-sm p-3 rounded-xl border border-emerald-600/20">
                <div className="text-sm text-emerald-300 font-medium mb-1">Waterings</div>
                <div className="text-2xl font-bold text-emerald-100 flex items-center">
                  <span className="text-yellow-400 mr-2">🪣</span>
                  {waterings}/{wateringGoal[plantStage]}
                </div>
                <div className="text-xs text-emerald-300/70 mt-1 text-center">Stage {plantStage + 1} of 5</div>
              </div>
            </div>
          </motion.div>
          
          <motion.button
            onClick={handleWaterPlant}
            disabled={progress < 100 || isPouring}
            className={`w-full py-4 px-6 rounded-xl font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-2 ${
              progress >= 100 && !isPouring
                ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white'
                : 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
            }`}
            whileHover={progress >= 100 && !isPouring ? { scale: 1.03, boxShadow: "0px 5px 15px rgba(14, 165, 233, 0.3)" } : {}}
            whileTap={progress >= 100 && !isPouring ? { scale: 0.98 } : {}}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, type: "spring" }}
          >
            <span className="text-2xl">💧</span>
            <span>{isPouring ? "Watering..." : "Water Plant"}</span>
          </motion.button>
          
          <motion.div
            className="mt-6 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <Link to="/menu" className="text-emerald-300 hover:text-emerald-200 transition-colors">
              ← Return to Main Menu
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}