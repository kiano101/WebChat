import React, { useEffect, useCallback, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import BootstrapAlert from './Alert'

const GroupChat = () => {
    const {socket, reconnectSocket} = useSocket()
    const [messages, setMessages] = useState([])
    const [message, setMessage] = useState('')
    const [users, setUsers] = useState([])
    const [showAlert, setShowAlert] = useState(null)
    const [incomingMessage, setIncomingMessage] = useState(null)
    const navigate = useNavigate();
    const messageEndRef = useRef(null)

    const username = localStorage.getItem('username');
    if (!username) {
      console.log('Username is missing!');
      return null;
    }

    const formatTimestamp = (timestamp) => {
      const date = new Date(timestamp);
      return date.toLocaleString();
    };

    const privateNotifications = (data) => {
      setShowAlert({
        message: `New Private Message from ${data.sender}`,
        variant: 'info'
      })
    }
 

    const updateUsersHandler = useCallback((onlineUsers) => {
      const filteredUsers = onlineUsers.filter((user) => user !== username);
      setUsers(filteredUsers);
    }, [username]);
  
    const groupMessageHandler = useCallback((data) => {
      setMessages((prev) => [...prev, data]);
      setIncomingMessage(data)
      const truncatedMessage = data.message.length > 50 ? `${data.message.slice(0, 50)}...` : data.message;
      setShowAlert({
        message: `New Group Message from ${data.sender}: ${truncatedMessage}`,
        variant: 'info'
      })
      setTimeout(() => setShowAlert(null), 500)
    }, []);
  
    const messageHistoryHandler = useCallback((history) => {
      setMessages(history);
    }, []);


    useEffect(() => {
      if (!socket) {
        reconnectSocket()
        return;
      }

      socket.emit('join', username)
      console.log('Socket connected: ', socket.id)
      socket.emit('getMessageHistory')

      socket.on('updateUsers', updateUsersHandler)

      socket.on('groupMessage', groupMessageHandler)

      socket.on('messageHistory', messageHistoryHandler)

      socket.on('PrivateMessage', (data) => {
        setShowAlert({
          message: `New Private Message from ${data.sender}`,
          variant: 'info'
        })
      })

        return () => {
            socket.off('updateUsers', updateUsersHandler)
            socket.off('groupMessage', groupMessageHandler)
            socket.off('messageHistory', messageHistoryHandler)
            socket.off('PrivateMessage')
        };
    }, [socket, username, updateUsersHandler, groupMessageHandler, messageHistoryHandler]);

    useEffect(() => {
      messageEndRef.current?.scrollIntoView({ behavior: 'smooth'})
    }, [messages])

    const sendMessage = () => {

      if (message.trim()) {
          const data = { sender: username, message, timestamp: new Date().toISOString() };
          socket.emit('sendMessage', data);
          setMessage('');
      }
  };

  const handlePrivateChat = (user) => {
    console.log(`Initiating private chat with ${user}`)
    navigate(`/private-chat/${user}`)
  }

  const handleLogout = () => {
    socket.disconnect();
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    navigate('/login');
  };
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
        sendMessage()
    }
}

if (!socket) {
  return <div>Connecting to the chat...</div>
}

    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
          {showAlert && (
                <BootstrapAlert 
                    message={showAlert.message}
                    variant={showAlert.variant}
                    duration={5000} 
                    onClose={() => setShowAlert(null)} 
                />
            )}
          <h2>
            <img
              src='/exit.png'
              alt='Logout'
              onClick={handleLogout}
              style={{
                cursor: 'pointer',
                width: '24px',
                height: '24px',
                marginRight: '20px'
              }}
              title='Logout'
          />
            Group Chat
          </h2>

          <h3>Connected Users:</h3>
            <div style={{ marginBottom: '20px' }}>
              {users.length > 0 ? (
                users.map((user, index) => (
                  <button
                    key={index}
                    className='custom-btn'
                    onClick={() => handlePrivateChat(user)}
                    style={{
                      display: 'block',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      width: '80px',
                      height: '40px'
                    }}
                  >
                    {user}
                  </button>
                ))
              ) : (
                <div>No other users are currently connected.</div>
              )}
            </div>

          <div style={{ height: '300px', overflowY: 'scroll', border: '1px solid #ccc', padding: '10px', backgroundColor: 'white' }}>
            {messages.map((msg, index) => (
              <div key={index} style={{ marginBottom: '10px' }}>
                <strong>{msg.sender || 'User'}:</strong> {msg.message || msg}{' '}
                <span style={{ color: 'gray', fontSize: '12px' }}>
                  <i>{formatTimestamp(msg.timestamp || new Date().toISOString())}</i>
                </span>
              </div>
            ))}
            <div ref={messageEndRef} />
          </div>

          <div style={{ marginTop: '10px' }}>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              style={{ width: '100%', padding: '10px', borderRadius: '4px' }}
              onKeyDown={handleKeyDown}
            />
            <button
              onClick={sendMessage}
              className='custom-btn'
              style={{
                marginTop: '10px',
                width: '100%',
                padding: '10px',
                border: 'none',
                borderRadius: '4px',
              }}
            >
              Send
            </button>
          </div>
        </div>
      );
}

export default GroupChat;