import React, { useEffect, useState } from "react";
import { SocketProvider } from "./context/SocketContext";
import { GameProvider } from "./context/GameContext";
import App from "./App";
import FakeVerification from "./components/FakeVerification/FakeVerification";

const Bootstrap = () => {
  const [serverHealthy, setServerHealthy] = useState(false);
  const URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:4000";

  // Background health check function
  const checkServerHealth = async () => {
    try {
      const res = await fetch(`${URL}/api/health`);
      if (!res.ok) throw new Error("Server not healthy");
      setServerHealthy(true); // signal backend is up
    } catch (err) {
      console.error("Health check failed:", err.message);
      setTimeout(checkServerHealth, 3000); // retry in 3s
    }
  };

  useEffect(() => {
    checkServerHealth();
  }, []);

  if (!serverHealthy) {
    return (
        <FakeVerification
        backendUp={serverHealthy} 
      />
    );
  }

  return (
    <SocketProvider>
      <GameProvider>
        <App />
      </GameProvider>
    </SocketProvider>
  );
};

export default Bootstrap;
