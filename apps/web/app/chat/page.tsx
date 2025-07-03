/**
 * Chat page component for private messaging between users.
 *
 * - Redirects to the login page if the user is not authenticated.
 * - Fetches chat history from the backend server on mount.
 * - Listens for new messages via a socket connection.
 * - Allows sending messages to a specified recipient user ID.
 * - Displays messages exchanged between the current user and the selected recipient.
 * - Automatically scrolls to the latest message.
 *
 * @component
 * @returns {JSX.Element} The rendered chat page.
 */




"use client";
import React, { useEffect, useRef, useState } from "react";
import { useSocket } from "../../context/socketContex";
import classes from "../page.module.css";
import { useRouter } from "next/navigation";

type Message = {
  message: string;
  timestamp: string;
  from: string;
  to: string;
};

export default function Page() {
  const { sendMessage, socket } = useSocket();
  const [input, setInput] = useState("");
  const [to, setTo] = useState(""); // recipient userId
  const [messages, setMessages] = useState<Message[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

    // Redirect to login if userId is not set
  //    useEffect(() => {
  //   const userId = localStorage.getItem("userId");
  //   if (!userId) {
  //     router.replace("/login"); // Redirect to login page if not signed in
  //   }
  // }, [router]);

  // Scroll to bottom when messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch chat history from backend server
  useEffect(() => {
    fetch("http://localhost:8000/api/messages")
      .then((res) => res.json())
      .then((data) => setMessages(data));
  }, []);

  // Listen for new messages via socket
  useEffect(() => {
    if (!socket) return;
    const handler = (msg: Message) => setMessages((prev) => [...prev, msg]);
    socket.on("event:message", handler);
    return () => {
      socket.off("event:message", handler);
    };
  }, [socket]);

  const [userId, setUserId] = useState<string>("user1");
  const [userError, setUserError] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUserId = localStorage.getItem("userId");
      if (storedUserId) setUserId(storedUserId);
    }
  }, []);

  // Register the user on socket connect
  useEffect(() => {
    if (socket && userId) {
      socket.emit("register", { userId });
    }
  }, [socket, userId]);

  // Helper to check if a user exists
  const checkUserExists = async (userIdToCheck: string) => {
    try {
      const res = await fetch(`http://localhost:8000/api/users/${userIdToCheck}`);
      if (!res.ok) return false;
      const data = await res.json();
      return !!data?.user;
    } catch {
      return false;
    }
  };

  // Handler to join a private room between current user and recipient
  const handleStartChat = async () => {
    setUserError("");
    if (!to || to === userId) return;
    const exists = await checkUserExists(to);
    if (!exists) {
      setUserError("User not found.");
      return;
    }
    if (socket && userId && to && userId !== to) {
      socket.emit("join:room", { users: [userId, to] });
    }
  };

  const handleSend = async () => {
    setUserError("");
    if (input.trim() && to.trim()) {
      const exists = await checkUserExists(to);
      if (!exists) {
        setUserError("User not found.");
        return;
      }
      sendMessage(input, to);
      setInput("");
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <div className={classes["chat-container"]} style={{
      maxWidth: "600",
      margin: "40px",
      background: "#181828",
      borderRadius: 10,
      boxShadow: "0 2px 8px #0004",
      padding: 16,
      color: "#fff"
    }}>
      <h2 style={{ textAlign: "center", marginBottom: 12 }}>Private Chat</h2>
      <div style={{ marginBottom: 10 }}>
        <input
          value={to}
          onChange={e => { setTo(e.target.value); setUserError(""); }}
          placeholder="Recipient userId"
          style={{
            width: "96%",
            padding: 8,
            borderRadius: 4,
            border: "1px solid #444",
            marginBottom: 8,
            background: "#222233",
            color: "#fff"
          }}
        />
        <button
          onClick={handleStartChat}
          style={{
            marginLeft: 8,
            padding: "8px 12px",
            borderRadius: 4,
            background: "#357",
            color: "#fff",
            border: "none",
            cursor: "pointer"
          }}
          disabled={!to || to === userId}
        >
          Start Chat
        </button>
        {userError && (
          <div style={{ color: "#f55", marginTop: 4, fontSize: 13 }}>
            {userError}
          </div>
        )}
      </div>
      <div
        style={{
          maxHeight: 300,
          minHeight: 200,
          overflowY: "auto",
          background: "#222233",
          borderRadius: 6,
          padding: 8,
          marginBottom: 10,
          border: "1px solid #333"
        }}
      >
        {messages
          .filter(msg =>
            (msg.from === userId && msg.to === to) ||
            (msg.from === to && msg.to === userId)
          )
          .map((msg, idx) => {
            // Determine if the message is sent by the current user
            const isSentByCurrentUser = msg.from === userId;
            return (
              <div
                key={idx}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: isSentByCurrentUser ? "flex-end" : "flex-start",
                  marginBottom: 6,
                  // Ensure received messages are on the left, sent on the right
                  alignSelf: isSentByCurrentUser ? "flex-end" : "flex-start",
                  width: "100%",
                }}
              >
                <div
                  style={{
                    background: isSentByCurrentUser ? "#3a5" : "#357",
                    color: "#fff",
                    padding: "6px 12px",
                    borderRadius: 16,
                    maxWidth: "80%",
                    wordBreak: "break-word",
                    fontSize: 15,
                    alignSelf: isSentByCurrentUser ? "flex-end" : "flex-start",
                  }}
                >
                  {msg.message}
                </div>
                <span style={{
                  fontSize: 10,
                  color: "#aaa",
                  marginTop: 2,
                  marginLeft: isSentByCurrentUser ? 0 : 8,
                  marginRight: isSentByCurrentUser ? 8 : 0,
                  alignSelf: isSentByCurrentUser ? "flex-end" : "flex-start",
                }}>
                  {isSentByCurrentUser ? "You" : msg.from} • {new Date(msg.timestamp).toLocaleTimeString()}
                </span>
              </div>
            );
          })}
        <div ref={chatEndRef} />
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          className={classes["chat-input"]}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleInputKeyDown}
          placeholder="Type your message here..."
          style={{
            flex: 1,
            padding: 8,
            borderRadius: 4,
            border: "1px solid #444",
            background: "#222233",
            color: "#fff"
          }}
        />
        <button
          className={classes["button"]}
          onClick={handleSend}
          style={{
            padding: "8px 16px",
            borderRadius: 4,
            background: "#3a5",
            color: "#fff",
            border: "none",
            cursor: "pointer"
          }}
        >
          ✈️
        </button>
      </div>
    </div>
  );
}