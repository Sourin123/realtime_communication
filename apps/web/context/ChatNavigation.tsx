// components/ChatNavigation.tsx
"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

const ChatNavigation: React.FC = () => {
  const [selectedUser, setSelectedUser] = useState("");
  const router = useRouter();

  // List of available users to chat with
  const availableUsers = ["user1", "user2", "user3", "alice", "bob"];
  
  const currentUser = typeof window !== "undefined" ? 
    localStorage.getItem("userId") || "user1" : "user1";

  const handleStartChat = () => {
    if (selectedUser && selectedUser !== currentUser) {
      // Navigate to chat page with target user ID as parameter
      router.push(`/chat?userId=${selectedUser}`);
    }
  };

  return (
    <div style={{
      maxWidth: "400px",
      margin: "40px auto",
      background: "#181828",
      borderRadius: 10,
      boxShadow: "0 2px 8px #0004",
      padding: 24,
      color: "#fff"
    }}>
      <h2 style={{ textAlign: "center", marginBottom: 20 }}>
        Start a Chat
      </h2>
      
      <div style={{ marginBottom: 16 }}>
        <label style={{ 
          display: "block", 
          marginBottom: 8, 
          fontSize: 14, 
          color: "#ccc" 
        }}>
          You are: <strong>{currentUser}</strong>
        </label>
        
        <label style={{ 
          display: "block", 
          marginBottom: 8, 
          fontSize: 14, 
          color: "#ccc" 
        }}>
          Choose user to chat with:
        </label>
        
        <select
          value={selectedUser}
          onChange={(e) => setSelectedUser(e.target.value)}
          style={{
            width: "100%",
            padding: 10,
            borderRadius: 6,
            border: "1px solid #444",
            background: "#222233",
            color: "#fff",
            fontSize: 14
          }}
        >
          <option value="">Select a user...</option>
          {availableUsers
            .filter(user => user !== currentUser)
            .map(user => (
              <option key={user} value={user}>
                {user}
              </option>
            ))
          }
        </select>
      </div>

      <button
        onClick={handleStartChat}
        disabled={!selectedUser || selectedUser === currentUser}
        style={{
          width: "100%",
          padding: 12,
          borderRadius: 6,
          background: (!selectedUser || selectedUser === currentUser) ? "#555" : "#3a5",
          color: "#fff",
          border: "none",
          cursor: (!selectedUser || selectedUser === currentUser) ? "not-allowed" : "pointer",
          fontSize: 16,
          fontWeight: "bold"
        }}
      >
        Start Chat with {selectedUser || "..."}
      </button>
    </div>
  );
};

export default ChatNavigation;