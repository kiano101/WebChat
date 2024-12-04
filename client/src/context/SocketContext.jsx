// SocketContext.jsx

import React, { createContext, useContext, useRef, useEffect } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
    const socketRef = useRef(null);

    useEffect(() => {

        if (!socketRef.current) {
            socketRef.current = io('http://localhost:5000', {
                transports: ['websocket', 'polling'],
            });
        }
        return () => {
        };
    }, []);

    return (
        <SocketContext.Provider value={socketRef.current}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => {
    const socket = useContext(SocketContext);
    if (!socket) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return socket;
};
