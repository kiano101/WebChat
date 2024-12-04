import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {io} from 'socket.io-client'


const GroupChat = () => {
    const socketRef = useRef(null)
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


    useEffect(() => {
        if (!socketRef.current) {
            socketRef.current = io('http://localhost:5000', {
                transports: ['websocket', 'polling'],
            });

            socketRef.current.on('connect', () => {
                console.log('Socket connected: ', socketRef.current.id);
                socketRef.current.emit('join', username);
                socketRef.current.emit('getMessageHistory')
            });

            socketRef.current.on('updateUsers', (onlineUsers) => {
              const filteredUsers = onlineUsers.filter((user) => user !== username)
                setUsers(filteredUsers);
            });

            socketRef.current.on('groupMessage', (data) => {
              setMessages((prev) => [...prev, data]);
          });

          socketRef.current.on('messageHistory', (history) => {
              setMessages(history);
          });
        }

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null
            }
        };
    }, [username]);

    const sendMessage = () => {
      if (socketRef.current && message.trim()) {
          const data = { sender: username, message, timestamp: new Date().toISOString() };
          socketRef.current.emit('sendMessage', data);
          setMessage('');
      }
  };

  const handlePrivateChat = (user) => {
    console.log(`Initiating private chat with ${user}`)
    socketRef.current.emit('initiatePrivateChat', {to: user, from: username})
    navigate(`/private-chat/${user}`)
  }

    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
          <h2
          onClick={() => navigate('/login')}
          style={{
            cursor: 'pointer'
          }}
          >
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