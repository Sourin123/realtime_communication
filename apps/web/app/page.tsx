"use client";
import React, { useEffect, useState } from "react";
import { useSocket } from "../context/socketContex";
import classes from "./page.module.css";

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

  const handleSend = () => {
    if (input.trim() && to.trim()) {
      sendMessage(input, to);
      setInput("");
      // Optionally, add the message to local state immediately
      // setMessages((prev) => [
      //   ...prev,
      //   {
      //     message: input,
      //     from: localStorage.getItem("userId") || "user1",
      //     to,
      //     timestamp: new Date().toISOString(),
      //   },
      // ]);
    }
  };

  return (
    <div>
      <h1>Private Chat</h1>
      <div>
        <input
          value={to}
          onChange={(e) => setTo(e.target.value)}
          placeholder="Recipient userId"
          style={{ marginBottom: 8 }}
        />
      </div>
      <div
        style={{
          maxHeight: 300,
          overflowY: "auto",
          border: "1px solid #ccc",
          marginBottom: 10,
        }}
      >
        {messages.map((msg, idx) => (
            <div
            key={idx}
            style={{
              background:
              msg.from === (localStorage.getItem("userId") || "user1")
                ? "#222b22"
                : "#222233",
              color: "#fff",
            }}
            >
            <strong>{msg.from}</strong> to <strong>{msg.to}</strong>: {msg.message}
            <span
              style={{ fontSize: 10, color: "#aaa", marginLeft: 8 }}
            >{`${new Date(msg.timestamp).toLocaleTimeString()}`}</span>
            </div>
        ))}
      </div>
      <input
        className={classes["chat-input"]}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type your message here..."
      />
      <button className={classes["button"]} onClick={handleSend}>
        ✈️
      </button>
    </div>
  );
}