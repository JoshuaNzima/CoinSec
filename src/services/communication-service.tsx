import { apiCall } from '../utils/supabase/client';
import { toast } from 'sonner@2.0.3';

export interface Message {
  id: string;
  sender_id: string;
  sender_name: string;
  recipient_id: string; // 'all' for broadcast messages
  message: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  group_message: boolean;
  timestamp: string;
  read: boolean;
  message_type?: 'text' | 'voice' | 'image' | 'location' | 'alert';
  attachments?: string[];
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
}

export interface MessageCreate {
  recipient_id?: string;
  message: string;
  priority?: Message['priority'];
  group_message?: boolean;
  message_type?: Message['message_type'];
  attachments?: File[];
  location?: Message['location'];
}

export interface ChatRoom {
  id: string;
  name: string;
  description?: string;
  type: 'direct' | 'group' | 'broadcast' | 'emergency';
  participants: string[];
  created_by: string;
  created_at: string;
  last_message?: Message;
  unread_count: number;
}

class CommunicationService {
  private messageSound: HTMLAudioElement | null = null;
  private notificationSound: HTMLAudioElement | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.messageSound = new Audio();
      this.messageSound.src = 'data:audio/wav;base64,UklGRvI/AABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU4/AAA=';
      
      this.notificationSound = new Audio();
      this.notificationSound.src = 'data:audio/wav;base64,UklGRvI/AABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU4/AAA=';
    }
  }

  async sendMessage(messageData: MessageCreate): Promise<Message | null> {
    try {
      const { message } = await apiCall('/messages', {
        method: 'POST',
        body: JSON.stringify(messageData)
      });

      this.playMessageSound();
      toast.success('Message sent');
      return message;
    } catch (error) {
      console.error('Failed to send message:', error);
      
      // For demo purposes, create mock message
      const mockMessage = this.createMockMessage(messageData);
      this.saveMessageLocally(mockMessage);
      this.playMessageSound();
      toast.success('Message sent (demo mode)');
      return mockMessage;
    }
  }

  async getMessages(userId: string): Promise<Message[]> {
    try {
      const { messages } = await apiCall(`/messages/${userId}`);
      return messages || [];
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      return this.getMockMessages();
    }
  }

  async markMessageAsRead(messageId: string): Promise<boolean> {
    try {
      await apiCall(`/messages/${messageId}/read`, {
        method: 'PUT'
      });
      return true;
    } catch (error) {
      console.error('Failed to mark message as read:', error);
      return false;
    }
  }

  async getUnreadCount(userId: string): Promise<number> {
    try {
      const messages = await this.getMessages(userId);
      return messages.filter(message => 
        !message.read && 
        message.recipient_id === userId || message.recipient_id === 'all'
      ).length;
    } catch (error) {
      console.error('Failed to get unread count:', error);
      return 0;
    }
  }

  // Broadcast message to all guards
  async broadcastMessage(message: string, priority: Message['priority'] = 'normal'): Promise<Message | null> {
    return this.sendMessage({
      recipient_id: 'all',
      message,
      priority,
      group_message: true,
      message_type: 'alert'
    });
  }

  // Send emergency broadcast
  async sendEmergencyBroadcast(message: string, location?: Message['location']): Promise<Message | null> {
    const emergencyMessage = await this.sendMessage({
      recipient_id: 'all',
      message: `🚨 EMERGENCY ALERT: ${message}`,
      priority: 'urgent',
      group_message: true,
      message_type: 'alert',
      location
    });

    if (emergencyMessage) {
      this.playUrgentSound();
      toast.error('Emergency broadcast sent to all guards');
    }

    return emergencyMessage;
  }

  // Send location message
  async shareLocation(latitude: number, longitude: number, message?: string): Promise<Message | null> {
    return this.sendMessage({
      message: message || 'Current location shared',
      message_type: 'location',
      location: { latitude, longitude }
    });
  }

  // Voice message functionality
  async sendVoiceMessage(audioBlob: Blob, recipient?: string): Promise<Message | null> {
    try {
      // In a real implementation, you would upload the audio blob
      // For demo purposes, we'll create a mock voice message
      return this.sendMessage({
        recipient_id: recipient,
        message: '🎤 Voice message',
        message_type: 'voice'
      });
    } catch (error) {
      console.error('Failed to send voice message:', error);
      return null;
    }
  }

  // Quick response messages
  async sendQuickResponse(type: 'acknowledged' | 'enroute' | 'arrived' | 'completed' | 'needbackup'): Promise<Message | null> {
    const quickMessages = {
      acknowledged: '✅ Acknowledged',
      enroute: '🚗 En route to location',
      arrived: '📍 Arrived at location',
      completed: '✅ Task completed',
      needbackup: '🆘 Requesting backup'
    };

    return this.sendMessage({
      message: quickMessages[type],
      priority: type === 'needbackup' ? 'urgent' : 'normal'
    });
  }

  // Get chat rooms
  async getChatRooms(userId: string): Promise<ChatRoom[]> {
    try {
      // In a real implementation, this would fetch from the backend
      return this.getMockChatRooms();
    } catch (error) {
      console.error('Failed to fetch chat rooms:', error);
      return [];
    }
  }

  // Create chat room
  async createChatRoom(name: string, participants: string[], type: ChatRoom['type'] = 'group'): Promise<ChatRoom | null> {
    try {
      const roomData = {
        name,
        participants,
        type,
        created_at: new Date().toISOString()
      };

      // In a real implementation, this would create the room on the backend
      const mockRoom = this.createMockChatRoom(roomData);
      toast.success(`Chat room "${name}" created`);
      return mockRoom;
    } catch (error) {
      console.error('Failed to create chat room:', error);
      toast.error('Failed to create chat room');
      return null;
    }
  }

  // Join chat room
  async joinChatRoom(roomId: string): Promise<boolean> {
    try {
      toast.success('Joined chat room');
      return true;
    } catch (error) {
      console.error('Failed to join chat room:', error);
      toast.error('Failed to join chat room');
      return false;
    }
  }

  // Leave chat room
  async leaveChatRoom(roomId: string): Promise<boolean> {
    try {
      toast.success('Left chat room');
      return true;
    } catch (error) {
      console.error('Failed to leave chat room:', error);
      toast.error('Failed to leave chat room');
      return false;
    }
  }

  // Get message history for a chat room
  async getChatRoomMessages(roomId: string): Promise<Message[]> {
    try {
      return this.getMockChatRoomMessages(roomId);
    } catch (error) {
      console.error('Failed to fetch chat room messages:', error);
      return [];
    }
  }

  // Search messages
  async searchMessages(query: string, userId: string): Promise<Message[]> {
    try {
      const messages = await this.getMessages(userId);
      return messages.filter(message => 
        message.message.toLowerCase().includes(query.toLowerCase()) ||
        message.sender_name.toLowerCase().includes(query.toLowerCase())
      );
    } catch (error) {
      console.error('Failed to search messages:', error);
      return [];
    }
  }

  // Get communication stats
  async getCommunicationStats(userId: string): Promise<{
    total_messages: number;
    messages_sent: number;
    messages_received: number;
    unread_messages: number;
    emergency_alerts: number;
    response_rate: number;
  }> {
    try {
      const messages = await this.getMessages(userId);
      const sent = messages.filter(m => m.sender_id === userId).length;
      const received = messages.filter(m => m.recipient_id === userId || m.recipient_id === 'all').length;
      const unread = messages.filter(m => !m.read && (m.recipient_id === userId || m.recipient_id === 'all')).length;
      const emergency = messages.filter(m => m.priority === 'urgent' || m.message_type === 'alert').length;

      return {
        total_messages: messages.length,
        messages_sent: sent,
        messages_received: received,
        unread_messages: unread,
        emergency_alerts: emergency,
        response_rate: received > 0 ? Math.round((sent / received) * 100) : 0
      };
    } catch (error) {
      console.error('Failed to get communication stats:', error);
      return {
        total_messages: 0,
        messages_sent: 0,
        messages_received: 0,
        unread_messages: 0,
        emergency_alerts: 0,
        response_rate: 0
      };
    }
  }

  // Enable/disable notifications
  setNotificationsEnabled(enabled: boolean): void {
    localStorage.setItem('notifications-enabled', enabled.toString());
    if (enabled) {
      toast.success('Notifications enabled');
    } else {
      toast.info('Notifications disabled');
    }
  }

  areNotificationsEnabled(): boolean {
    return localStorage.getItem('notifications-enabled') !== 'false';
  }

  private playMessageSound(): void {
    if (this.messageSound && this.areNotificationsEnabled()) {
      try {
        this.messageSound.currentTime = 0;
        this.messageSound.play().catch(e => console.warn('Message sound failed:', e));
      } catch (error) {
        console.warn('Message sound playback failed:', error);
      }
    }
  }

  private playUrgentSound(): void {
    if (this.notificationSound && this.areNotificationsEnabled()) {
      try {
        this.notificationSound.currentTime = 0;
        // Play urgent sound multiple times
        for (let i = 0; i < 3; i++) {
          setTimeout(() => {
            this.notificationSound?.play().catch(e => console.warn('Urgent sound failed:', e));
          }, i * 500);
        }
      } catch (error) {
        console.warn('Urgent sound playback failed:', error);
      }
    }
  }

  private createMockMessage(messageData: MessageCreate): Message {
    return {
      id: `message_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      sender_id: 'current-user',
      sender_name: 'Demo User',
      recipient_id: messageData.recipient_id || 'all',
      message: messageData.message,
      priority: messageData.priority || 'normal',
      group_message: messageData.group_message || false,
      timestamp: new Date().toISOString(),
      read: false,
      message_type: messageData.message_type || 'text',
      location: messageData.location
    };
  }

  private saveMessageLocally(message: Message): void {
    const localMessages = JSON.parse(localStorage.getItem('demo-messages') || '[]');
    localMessages.unshift(message);
    localStorage.setItem('demo-messages', JSON.stringify(localMessages.slice(0, 100)));
  }

  private getMockMessages(): Message[] {
    const now = new Date();
    return [
      {
        id: 'msg-001',
        sender_id: 'supervisor-001',
        sender_name: 'Supervisor Smith',
        recipient_id: 'all',
        message: 'Good morning team! Remember to complete your patrol reports.',
        priority: 'normal',
        group_message: true,
        timestamp: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
        read: false,
        message_type: 'text'
      },
      {
        id: 'msg-002',
        sender_id: 'guard-002',
        sender_name: 'Sarah Johnson',
        recipient_id: 'guard-001',
        message: 'Can you cover the north entrance for 15 minutes?',
        priority: 'normal',
        group_message: false,
        timestamp: new Date(now.getTime() - 15 * 60 * 1000).toISOString(),
        read: true,
        message_type: 'text'
      },
      {
        id: 'msg-003',
        sender_id: 'dispatch-001',
        sender_name: 'Dispatch Center',
        recipient_id: 'all',
        message: '🚨 SECURITY ALERT: Suspicious activity reported at Building A',
        priority: 'urgent',
        group_message: true,
        timestamp: new Date(now.getTime() - 5 * 60 * 1000).toISOString(),
        read: false,
        message_type: 'alert'
      }
    ];
  }

  private getMockChatRooms(): ChatRoom[] {
    return [
      {
        id: 'room-001',
        name: 'All Guards',
        description: 'General communication for all security personnel',
        type: 'broadcast',
        participants: ['guard-001', 'guard-002', 'guard-003', 'supervisor-001'],
        created_by: 'supervisor-001',
        created_at: new Date().toISOString(),
        unread_count: 2
      },
      {
        id: 'room-002',
        name: 'Night Shift',
        description: 'Communication for night shift guards',
        type: 'group',
        participants: ['guard-002', 'guard-004', 'supervisor-002'],
        created_by: 'supervisor-002',
        created_at: new Date().toISOString(),
        unread_count: 0
      },
      {
        id: 'room-003',
        name: 'Emergency Response',
        description: 'Emergency communication channel',
        type: 'emergency',
        participants: ['guard-001', 'guard-002', 'guard-003', 'supervisor-001', 'admin-001'],
        created_by: 'admin-001',
        created_at: new Date().toISOString(),
        unread_count: 1
      }
    ];
  }

  private createMockChatRoom(data: any): ChatRoom {
    return {
      id: `room_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      ...data,
      created_by: 'current-user',
      unread_count: 0
    };
  }

  private getMockChatRoomMessages(roomId: string): Message[] {
    const now = new Date();
    return [
      {
        id: 'room-msg-001',
        sender_id: 'guard-001',
        sender_name: 'John Smith',
        recipient_id: roomId,
        message: 'Patrol completed at sector 3',
        priority: 'normal',
        group_message: true,
        timestamp: new Date(now.getTime() - 10 * 60 * 1000).toISOString(),
        read: true,
        message_type: 'text'
      },
      {
        id: 'room-msg-002',
        sender_id: 'supervisor-001',
        sender_name: 'Supervisor Smith',
        recipient_id: roomId,
        message: 'Good work everyone. Stay alert.',
        priority: 'normal',
        group_message: true,
        timestamp: new Date(now.getTime() - 5 * 60 * 1000).toISOString(),
        read: false,
        message_type: 'text'
      }
    ];
  }
}

export const communicationService = new CommunicationService();