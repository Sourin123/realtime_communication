"use client";
import React, { useEffect, useRef, useState } from "react";
import { useSocket } from "../../context/socketContex";
import classes from "../page.module.css";
import { useRouter, useSearchParams } from "next/navigation";

type Message = {
  message: string;
  timestamp: string;
  from: string;
  to: string;
};

export default function Page() {
  const { sendMessage, socket } = useSocket();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get the target user ID from URL params or set a default
  const targetUserId = searchParams.get("userId") || "user2"; // Default to user2 if no param
  const [currentUserId, setCurrentUserId] = useState<string>("user1");
  const [isConnected, setIsConnected] = useState(false);

  // Initialize current user ID
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUserId = localStorage.getItem("userId");
      if (storedUserId) {
        setCurrentUserId(storedUserId);
      } else {
        // If no userId in localStorage, redirect to login or set default
        localStorage.setItem("userId", "user1");
        setCurrentUserId("user1");
      }
    }
  }, []);

  // Register user and join private room when socket connects
  useEffect(() => {
    if (socket && currentUserId && targetUserId) {
      // Register current user
      socket.emit("register", { userId: currentUserId });
      
      // Join private room with target user
      socket.emit("join:room", { users: [currentUserId, targetUserId] });
      
      socket.on("registered", (data) => {
        console.log("User registered:", data);
        setIsConnected(true);
      });

      socket.on("room:joined", (data) => {
        console.log("Joined room:", data);
      });

      return () => {
        socket.off("registered");
        socket.off("room:joined");
      };
    }
  }, [socket, currentUserId, targetUserId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch chat history from backend server
  useEffect(() => {
    fetch("http://localhost:8000/api/messages")
      .then((res) => res.json())
      .then((data) => {
        // Filter messages to only show conversation between current user and target user
        const filteredMessages = data.filter((msg: Message) =>
          (msg.from === currentUserId && msg.to === targetUserId) ||
          (msg.from === targetUserId && msg.to === currentUserId)
        );
        setMessages(filteredMessages);
      })
      .catch((error) => {
        console.error("Error fetching messages:", error);
      });
  }, [currentUserId, targetUserId]);

  // Listen for new messages via socket
  useEffect(() => {
    if (!socket) return;
    
    const handler = (msg: Message) => {
      // Only add messages that are part of this conversation
      if (
        (msg.from === currentUserId && msg.to === targetUserId) ||
        (msg.from === targetUserId && msg.to === currentUserId)
      ) {
        setMessages((prev) => [...prev, msg]);
      }
    };
    
    socket.on("event:message", handler);
    return () => {
      socket.off("event:message", handler);
    };
  }, [socket, currentUserId, targetUserId]);

  // Send message function - restricted to target user only
  const handleSend = async () => {
    if (input.trim() && isConnected) {
      // Always send to the target user specified in header
      sendMessage(input, targetUserId);
      setInput("");
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <div className={classes["chat-container"]} style={{
      maxWidth: "600px",
      margin: "40px auto",
      background: "#181828",
      borderRadius: 10,
      boxShadow: "0 2px 8px #0004",
      padding: 16,
      color: "#fff"
    }}>
      {/* Header showing the conversation */}
      <div style={{
        background: "#222233",
        padding: "12px 16px",
        borderRadius: 8,
        marginBottom: 16,
        border: "1px solid #333"
      }}>
        <h2 style={{ margin: 0, textAlign: "center", fontSize: 18 }}>
          Chat with {targetUserId}
        </h2>
        <div style={{ 
          textAlign: "center", 
          fontSize: 12, 
          color: "#aaa", 
          marginTop: 4 
        }}>
          You are: {currentUserId} • Status: {isConnected ? "Connected" : "Connecting..."}
        </div>
      </div>

      {/* Messages container */}
      <div
        style={{
          maxHeight: 400,
          minHeight: 300,
          overflowY: "auto",
          background: "#222233",
          borderRadius: 6,
          padding: 12,
          marginBottom: 12,
          border: "1px solid #333"
        }}
      >
        {messages.length === 0 ? (
          <div style={{ 
            textAlign: "center", 
            color: "#666", 
            fontStyle: "italic",
            marginTop: 50
          }}>
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isSentByCurrentUser = msg.from === currentUserId;
            return (
              <div
                key={idx}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: isSentByCurrentUser ? "flex-end" : "flex-start",
                  marginBottom: 8,
                  width: "100%",
                }}
              >
                <div
                  style={{
                    background: isSentByCurrentUser ? "#3a5" : "#357",
                    color: "#fff",
                    padding: "8px 14px",
                    borderRadius: 18,
                    maxWidth: "75%",
                    wordBreak: "break-word",
                    fontSize: 14,
                    boxShadow: "0 1px 3px rgba(0,0,0,0.3)"
                  }}
                >
                  {msg.message}
                </div>
                <span style={{
                  fontSize: 10,
                  color: "#999",
                  marginTop: 3,
                  marginLeft: isSentByCurrentUser ? 0 : 8,
                  marginRight: isSentByCurrentUser ? 8 : 0,
                }}>
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </span>
              </div>
            );
          })
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input area */}
      <div style={{ display: "flex", gap: 8 }}>
        <input
          className={classes["chat-input"]}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleInputKeyDown}
          placeholder={`Message ${targetUserId}...`}
          disabled={!isConnected}
          style={{
            flex: 1,
            padding: 10,
            borderRadius: 6,
            border: "1px solid #444",
            background: isConnected ? "#222233" : "#333",
            color: "#fff",
            fontSize: 14
          }}
        />
        <button
          className={classes["button"]}
          onClick={handleSend}
          disabled={!input.trim() || !isConnected}
          style={{
            padding: "10px 16px",
            borderRadius: 6,
            background: (!input.trim() || !isConnected) ? "#555" : "#3a5",
            color: "#fff",
            border: "none",
            cursor: (!input.trim() || !isConnected) ? "not-allowed" : "pointer",
            fontSize: 16
          }}
        >
          ✈️
        </button>
      </div>
    </div>
  );
}