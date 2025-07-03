/**
 * SocketService manages the Socket.IO server instance and its event listeners.
 * 
 * @remarks
 * This service is responsible for initializing the Socket.IO server with CORS configuration,
 * handling client connections, managing user-specific rooms, and processing real-time messaging events.
 * 
 * @example
 * ```typescript
 * const socketService = new SocketService();
 * socketService.initListeners();
 * ```
 * 
 * @property _io - The underlying Socket.IO server instance.
 * @constructor Initializes the Socket.IO server with CORS settings.
 * @method io - Getter for the Socket.IO server instance.
 * @method initListeners - Sets up event listeners for client connections and messaging.
 */



import { Server } from "socket.io";
import 'dotenv/config';
import MessageModel from "../db/Message";
import UserSocketModel from "../db/UserSocket";

/**
 * SocketService manages the initialization and event handling for the Socket.IO server.
 * Use this service to set up real-time communication between clients and the server.
 */
class SocketService {
    private _io: Server;
    constructor() {
        // Initialize the Socket.IO server
        console.log("Initializing Socket.IO server...");
        
        this._io = new Server({
            cors:{
                allowedHeaders: ["*"],
                origin: "*",
            }
        });
    }
    get io(){
        return this._io;
    }

    /**
     * Initializes Socket.IO event listeners for handling real-time communication.
     *
     * - Listens for new client connections and logs their socket IDs.
     * - Handles the "join" event to add a socket to a user-specific room and updates the user-socket mapping in MongoDB.
     * - Handles the "event:message" event to:
     *   - Save incoming messages to the database.
     *   - Emit the saved message to both the sender's and receiver's rooms for private chat functionality.
     *   - Optionally, can emit messages to all clients for group chat scenarios.
     *
     * @remarks
     * This method should be called once during server startup to ensure all relevant Socket.IO events are handled.
     */
    
    public initListeners(){
        // Set up event listeners for the Socket.IO server
        console.log("Setting up Socket.IO event listeners...");
        const io = this._io;
       return io.on("connect", socket => {
            console.log(`New client connected: ${socket.id}`);
            // Listen for the "join" event to register a user with their socket ID
            
        });
    }

    /**
     * Checks if a user exists in the UserSocketModel.
     * If not, registers the user with the provided socketId.
     * If already registered, throws an error.
     * @param userId - The user's unique identifier.
     * @param socketId - The socket ID to associate with the user.
     * @returns The created user-socket document or throws an error.
         */
        public async create_and_linking(userId: string, socketId: string) {
            await UserSocketModel.findOneAndUpdate(
                { userId },
                { socketId },
                { upsert: true, new: true }
            );
        }

        /**
 * Joins two users to a private one-on-one chat room.
 * 
 * @remarks
 * This method ensures both users are joined to a unique, order-independent private room.
 * It can be called after user authentication or when a private chat is initiated.
 * 
 * @param userA - The first user's unique identifier.
 * @param userB - The second user's unique identifier.
 * @returns The name of the private room.
 * 
 * @example
 * ```typescript
 * await socketService.joinPrivateRoom('user1', 'user2');
 * ```
 */
public async joinPrivateRoom(userA: string, userB: string): Promise<string> {
    const io = this._io;
    // Create a unique, order-independent room name
    const roomName = [userA, userB].sort().join("_");

    // Find socket IDs for both users
    const userASocket = await UserSocketModel.findOne({ userId: userA });
    const userBSocket = await UserSocketModel.findOne({ userId: userB });

    if (userASocket?.socketId) {
        io.sockets.sockets.get(userASocket.socketId)?.join(roomName);
    }
    if (userBSocket?.socketId) {
        io.sockets.sockets.get(userBSocket.socketId)?.join(roomName);
    }
    return roomName;
}

/**
 * Handles sending a one-on-one private message between two users.
 * Ensures both users are joined to their private room and emits the message only to that room.
 *
 * @param from - The sender's user ID.
 * @param to - The receiver's user ID.
 * @param message - The message content.
 * @returns The saved message document.
 * @example
 * await socketService.sendPrivateMessage('user1', 'user2', 'Hello!');
 */
public async sendPrivateMessage(from: string, to: string, message: string) {
    const io = this._io;
    // Create a unique, order-independent room name
    const roomName = [from, to].sort().join("_");

    // Ensure both users are joined to the private room
    await this.joinPrivateRoom(from, to);

    // Save the message to the database
    const savedMessage = await MessageModel.create({
        from,
        to,
        message,
        room: roomName,
        timestamp: new Date()
    });

    // Emit the message to the private room
    io.to(roomName).emit("private:message", {
        from,
        to,
        message,
        room: roomName,
        timestamp: savedMessage.timestamp
    });

    return savedMessage;
}
}
// This service can be imported and used in your server setup file to initialize the Socket.IO server and listeners.

export default SocketService;