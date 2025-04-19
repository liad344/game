import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

type LoginPageProps = {
  question: string;
  expectedAnswer: string;
  backgroundClass: string;
  redirectTo: string;
};

export function LoginPage({
  question,
  expectedAnswer,
  backgroundClass,
  redirectTo,
}: LoginPageProps) {
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Focus the input field when component mounts
    const inputElement = document.getElementById('answer-input');
    if (inputElement) {
      inputElement.focus();
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (answer.trim().toLowerCase() === expectedAnswer.toLowerCase()) {
      setSuccess(true);
      setError('');
      setTimeout(() => {
        navigate(redirectTo);
      }, 1500); // wait for animation
    } else {
      setError('Incorrect answer. Try again!');
      setSuccess(false);
      // Shake the form
      const form = document.getElementById('login-form');
      if (form) {
        form.classList.add('animate-shake');
        setTimeout(() => {
          form.classList.remove('animate-shake');
        }, 500);
      }
    }
  };

  const toggleHint = () => {
    setShowHint(!showHint);
  };

  return (
    <div className={`min-h-screen ${backgroundClass} flex flex-col items-center justify-center p-6`}>
      <motion.div 
        className="w-full max-w-md bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="p-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-center mb-8"
          >
            <div className="text-5xl mb-4">🔒</div>
            <h2 className="text-3xl font-bold text-white">Security Check</h2>
            <p className="text-white/80 mt-2">Please answer the question to continue</p>
          </motion.div>
          
          <motion.form 
            id="login-form"
            onSubmit={handleSubmit} 
            className="space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <div>
              <label className="block text-white text-lg font-medium mb-3">
                {question}
              </label>
              <input
                id="answer-input"
                type="text"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                className="w-full p-4 bg-white/20 text-white border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/50 transition-all placeholder-white/50"
                placeholder="Enter your answer..."
                disabled={success}
              />
            </div>
            
            {error && (
              <motion.div 
                className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-white"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {error}
              </motion.div>
            )}
            
            {success && (
              <motion.div 
                className="p-3 bg-green-500/20 border border-green-500/30 rounded-lg text-white text-center"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="text-2xl mb-1">✅</div>
                <div>Access granted! Redirecting...</div>
              </motion.div>
            )}
            
            <div className="flex gap-4">
              <motion.button
                type="submit"
                disabled={success}
                className="flex-1 py-4 px-6 bg-white/20 hover:bg-white/30 text-white font-medium rounded-xl transition-all duration-300 disabled:opacity-50"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                {success ? "Unlocking..." : "Submit"}
              </motion.button>
              
              <motion.button
                type="button"
                onClick={toggleHint}
                className="py-4 px-6 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-all duration-300"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                {showHint ? "Hide Hint" : "Hint"}
              </motion.button>
            </div>
            
            {showHint && (
              <motion.div 
                className="p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg text-white"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
              >
                <p>Look at the edges of the game board to find the answer.</p>
              </motion.div>
            )}
          </motion.form>
        </div>
        
        <motion.div 
          className="bg-black/20 p-4 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Link to="/menu" className="text-white/70 hover:text-white transition-colors">
            ← Return to Main Menu
          </Link>
        </motion.div>
      </motion.div>
      
      {/* Add animated particles in the background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-4 h-4 rounded-full bg-white/20"
            initial={{ 
              x: Math.random() * window.innerWidth, 
              y: Math.random() * window.innerHeight,
              scale: Math.random() * 0.5 + 0.5
            }}
            animate={{ 
              y: [null, Math.random() * -100 - 50],
              opacity: [0.7, 0]
            }}
            transition={{ 
              repeat: Infinity, 
              duration: Math.random() * 10 + 10,
              ease: "linear",
              delay: Math.random() * 5
            }}
          />
        ))}
      </div>
    </div>
  );
}
