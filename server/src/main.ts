import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { handleSocketIO } from './utils/socket';
import { connectDB } from './database/connection';

const PORT = 8080;

const startServer = async () => {
    try {
        // Initialize the database connection
        await connectDB();

        // Create an HTTP server
        const server = http.createServer();

        // Create a Socket.IO server and attach it to the HTTP server
        const io = new SocketIOServer(server, {
            cors: {
                origin: '*',
            }
        });

        // Handle Socket.IO connections
        io.on('connection', (socket) => {
            console.log('Client connected with ID:', socket.id);
            handleSocketIO(socket);
        });

        server.listen(PORT, () => {
            console.log(`Server listening on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
    }
};

startServer();
