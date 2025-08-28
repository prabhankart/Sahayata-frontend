import { io } from "socket.io-client";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const socket = io(API_URL, {
  transports: ["websocket"],
  withCredentials: true,   // important if using cookies/session
});
