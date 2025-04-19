import { LoginPage } from "./LoginPage";

export function CarPuzzleLoginPage() {
  return (
    <LoginPage
      question="What color exits the right side of the board?"
      expectedAnswer="blue"
      redirectTo="/car-puzzle"
      backgroundClass="bg-gradient-to-br from-blue-700 to-blue-400"
    />
  );
}
