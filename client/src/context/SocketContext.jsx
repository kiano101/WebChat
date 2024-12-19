import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { getSocket } from '../services/socket';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const socketRef = useRef(null);
  const [isSocketReady, setIsSocketReady] = useState(false);

  const initializeSocket = () => {
    if (!socketRef.current) {
      socketRef.current = getSocket();
      socketRef.current.connect();

      socketRef.current.on('connect', () => {
        console.log('Socket connected');
        setIsSocketReady(true);
      });

      socketRef.current.on('disconnect', () => {
        console.log('Socket disconnected');
        setIsSocketReady(false);
        socketRef.current = null;
      });
    }
  };

  useEffect(() => {
    initializeSocket();

    return () => {
      if (socketRef.current) {
        console.log('Cleaning up socket...');
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  const reconnectSocket = () => {
    if (!socketRef.current || !socketRef.current.connected) {
      initializeSocket();
    }
  };

  return (
    <SocketContext.Provider
      value={{ socket: isSocketReady ? socketRef.current : null, reconnectSocket }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) throw new Error('SocketContext must be used within a SocketProvider');
  return context;
};
