import { io } from 'socket.io-client';

export const initSocket = async () => {

    const BACKEND_URL = 'http://localhost:5000'
    const options = {
        'force new connection': true,
        reconnectionAttempt: 'Infinity',
        timeout: 10000,
        transports: ['websocket'],
    };
    return io(BACKEND_URL, options);
};