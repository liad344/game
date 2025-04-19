import { motion, AnimatePresence } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

interface CouponWinToastProps {
  couponCode: string;
  couponTitle: string;
  isVisible: boolean;
  onClose: () => void;
}

export function CouponWinToast({ couponCode, couponTitle, isVisible, onClose }: CouponWinToastProps) {
  const [confetti, setConfetti] = useState<{ x: number; y: number; size: number; color: string }[]>([]);
  
  // Generate confetti pieces
  useEffect(() => {
    if (isVisible) {
      const newConfetti = [];
      const colors = ['#ff5e5e', '#ffbd59', '#ffee58', '#7eff58', '#58c7ff', '#b158ff', '#ff58c2'];
      
      for (let i = 0; i < 40; i++) {
        newConfetti.push({
          x: Math.random() * 100,
          y: -10 - Math.random() * 40,
          size: 5 + Math.random() * 10,
          color: colors[Math.floor(Math.random() * colors.length)]
        });
      }
      
      setConfetti(newConfetti);
      
      // Auto-close after 7 seconds
      const timer = setTimeout(() => {
        onClose();
      }, 7000);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Confetti animation */}
          {confetti.map((piece, index) => (
            <motion.div
              key={index}
              className="fixed z-50 rounded-full"
              initial={{ 
                top: `${piece.y}%`,
                left: `${piece.x}%`,
                width: `${piece.size}px`,
                height: `${piece.size}px`,
                backgroundColor: piece.color,
                opacity: 1,
                rotate: 0
              }}
              animate={{ 
                top: `${100 + Math.random() * 20}%`,
                rotate: Math.random() * 360,
                opacity: 0
              }}
              transition={{ 
                duration: 3 + Math.random() * 2,
                ease: "easeOut"
              }}
            />
          ))}
        
          {/* Toast container */}
          <motion.div
            className="fixed top-10 right-5 z-50 max-w-sm"
            initial={{ opacity: 0, y: -50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <div className="bg-gradient-to-r from-amber-500 to-yellow-600 rounded-lg shadow-2xl p-4 overflow-hidden">
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <motion.div 
                      className="text-2xl mr-2"
                      animate={{
                        scale: [1, 1.3, 1],
                        rotate: [0, 10, -10, 0]
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        repeatDelay: 1
                      }}
                    >
                      🎉
                    </motion.div>
                    <h3 className="text-lg font-bold text-white">New Coupon!</h3>
                  </div>
                  
                  <p className="text-white text-sm mb-1">{couponTitle}</p>
                  
                  <div className="bg-white/20 rounded-md px-3 py-1 inline-block mb-3">
                    <span className="font-mono font-bold text-white tracking-wider">{couponCode}</span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        // Format properly for WhatsApp with international format
                        // For Israeli numbers, replace the leading 0 with 972
                        const formattedPhone = "972" + "544586872";
                        window.open(`https://wa.me/${formattedPhone}?text=I'm%20using%20my%20coupon%20code%3A%20${couponCode}%20for%20${encodeURIComponent(couponTitle)}`, '_blank');
                        onClose();
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white text-xs py-1 px-3 rounded-md transition-all flex items-center"
                    >
                      <span className="mr-1">💬</span> Use Now
                    </button>
                    
                    <Link
                      to="/prizes"
                      className="bg-white/10 hover:bg-white/20 text-white text-xs py-1 px-3 rounded-md transition-all flex-1 text-center"
                      onClick={onClose}
                    >
                      View All Prizes
                    </Link>
                    
                    <button
                      onClick={onClose}
                      className="bg-white/10 hover:bg-white/20 text-white text-xs py-1 px-3 rounded-md transition-all"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
                
                <motion.div 
                  className="text-4xl"
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity
                  }}
                >
                  🎁
                </motion.div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}