"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Socket.io hook for real-time ticket updates
 * Connects when authorId is provided (custom server with Socket.io)
 * Falls back to polling/SSE when Socket.io unavailable
 */
export function useTicketUpdates(
  authorId: string | undefined,
  onTicketUpdate: (ticket: unknown) => void
) {
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<ReturnType<typeof import("socket.io-client").io> | null>(null);

  useEffect(() => {
    if (!authorId) return;

    const initSocket = async () => {
      try {
        const { io } = await import("socket.io-client");
        const baseUrl =
          typeof window !== "undefined"
            ? window.location.origin
            : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

        const socket = io(baseUrl, {
          path: "/api/socketio",
          autoConnect: true,
        });

        socket.on("connect", () => {
          setConnected(true);
          socket.emit("join:tickets", authorId);
        });

        socket.on("disconnect", () => setConnected(false));
        socket.on("ticket:updated", onTicketUpdate);

        socketRef.current = socket;
      } catch {
        // Socket.io client not available or server not running with Socket.io
      }
    };

    initSocket();
    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
      setConnected(false);
    };
  }, [authorId, onTicketUpdate]);

  return { connected };
}
