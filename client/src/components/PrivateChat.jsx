import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import BootstrapAlert from './Alert'


const PrivateChat = () => {
  const { username: recipient } = useParams();
  const {socket} = useSocket()
  const [messages, setMessages] = useState([]);
  const [showAlert, setShowAlert] = useState(null)
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const messageEndRef = useRef(null)

  const userName = localStorage.getItem('username');
  if (!userName) {
    console.error('Username is missing!');
    return null;
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
    if (!socket) {
      console.warn('Socket not ready. Skipping event setup.');
      return;
    }

    console.log("Socket: ", socket)

    console.log("Emitting getPrivateMessageHistory event...");

    if (socket.connected) {
      socket.emit("getPrivateMessageHistory", {sender: userName, recipient});
    } else {
      console.warn("Socket not ready. Waiting for connection...");
    }
    

    socket.on('PrivateMessage', handlePrivateMessage)

    socket.on('privateMessages', handlePrivateMessages)

    return () => {
      socket.off('PrivateMessage', handlePrivateMessage)
      socket.off('privateMessages', handlePrivateMessages)
    };
  }, [socket, userName, recipient]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth'})
  }, [messages])

  const sendMessage = () => {
    if (message.trim()) {
      if (socket && socket.connected) {
        const data = { sender: userName, recipient, message, timestamp: new Date().toISOString() };
      socket.emit('sendPrivateMessage', data);
      console.log('message sent')
      setMessage('');
      } else {
        console.warn('Socket is not connected. Cannot send message.')
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
        sendMessage()
    }
}


  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      {showAlert && (
                <BootstrapAlert 
                    message={showAlert.message}
                    variant={showAlert.variant}
                    duration={3000} 
                    onClose={() => setShowAlert(null)} 
                />
            )}
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
};

export default PrivateChat;
