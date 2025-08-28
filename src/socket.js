// src/socket.js
import { io } from "socket.io-client";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// single shared socket instance
export const socket = io(API_URL, {
  transports: ["websocket"], // force WS for stability
});
