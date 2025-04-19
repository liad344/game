import { LoginPage } from '../components/LoginPage';

export function PlantLoginPage() {
  return (
    <LoginPage
      question="What do plants need to grow? (hint: you'll be giving this to the plant in the game)"
      expectedAnswer="water"
      redirectTo="/plant"
      backgroundClass="bg-gradient-to-br from-green-700 to-green-400"
    />
  );
}
