import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';

const PrivateChat = () => {
  const { username: recipient } = useParams();
  const socket = useSocket()
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

  const handlePrivateMessage = (data) => {
    setMessages((prev) => [...prev,data])
  }

  const handlePrivateMessages = (messages) => {
    console.log('Received privateMessages: ', messages)
    setMessages(messages)
  }

  useEffect(() => {
    console.log("Emitting getPrivateMessageHistory event...");

    socket.emit('getPrivateMessageHistory', {sender: userName, recipient})

    socket.on('PrivateMessage', handlePrivateMessage)

    socket.on('privateMessages', handlePrivateMessages)

    return () => {
      socket.off('PrivateMessage', handlePrivateMessage)
      socket.off('privateMessages', handlePrivateMessages)
    };
  }, [socket, userName, recipient]);

  const sendMessage = () => {
    if (message.trim()) {
      const data = { sender: userName, recipient, message, timestamp: new Date().toISOString() };
      socket.emit('sendPrivateMessage', data);
      console.log('message sent')
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

      <div style={{ height: '300px', overflowY: 'scroll', border: '1px solid #ccc', padding: '10px', backgroundColor: 'white' }}>
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
