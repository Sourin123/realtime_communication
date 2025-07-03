console.log('Starting server...');
import mongoose from "mongoose";
import 'dotenv/config'; // Loads .env variables


import http from 'http';
import SocketService from './services/socket';

// Ensure that the MONGODB_URI environment variable is set
const url = process.env.MONGODB_URI || "mongodb://localhost:27017/messages"; // Default to a local MongoDB instance if not set
if (!url) {
  console.error("Error: MONGODB_URI environment variable is not set.");
  process.exit(1);
}

mongoose.connect(url)
  .then(() => {
    console.log("Connected to MongoDB");
    // Start your server here (e.g., app.listen or httpServer.listen)
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });


const socketService = new SocketService();

const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    
});
socketService.io.attach(server);
socketService.initListeners();


const port = process.env.serverPORT ? process.env.serverPORT : 8000;
server.listen(port, () => {
    console.log(`Server is listening on port ${port} and   http://localhost:${port}`);
});

