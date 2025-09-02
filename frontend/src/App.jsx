import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home/Home";
import Game from "./pages/Game/Game";
import PrivateRoom from "./pages/PrivateRoom/PrivateRoom";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/:roomId" element={<Game />} />
        <Route path="/private-room" element={<PrivateRoom />} />
      </Routes>
    </Router>
  );
}
