"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WifiOff, Wifi, RotateCw } from "lucide-react";

export function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [showReconnected, setShowReconnected] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [retryFailed, setRetryFailed] = useState(false);
  const wasOffline = useRef(false);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const announceReconnect = () => {
      if (wasOffline.current) {
        setShowReconnected(true);
        wasOffline.current = false;
        setTimeout(() => setShowReconnected(false), 3000);
      }
    };

    const goOnline = () => {
      setIsOnline(true);
      setRetryFailed(false);
      announceReconnect();
    };
    const goOffline = () => {
      setIsOnline(false);
      setShowReconnected(false);
      wasOffline.current = true;
    };

    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  const handleRetry = async () => {
    setRetrying(true);
    setRetryFailed(false);
    try {
      await fetch("/manifest.json", { method: "HEAD", cache: "no-store" });
      setIsOnline(true);
      if (wasOffline.current) {
        setShowReconnected(true);
        wasOffline.current = false;
        setTimeout(() => setShowReconnected(false), 3000);
      }
    } catch {
      setIsOnline(false);
      setRetryFailed(true);
      setTimeout(() => setRetryFailed(false), 2500);
    } finally {
      setRetrying(false);
    }
  };

  return (
    <AnimatePresence mode="wait">
      {!isOnline && (
        <motion.div
          key="offline"
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          role="status"
          aria-live="polite"
          className="network-status-banner network-status-offline"
        >
          <WifiOff size={16} />
          <span>
            {retryFailed ? "Still offline — check your connection" : "You're offline"}
          </span>
          <button
            onClick={handleRetry}
            disabled={retrying}
            className="network-status-retry btn-click"
          >
            <RotateCw size={13} className={retrying ? "animate-spin" : ""} />
            {retrying ? "Retrying…" : "Retry"}
          </button>
        </motion.div>
      )}

      {isOnline && showReconnected && (
        <motion.div
          key="online"
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          role="status"
          aria-live="polite"
          className="network-status-banner network-status-online"
        >
          <Wifi size={16} />
          <span>Back online</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
