import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GameMenu } from './components/GameMenu';
import { WaterPlant } from './components/WaterPlant';
import { Winning } from './components/Winning';
import { PlantLoginPage } from './components/PlantLogin';
import { MainMenu } from './components/MainMenu';
import { MainLoginPage } from './components/MainLogin';
import { CarPuzzleGame } from './components/CarPuzzleGame';
import { CarPuzzleLoginPage } from './components/CarPuzzleLogin';
import { IntroPage } from './components/IntroPage';
import { MazeGame } from './components/MazeGame';
import { MazeLoginPage } from './components/MazeLogin';
import { PrizesPage } from './components/PrizesPage';
import { CouponWinToast } from './components/CouponWinToast';
import { useGameStore } from './store/useGameStore';

export default function App() {
  const { lastCoupon, showCouponToast, hideCouponToast } = useGameStore();
  
  return (
    <Router>
      {/* Coupon toast notification */}
      {lastCoupon && (
        <CouponWinToast 
          couponCode={lastCoupon.code} 
          couponTitle={lastCoupon.title}
          isVisible={showCouponToast}
          onClose={hideCouponToast}
        />
      )}
      
      <Routes>
        <Route path="/plant" element={<WaterPlant />} />
        <Route path="/win" element={<Winning />} />
        <Route path="/menu" element={<MainMenu />} />
        <Route path="/" element={<IntroPage />} />
        <Route path="/login" element={<MainLoginPage />} />
        <Route path="/game-menu" element={<GameMenu />} />
        <Route path="/plant-login" element={<PlantLoginPage />} />
        <Route path="/car-puzzle-login" element={<CarPuzzleLoginPage />} />
        <Route path="/car-puzzle" element={<CarPuzzleGame />} />
        <Route path="/maze-login" element={<MazeLoginPage />} />
        <Route path="/maze" element={<MazeGame />} />
        <Route path="/prizes" element={<PrizesPage />} />
      </Routes>
    </Router>
  );
}