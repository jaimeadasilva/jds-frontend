/**
 * usePushNotifications
 * Registers service worker + requests push permission.
 * Call requestPermission() on a user gesture (button click).
 */
import { useState, useEffect } from "react";

export function usePushNotifications() {
  const [supported,   setSupported]   = useState(false);
  const [permission,  setPermission]  = useState("default");
  const [subscribed,  setSubscribed]  = useState(false);

  useEffect(() => {
    const ok = "serviceWorker" in navigator && "Notification" in window;
    setSupported(ok);
    if (ok) setPermission(Notification.permission);
  }, []);

  const requestPermission = async () => {
    if (!supported) return;
    try {
      // Register service worker
      const reg = await navigator.serviceWorker.register("/sw.js");
      // Request notification permission
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result === "granted") {
        // Show a local test notification
        reg.showNotification("JDS Clinic 🏋️", {
          body: "Notifications enabled! You'll hear from us when clients complete workouts.",
          icon: "/icon-192.png",
        });
        setSubscribed(true);
      }
    } catch (err) {
      console.error("Push registration failed:", err);
    }
  };

  const sendLocalNotification = async (title, body) => {
    if (permission !== "granted") return;
    const reg = await navigator.serviceWorker.ready;
    reg.showNotification(title, { body, icon:"/icon-192.png" });
  };

  return { supported, permission, subscribed, requestPermission, sendLocalNotification };
}
