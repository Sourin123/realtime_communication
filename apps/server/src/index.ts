console.log('Starting server...');
import mongoose from "mongoose";
import 'dotenv/config';
import http from 'http';
import { Server } from "socket.io";
import SocketService from './services/socket';

// MongoDB connection
const url = process.env.MONGODB_URI || "mongodb://localhost:27017/messages";
if (!url) {
  console.error("Error: MONGODB_URI environment variable is not set.");
  process.exit(1);
}

mongoose.connect(url)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
    process.exit(1);
  });

// Create HTTP server
const server = http.createServer((req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    // Handle API routes
    if (req.url === '/api/messages' && req.method === 'GET') {
        handleGetMessages(req, res);
    } else if (req.url?.startsWith('/api/users/') && req.method === 'GET') {
        handleGetUser(req, res);
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
});

// Import message handler
async function handleGetMessages(req: http.IncomingMessage, res: http.ServerResponse) {
    try {
        const MessageModel = (await import('./db/Message')).default;
        const messages = await MessageModel.find().sort({ timestamp: 1 }).limit(100);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(messages));
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: "Error fetching messages" }));
    }
}

// Handle user check (mock implementation)
async function handleGetUser(req: http.IncomingMessage, res: http.ServerResponse) {
    try {
        const url = new URL(req.url!, `http://${req.headers.host}`);
        const userId = url.pathname.split('/').pop();
        
        if (!userId) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: "User ID required" }));
            return;
        }
        
        // Mock user existence check - in real app, check against user database
        const mockUsers = ['user1', 'user2', 'user3', 'alice', 'bob'];
        const userExists = mockUsers.includes(userId);
        
        if (userExists) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ user: { id: userId, name: userId } }));
        } else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: "User not found" }));
        }
    } catch (error) {
        console.error('Error checking user:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: "Internal server error" }));
    }
}

// Initialize socket service
const socketService = new SocketService();
socketService.io.attach(server);
socketService.initListeners();

const port = process.env.serverPORT || 8000;
server.listen(port, () => {
    console.log(`Server is listening on port ${port} and http://localhost:${port}`);
});