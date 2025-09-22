import { apiCall } from '../utils/supabase/client';
import { toast } from 'sonner@2.0.3';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success' | 'emergency';
  sender_id: string;
  sender_name: string;
  target_user_id: string | 'all';
  read: boolean;
  created_at: string;
  action_url?: string;
  metadata?: any;
}

export interface NotificationCreate {
  title: string;
  message: string;
  type?: Notification['type'];
  target_user_id?: string;
  action_url?: string;
  metadata?: any;
}

class NotificationService {
  private pollingInterval: NodeJS.Timeout | null = null;
  private isPolling = false;
  private lastCheck = Date.now();

  // Start polling for new notifications
  startPolling(userId: string, intervalMs: number = 30000): void {
    if (this.isPolling) {
      return;
    }

    this.isPolling = true;
    this.pollingInterval = setInterval(async () => {
      try {
        await this.checkForNewNotifications(userId);
      } catch (error) {
        console.error('Notification polling error:', error);
      }
    }, intervalMs);

    console.log('Started notification polling');
  }

  // Stop polling for notifications
  stopPolling(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
    this.isPolling = false;
    console.log('Stopped notification polling');
  }

  // Check for new notifications and show toasts
  private async checkForNewNotifications(userId: string): Promise<void> {
    try {
      const notifications = await this.getNotifications(userId);
      const newNotifications = notifications.filter(
        n => new Date(n.created_at).getTime() > this.lastCheck && !n.read
      );

      for (const notification of newNotifications) {
        this.showNotificationToast(notification);
      }

      this.lastCheck = Date.now();
    } catch (error) {
      console.error('Failed to check for new notifications:', error);
    }
  }

  // Show notification as toast
  private showNotificationToast(notification: Notification): void {
    const toastOptions = {
      description: notification.message,
      duration: notification.type === 'emergency' ? 0 : 5000, // Emergency notifications don't auto-dismiss
    };

    switch (notification.type) {
      case 'success':
        toast.success(notification.title, toastOptions);
        break;
      case 'warning':
        toast.warning(notification.title, toastOptions);
        break;
      case 'error':
      case 'emergency':
        toast.error(notification.title, toastOptions);
        break;
      default:
        toast.info(notification.title, toastOptions);
        break;
    }

    // Play sound for emergency notifications
    if (notification.type === 'emergency') {
      this.playNotificationSound();
    }
  }

  // Create a new notification
  async createNotification(notificationData: NotificationCreate): Promise<Notification | null> {
    try {
      const { notification } = await apiCall('/notifications', {
        method: 'POST',
        body: JSON.stringify(notificationData)
      });

      return notification;
    } catch (error) {
      console.error('Failed to create notification:', error);
      // Create mock notification for demo purposes
      const mockNotification = this.createMockNotification(notificationData);
      this.saveNotificationLocally(mockNotification);
      return mockNotification;
    }
  }

  // Get notifications for a user
  async getNotifications(userId: string): Promise<Notification[]> {
    try {
      const { notifications } = await apiCall(`/notifications/${userId}`);
      return notifications || [];
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      // Return mock data for demo purposes
      return this.getMockNotifications(userId);
    }
  }

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<boolean> {
    try {
      await apiCall(`/notifications/${notificationId}/read`, {
        method: 'PUT'
      });
      return true;
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      return false;
    }
  }

  // Mark all notifications as read for a user
  async markAllAsRead(userId: string): Promise<boolean> {
    try {
      await apiCall(`/notifications/${userId}/read-all`, {
        method: 'PUT'
      });
      return true;
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      return false;
    }
  }

  // Send emergency alert to all users
  async sendEmergencyAlert(title: string, message: string, metadata?: any): Promise<boolean> {
    try {
      const notification = await this.createNotification({
        title,
        message,
        type: 'emergency',
        target_user_id: 'all',
        metadata
      });

      if (notification) {
        // Also show local toast immediately
        toast.error(title, {
          description: message,
          duration: 0 // Don't auto-dismiss emergency alerts
        });
        this.playNotificationSound();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to send emergency alert:', error);
      return false;
    }
  }

  // Send targeted notification to specific user
  async sendToUser(userId: string, title: string, message: string, type: Notification['type'] = 'info'): Promise<boolean> {
    try {
      const notification = await this.createNotification({
        title,
        message,
        type,
        target_user_id: userId
      });

      return !!notification;
    } catch (error) {
      console.error('Failed to send notification to user:', error);
      return false;
    }
  }

  // Send broadcast notification to all users
  async broadcast(title: string, message: string, type: Notification['type'] = 'info'): Promise<boolean> {
    try {
      const notification = await this.createNotification({
        title,
        message,
        type,
        target_user_id: 'all'
      });

      return !!notification;
    } catch (error) {
      console.error('Failed to broadcast notification:', error);
      return false;
    }
  }

  // Get unread notification count
  async getUnreadCount(userId: string): Promise<number> {
    try {
      const notifications = await this.getNotifications(userId);
      return notifications.filter(n => !n.read).length;
    } catch (error) {
      console.error('Failed to get unread count:', error);
      return 0;
    }
  }

  // Request notification permission (for browser notifications)
  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  // Show browser notification
  private showBrowserNotification(notification: Notification): void {
    if (Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        tag: notification.id,
        requireInteraction: notification.type === 'emergency'
      });
    }
  }

  // Play notification sound
  private playNotificationSound(): void {
    try {
      // Create audio context and play a simple beep
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.warn('Could not play notification sound:', error);
    }
  }

  // Cleanup when service is destroyed
  cleanup(): void {
    this.stopPolling();
  }

  // Mock data for demo purposes
  private getMockNotifications(userId: string): Notification[] {
    const now = new Date();
    return [
      {
        id: 'notif-001',
        title: 'New Shift Assignment',
        message: 'You have been assigned to Downtown Plaza for tomorrow\'s night shift',
        type: 'info',
        sender_id: 'admin-001',
        sender_name: 'System Admin',
        target_user_id: userId,
        read: false,
        created_at: new Date(now.getTime() - 10 * 60 * 1000).toISOString()
      },
      {
        id: 'notif-002',
        title: 'Incident Resolved',
        message: 'The security incident at Corporate Center has been resolved',
        type: 'success',
        sender_id: 'supervisor-001',
        sender_name: 'John Supervisor',
        target_user_id: userId,
        read: false,
        created_at: new Date(now.getTime() - 30 * 60 * 1000).toISOString()
      },
      {
        id: 'notif-003',
        title: 'Training Reminder',
        message: 'Your security certification training is due in 3 days',
        type: 'warning',
        sender_id: 'hr-001',
        sender_name: 'HR Department',
        target_user_id: userId,
        read: true,
        created_at: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'notif-004',
        title: 'Weather Alert',
        message: 'Severe weather warning issued for your patrol area',
        type: 'warning',
        sender_id: 'system',
        sender_name: 'Weather System',
        target_user_id: 'all',
        read: true,
        created_at: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString()
      }
    ];
  }

  private createMockNotification(notificationData: NotificationCreate): Notification {
    return {
      id: `notif-${Date.now()}`,
      title: notificationData.title,
      message: notificationData.message,
      type: notificationData.type || 'info',
      sender_id: 'current-user',
      sender_name: 'Demo User',
      target_user_id: notificationData.target_user_id || 'current-user',
      read: false,
      created_at: new Date().toISOString(),
      action_url: notificationData.action_url,
      metadata: notificationData.metadata
    };
  }

  private saveNotificationLocally(notification: Notification): void {
    const localNotifications = JSON.parse(localStorage.getItem('demo-notifications') || '[]');
    localNotifications.unshift(notification);
    localStorage.setItem('demo-notifications', JSON.stringify(localNotifications.slice(0, 50))); // Keep last 50 notifications
  }
}

export const notificationService = new NotificationService();