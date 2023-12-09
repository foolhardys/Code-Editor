import express from 'express'
import http from 'http'
import { Server } from 'socket.io'
import { ACTIONS } from './src/Actions.js'
import path from 'path'
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express()

const server = http.createServer(app)
const io = new Server(server)

app.use(express.static('dist'))


app.use((req, res) => {
    res.sendFile(path.join( __dirname, 'dist', 'index.html'))
})

const userSocketMap = {}
const getAllConnectedClients = (roomId) => {
    return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map((socketId) => {
        return {
            socketId,
            username: userSocketMap[socketId] || 'User'
        }
    })
}

io.on('connection', (socket) => {

    socket.on(ACTIONS.JOIN, ({ roomId, username }) => {
        userSocketMap[socket.id] = username
        socket.join(roomId)
        const clients = getAllConnectedClients(roomId)
        console.log(clients);
        clients.forEach(({ socketId }) => {
            io.to(socketId).emit(ACTIONS.JOINED, {
                clients,
                username,
                socketId: socket.id,
            })
        })
    })

    socket.on(ACTIONS.CODE_CHANGE, ({ roomId, code }) => {
        socket.in(roomId).emit(ACTIONS.CODE_CHANGE, {
            code
        })
    })

    socket.on(ACTIONS.SYNC_CODE, ({ socketId, code }) => {
        io.to(socketId).emit(ACTIONS.CODE_CHANGE, { code })
    })

    socket.on('disconnecting', () => {
        const rooms = [...socket.rooms]
        rooms.forEach((roomId) => {
            socket.in(roomId).emit(ACTIONS.DISCONNECTED, {
                socketId: socket.id,
                username: userSocketMap[socket.id]
            })
        })
        delete userSocketMap[socket.id]
        socket.leave()
    })
})




const PORT = 5000
server.listen(PORT, () => {
    console.log(`listening on ${PORT}`);
})