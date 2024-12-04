const express = require('express')
const http = require('http')
const {Server} = require('socket.io')
const connectDB = require('./config/db')
const cors = require('cors')
const Message = require('./models/Message')

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
    cors : {
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST'],
        credentials: true
    },
    transports: ['websocket', 'polling']
})

connectDB()

app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
}));
app.use(express.json())

app.use('/api/auth', require('./routes/auth'))
app.use('/api/chat', require('./routes/chat'))

let onlineUsers = []

io.on('connection', (socket) => {
    console.log("A user connected: ", socket.id)

    socket.on('join', (username) => {
     onlineUsers[socket.id] = username
     io.emit('updateUsers', Object.values(onlineUsers))
     console.log(`${username} joined the chat`)
     console.log(`All online users: `, onlineUsers)
    });
    

    socket.on('sendMessage', async (data) => {
        console.log(data)
        const { sender, message } = data;

        try {
            const newMessage = new Message({ sender, message, public: true });
            await newMessage.save();
            io.emit('groupMessage', newMessage);
            console.log(`Group message from ${sender}: ${message}`)
        } catch (error) {
            console.error('Error saving message: ', error);
        }
    })

    socket.on('privateMessage', async ({ sender, receiverId, message }) => {
        socket.to(receiverId).emit('receivePrivateMessage', { sender, message, timestamp });
    
        try {
            const newMessage = new Message({ sender, receiver: receiverId, message });
            await newMessage.save();
        } catch (error) {
            console.error('Error saving private message: ', error);
        }
    });

    socket.on('initiatePrivateChat', ({to, from}) => {
        const recipientSocket = Object.keys(onlineUsers).find(
            (key) => onlineUsers[key] === to
        )
        if (recipientSocket) {
            io.to(recipientSocket).emit('privateMessage', {
                from,
                message: `Private chat initiated by ${from}`
            })
            console.log(`Private chat initiated from : ${from}, to : ${to}`)
        }
    })
    

    socket.on('getMessageHistory', async () => {
        try {
            const messages = await Message.find({ public: true }).sort({ timestamp: 1 });
            socket.emit('messageHistory', messages);
        } catch (error) {
            console.error('Error retrieving message history: ', error);
            socket.emit('error', { message: 'Failed to retrieve message history.' });
        }
    });
    

    socket.on('disconnect', () => {
        const username = onlineUsers[socket.id]
        delete onlineUsers[socket.id]
        io.emit('updateUsers', Object.values(onlineUsers))
        console.log(`${username} disconnected`)
        console.log(`All online users: `, onlineUsers)
    })
})

const PORT = 5000
server.listen(PORT, () => console.log(`Server running on port ${PORT}`))