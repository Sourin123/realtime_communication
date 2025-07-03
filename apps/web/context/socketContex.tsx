"use client";
import React, { useEffect, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";

interface socketProviderProps {
  children: React.ReactNode;
}

interface IsocketContext {
  sendMessage: (msg: string, to: string) => void;
  socket?: Socket;
}

const socketContext = React.createContext<IsocketContext | null>(null);

export const useSocket = () => {
  const state = React.useContext(socketContext);
  if (!state) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return state;
};

export const SocketProvider: React.FC<socketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket>();

  useEffect(() => {
    const _socket = io("http://localhost:8000");
    setSocket(_socket);

    // FIXED: Use "register" event instead of "join"
    const userId = localStorage.getItem("userId") || "user1";
    _socket.emit("register", { userId }); // Changed from "join" to "register"

    // Add some basic event listeners
    _socket.on("registered", (data) => {
      console.log("User registered:", data);
    });

    _socket.on("connect", () => {
      console.log("Connected to server");
    });

    _socket.on("disconnect", () => {
      console.log("Disconnected from server");
    });

    return () => {
      _socket.disconnect();
      setSocket(undefined);
    };
  }, []);

  const sendMessage = useCallback(
    (msg: string, to: string) => {
      if (socket) {
        const from = localStorage.getItem("userId") || "user1";
        socket.emit("event:message", {
          message: msg,
          from,
          to,
          timestamp: new Date().toISOString(),
        });
      }
    },
    [socket]
  );

  return (
    <socketContext.Provider value={{ sendMessage, socket }}>
      {children}
    </socketContext.Provider>
  );
};