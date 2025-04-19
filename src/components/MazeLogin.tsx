import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export function MazeLoginPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const correctPassword = 'maze123';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === correctPassword) {
      navigate('/maze');
    } else {
      setError('Incorrect password. Hint: maze123');
      setTimeout(() => setError(''), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 flex flex-col items-center justify-center p-6">
      <motion.div
        className="w-full max-w-md bg-white/10 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-indigo-500/20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div 
          className="text-center mb-8"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-3xl font-bold text-white mb-2">
            <span className="text-4xl mr-2">🧩</span> Maze Explorer
          </h1>
          <p className="text-indigo-200">Enter the password to access the maze</p>
        </motion.div>

        <motion.form
          onSubmit={handleSubmit}
          className="space-y-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-indigo-200 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-indigo-900/50 border border-indigo-500/30 rounded-xl text-white placeholder-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="Enter password"
              required
            />
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-rose-300 text-sm font-medium p-2 bg-rose-900/20 border border-rose-500/20 rounded-lg"
            >
              {error}
            </motion.div>
          )}

          <motion.button
            type="submit"
            className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl shadow-lg"
            whileHover={{ scale: 1.02, boxShadow: "0px 5px 15px rgba(79, 70, 229, 0.4)" }}
            whileTap={{ scale: 0.98 }}
          >
            Unlock Maze
          </motion.button>

          <motion.div
            className="text-center text-indigo-300 text-sm mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <p>Navigate through challenging mazes and test your problem-solving skills!</p>
          </motion.div>
        </motion.form>

        <motion.div
          className="mt-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <button
            onClick={() => navigate('/menu')}
            className="text-indigo-300 hover:text-indigo-200 transition-colors"
          >
            ← Return to Main Menu
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}