import React, { useEffect, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';


const GroupChat = () => {
    const socket = useSocket()
    const [messages, setMessages] = useState([])
    const [message, setMessage] = useState('')
    const [users, setUsers] = useState([])
    const navigate = useNavigate();

    const username = localStorage.getItem('username');
    if (!username) {
      console.error('Username is missing!');
      return;
    }

    const formatTimestamp = (timestamp) => {
      const date = new Date(timestamp);
      return date.toLocaleString();
    };

    const checkSocketConnection = () => {
      if (!socket || !socket.connected) {
        console.error('Socket is not connected!')
        return false
      }
      return true
    }

    const updateUsersHandler = useCallback((onlineUsers) => {
      const filteredUsers = onlineUsers.filter((user) => user !== username);
      setUsers(filteredUsers);
    }, [username]);
  
    const groupMessageHandler = useCallback((data) => {
      setMessages((prev) => [...prev, data]);
    }, []);
  
    const messageHistoryHandler = useCallback((history) => {
      setMessages(history);
    }, []);


    useEffect(() => {
      console.log('Socket is being initialized')
      if (!checkSocketConnection()) return;

      socket.emit('join', username)
      console.log('Socket connected: ', socket.id)
      socket.emit('getMessageHistory')

      socket.on('updateUsers', updateUsersHandler)

      socket.on('groupMessage', groupMessageHandler)

      socket.on('messageHistory', messageHistoryHandler)

        return () => {
            socket.off('updateUsers', updateUsersHandler)
            socket.off('groupMessage', groupMessageHandler)
            socket.off('messageHistory', messageHistoryHandler)
        };
    }, [socket, username, updateUsersHandler, groupMessageHandler, messageHistoryHandler]);

    const sendMessage = () => {
      if (!checkSocketConnection()) return;

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
    navigate('/login');
  };
  

    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
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
                    onClick={() => handlePrivateChat(user)}
                    style={{
                      display: 'block',
                      padding: '10px',
                      marginBottom: '5px',
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
          </div>

          <div style={{ marginTop: '10px' }}>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              style={{ width: '100%', padding: '10px', borderRadius: '4px' }}
            />
            <button
              onClick={sendMessage}
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