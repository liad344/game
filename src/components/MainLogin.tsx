import { LoginPage } from '../components/LoginPage';

export function MainLoginPage() {
  return (
    <LoginPage
      question="Who created this mini-game collection?"
      expectedAnswer="liad"
      redirectTo="/game-menu"
      backgroundClass="bg-gradient-to-br from-purple-700 to-indigo-500"
    />
  );
}
