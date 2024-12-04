import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { io } from 'socket.io-client';

const PrivateChat = () => {
  const { username: recipient } = useParams();
  const socketRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const userName = localStorage.getItem('username');
  if (!userName) {
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
        socketRef.current.emit('joinPrivateChat', { sender: userName, recipient });
      });

      socketRef.current.on('privateMessage', (data) => {
        setMessages((prev) => [...prev, data]);
      });
    }

    socketRef.current.on('receivePrivateMessage', (data) => {
        const { sender, message, timestamp } = data;
        setMessages((prevMessages) => [...prevMessages, { sender, message, timestamp }]);
      });
      

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [userName, recipient]);

  const sendMessage = () => {
    if (socketRef.current && message.trim()) {
      const data = { sender: userName, recipient, message, timestamp: new Date().toISOString() };
      socketRef.current.emit('sendPrivateMessage', data);
      setMessages((prev) => [...prev, data]);
      setMessage('');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2
        onClick={() => navigate('/group-chat')}
        style={{
          cursor: 'pointer',
        }}
      >
        Chat with {recipient}
      </h2>

      <div style={{ height: '300px', overflowY: 'scroll', border: '1px solid #ccc', padding: '10px' }}>
        {messages.map((msg, index) => (
          <div key={index} style={{ marginBottom: '10px' }}>
            <strong>{msg.sender || 'User'}:</strong> {msg.message}{' '}
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
};

export default PrivateChat;
