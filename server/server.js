const express = require('express')
const http = require('http')
const {Server} = require('socket.io')
const connectDB = require('./config/db')
const cors = require('cors')
const Message = require('./models/Message')
const { on } = require('events')
const { send } = require('process')

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

let onlineUsers = new Map()

io.on('connection', (socket) => {
    console.log("A user connected: ", socket.id)

    socket.on('join', (username) => {
     onlineUsers.set(socket.id, username)
     io.emit('updateUsers', Array.from(onlineUsers.values()))
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

    socket.on('sendPrivateMessage', async ({ sender, recipient, message }) => {
        const recipientSocketId = [...onlineUsers.entries()].find(([_, username]) => username === recipient)?.[0];
        const newMessage = {sender, recipient, message, timestamp: new Date().toISOString()}

        if (recipientSocketId) {
            io.to(recipientSocketId).emit('PrivateMessage', newMessage)
        }

        socket.emit('PrivateMessage', newMessage)

        try {
            const savedMessage = new Message({sender, receiver: recipient, message})
            await savedMessage.save()
            console.log('Message saved successfully')
        } catch (error) {
            console.error('Error saving private message: ', error)
        }
    });

    socket.on('getMessageHistory', async () => {
        try {
            const messages = await Message.find({ public: true }).sort({ timestamp: 1 });
            socket.emit('messageHistory', messages);
        } catch (error) {
            console.error('Error retrieving message history: ', error);
            socket.emit('error', { message: 'Failed to retrieve message history.' });
        }
    });

    socket.on('getPrivateMessageHistory', async ({ sender, recipient }) => {
        try {
            console.log("Fetching private messages for:", { sender, recipient });
            const messages = await Message.find({
                public: false,
                $or: [
                    { sender: sender, receiver: recipient },
                    { sender: recipient, receiver: sender },
                ],
            }).sort({ timestamp: 1 });
            if (messages.length === 0 ){
                console.warn('No messages found in the database for the users')
            }
            socket.emit('privateMessages', messages);
            console.log('messages fetched from the database')
        } catch (error) {
            console.error('Error fetching private messages:', error);
            socket.emit('error', { message: 'Failed to retrieve private messages.' });
        }
    });
    

    
    socket.on('disconnect', () => {
        const username = onlineUsers.get(socket.id)
        onlineUsers.delete(socket.id)
        io.emit('updateUsers', Array.from(onlineUsers.values()))
        console.log(`${username} disconnected`)
        console.log(`All online users: `, onlineUsers)
    })
})

const PORT = 5000
server.listen(PORT, () => console.log(`Server running on port ${PORT}`))