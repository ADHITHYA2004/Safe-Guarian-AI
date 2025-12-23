import { useEffect } from "react";
import { settingsApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const NotificationManager = () => {
  const { toast } = useToast();

  useEffect(() => {
    requestNotificationPermission();
    subscribeToAlerts();
  }, []);

  const requestNotificationPermission = async () => {
    if ("Notification" in window && Notification.permission === "default") {
      await Notification.requestPermission();
    }
  };

  const sendBrowserNotification = (title: string, body: string, tag: string) => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, {
        body,
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        tag,
        requireInteraction: true,
      });
    }
  };

  const isInQuietHours = async (userId: string): Promise<boolean> => {
    try {
      const data = await settingsApi.get();

      if (!data || !data.quiet_hours_enabled) return false;

      const now = new Date();
      const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

      // Check if current day is in quiet hours days
      if (!data.quiet_hours_days.includes(currentDay)) return false;

      // Parse times
      const [startHour, startMin] = data.quiet_hours_start.split(':').map(Number);
      const [endHour, endMin] = data.quiet_hours_end.split(':').map(Number);
      const [currentHour, currentMin] = currentTime.split(':').map(Number);

      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;
      const currentMinutes = currentHour * 60 + currentMin;

      // Handle overnight quiet hours (e.g., 22:00 to 08:00)
      if (startMinutes > endMinutes) {
        return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
      }

      // Handle same-day quiet hours (e.g., 12:00 to 14:00)
      return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
    } catch (error) {
      console.error('Error checking quiet hours:', error);
      return false;
    }
  };

  const subscribeToAlerts = () => {
    // Note: Real-time subscriptions would need to be implemented with WebSockets or polling
    // For now, this is a placeholder - you can implement polling if needed
    // Real-time functionality can be added later with WebSocket support or polling mechanism
    
    // Placeholder for future real-time alert notifications
    // You can implement polling here if needed:
    // const checkAlerts = async () => {
    //   // Poll for new alerts every 5 seconds
    //   // Compare with last known alert ID to detect new ones
    // };
    // const interval = setInterval(checkAlerts, 5000);
    // return () => clearInterval(interval);
    
    return () => {
      // Cleanup function
    };
  };

  return null;
};

export default NotificationManager;
