import { Server } from "socket.io";
import 'dotenv/config';
import MessageModel from "../db/Message";
import UserSocketModel from "../db/UserSocket";

class SocketService {
    private _io: Server;
    
    constructor() {
        console.log("Initializing Socket.IO server...");
        this._io = new Server({
            cors: {
                allowedHeaders: ["*"],
                origin: "*",
            }
        });
    }

    get io() {
        return this._io;
    }

    public initListeners() {
        console.log("Setting up Socket.IO event listeners...");
        const io = this._io;
        
        io.on("connection", (socket) => {
            console.log(`New client connected: ${socket.id}`);
            
            // Handle user registration
            socket.on("register", async (data: { userId: string }) => {
                try {
                    console.log(`User ${data.userId} registering with socket ${socket.id}`);
                    await this.create_and_linking(data.userId, socket.id);
                    socket.emit("registered", { success: true, userId: data.userId });
                } catch (error) {
                    console.error("Error registering user:", error);
                    socket.emit("registered", { success: false, error: "Registration failed" });
                }
            });

            // Handle joining private rooms
            socket.on("join:room", async (data: { users: string[] }) => {
                try {
                    if (data.users.length === 2) {
                        const [userA, userB] = data.users;
                        const roomName = await this.joinPrivateRoom(userA, userB);
                        socket.emit("room:joined", { room: roomName, users: data.users });
                        console.log(`Users ${userA} and ${userB} joined room: ${roomName}`);
                    }
                } catch (error) {
                    console.error("Error joining room:", error);
                    socket.emit("room:error", { error: "Failed to join room" });
                }
            });

            // Handle private messages
            socket.on("event:message", async (data: { message: string; to: string; from: string }) => {
                try {
                    console.log(`Message from ${data.from} to ${data.to}: ${data.message}`);
                    await this.sendPrivateMessage(data.from, data.to, data.message);
                } catch (error) {
                    console.error("Error sending message:", error);
                    socket.emit("message:error", { error: "Failed to send message" });
                }
            });

            // Handle disconnection
            socket.on("disconnect", () => {
                console.log(`Client disconnected: ${socket.id}`);
            });
        });
    }

    public async create_and_linking(userId: string, socketId: string) {
        await UserSocketModel.findOneAndUpdate(
            { userId },
            { socketId },
            { upsert: true, new: true }
        );
    }

    public async joinPrivateRoom(userA: string, userB: string): Promise<string> {
        const io = this._io;
        const roomName = [userA, userB].sort().join("_");

        const userASocket = await UserSocketModel.findOne({ userId: userA });
        const userBSocket = await UserSocketModel.findOne({ userId: userB });

        if (userASocket?.socketId) {
            const socketA = io.sockets.sockets.get(userASocket.socketId);
            if (socketA) {
                socketA.join(roomName);
                console.log(`User ${userA} joined room ${roomName}`);
            }
        }
        if (userBSocket?.socketId) {
            const socketB = io.sockets.sockets.get(userBSocket.socketId);
            if (socketB) {
                socketB.join(roomName);
                console.log(`User ${userB} joined room ${roomName}`);
            }
        }
        return roomName;
    }

    public async sendPrivateMessage(from: string, to: string, message: string) {
        const io = this._io;
        const roomName = [from, to].sort().join("_");

        // Ensure both users are joined to the private room
        await this.joinPrivateRoom(from, to);

        // Save the message to the database
        const savedMessage = await MessageModel.create({
            from,
            to,
            message,
            timestamp: new Date()
        });

        // Emit the message to the private room
        io.to(roomName).emit("event:message", {
            from,
            to,
            message,
            timestamp: savedMessage.timestamp
        });

        console.log(`Message sent to room ${roomName}: ${message}`);
        return savedMessage;
    }
}

export default SocketService;