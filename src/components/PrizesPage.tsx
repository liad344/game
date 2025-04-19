import { motion } from 'framer-motion';
import { useGameStore } from '../store/useGameStore';
import { Link } from 'react-router-dom';

export function PrizesPage() {
  const { coupons, totalPossibleCoupons } = useGameStore();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
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
    <div className="min-h-screen bg-gradient-to-br from-amber-500 via-orange-600 to-red-700 flex flex-col items-center p-6">
      <motion.div 
        className="w-full max-w-4xl bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 my-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white flex items-center">
              <span className="text-5xl mr-4">🏆</span>
              Your Prizes
            </h1>
            <p className="text-amber-200 mt-2">
              Collected: {coupons.length} of {totalPossibleCoupons} possible coupons
            </p>
          </div>
          <Link to="/menu" className="px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-xl transition-all">
            Back to Menu
          </Link>
        </div>
        
        {coupons.length === 0 ? (
          <div className="text-center p-12 border-2 border-dashed border-white/30 rounded-xl">
            <div className="text-6xl mb-4">🎮</div>
            <h2 className="text-2xl font-medium text-white mb-2">No prizes yet!</h2>
            <p className="text-white/70">Complete levels in the games to earn coupon prizes.</p>
          </div>
        ) : (
          <motion.div 
            className="grid md:grid-cols-2 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {coupons.map((coupon) => (
              <motion.div 
                key={coupon.id}
                className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl p-6 shadow-lg"
                variants={itemVariants}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">{coupon.title}</h3>
                    <p className="text-white/80">{coupon.description}</p>
                  </div>
                  <div className="text-3xl">🎁</div>
                </div>
                <div className="mt-4 pt-4 border-t border-white/20">
                  <div className="flex justify-center mb-3">
                    <div className="bg-white/20 text-white font-mono font-bold text-xl px-4 py-2 rounded-lg tracking-widest">
                      {coupon.code}
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <button 
                      onClick={() => {
                        // Format properly for WhatsApp with international format
                        // For Israeli numbers, replace the leading 0 with 972
                        const formattedPhone = "972" + "544586872";
                        
                        // Craft WhatsApp message with coupon details
                        const message = `I'm using my coupon code: ${coupon.code} for ${coupon.title}`;
                        
                        // Open WhatsApp with the formatted number and message
                        window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`, '_blank');
                      }}
                      className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg text-white transition-all font-bold flex items-center justify-center"
                    >
                      <span className="mr-2 text-xl">💬</span> Use Coupon Code
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}