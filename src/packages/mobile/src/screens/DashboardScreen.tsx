import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

interface DashboardCard {
  id: string;
  title: string;
  value: string | number;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  onPress?: () => void;
}

export default function DashboardScreen() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [cards, setCards] = useState<DashboardCard[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Simulate loading dashboard data
      const dashboardCards: DashboardCard[] = [
        {
          id: 'incidents',
          title: 'Active Incidents',
          value: 3,
          subtitle: '2 assigned to you',
          icon: 'alert-circle',
          color: theme.colors.error,
          onPress: () => console.log('Navigate to incidents'),
        },
        {
          id: 'checkpoints',
          title: "Today's Scans",
          value: 12,
          subtitle: 'Last: 10 minutes ago',
          icon: 'qr-code',
          color: theme.colors.success,
          onPress: () => console.log('Navigate to checkpoints'),
        },
        {
          id: 'location',
          title: 'GPS Status',
          value: 'Active',
          subtitle: 'Location sharing on',
          icon: 'location',
          color: theme.colors.info,
          onPress: () => console.log('Navigate to GPS'),
        },
        {
          id: 'shift',
          title: 'Shift Time',
          value: '6h 23m',
          subtitle: 'Ends at 8:00 PM',
          icon: 'time',
          color: theme.colors.warning,
          onPress: () => console.log('View shift details'),
        },
      ];

      setCards(dashboardCards);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const handleEmergency = () => {
    Alert.alert(
      'Emergency Alert',
      'This will send an immediate alert to all supervisors and emergency contacts. Do you want to continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Alert',
          style: 'destructive',
          onPress: () => {
            // Handle emergency alert
            Alert.alert('Emergency Alert Sent', 'Your emergency alert has been sent to all supervisors.');
          },
        },
      ]
    );
  };

  const styles = createStyles(theme);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good {getTimeOfDay()},</Text>
            <Text style={styles.userName}>{user?.name || 'Guard'}</Text>
            <Text style={styles.badge}>Badge: {user?.badge || 'N/A'}</Text>
          </View>
          <TouchableOpacity style={styles.emergencyButton} onPress={handleEmergency}>
            <Ionicons name="warning" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* Dashboard Cards */}
        <View style={styles.cardsContainer}>
          {cards.map((card, index) => (
            <TouchableOpacity
              key={card.id}
              style={[styles.card, index % 2 === 1 && styles.cardRight]}
              onPress={card.onPress}
            >
              <View style={styles.cardHeader}>
                <Ionicons name={card.icon} size={24} color={card.color} />
              </View>
              <Text style={styles.cardValue}>{card.value}</Text>
              <Text style={styles.cardTitle}>{card.title}</Text>
              <Text style={styles.cardSubtitle}>{card.subtitle}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsContainer}>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="camera" size={20} color={theme.colors.primary} />
              <Text style={styles.actionText}>Report Incident</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="qr-code-outline" size={20} color={theme.colors.primary} />
              <Text style={styles.actionText}>Scan Checkpoint</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="chatbubble-outline" size={20} color={theme.colors.primary} />
              <Text style={styles.actionText}>Send Message</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityList}>
            <View style={styles.activityItem}>
              <View style={[styles.activityIcon, { backgroundColor: theme.colors.success }]}>
                <Ionicons name="checkmark" size={16} color="#ffffff" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Checkpoint scanned</Text>
                <Text style={styles.activityTime}>Main Entrance - 10 minutes ago</Text>
              </View>
            </View>
            <View style={styles.activityItem}>
              <View style={[styles.activityIcon, { backgroundColor: theme.colors.info }]}>
                <Ionicons name="location" size={16} color="#ffffff" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Location updated</Text>
                <Text style={styles.activityTime}>GPS tracking active - 15 minutes ago</Text>
              </View>
            </View>
            <View style={styles.activityItem}>
              <View style={[styles.activityIcon, { backgroundColor: theme.colors.warning }]}>
                <Ionicons name="time" size={16} color="#ffffff" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Shift started</Text>
                <Text style={styles.activityTime}>Night shift begins - 6 hours ago</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function getTimeOfDay(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollView: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      padding: 20,
      paddingBottom: 16,
    },
    greeting: {
      fontSize: 16,
      color: theme.colors.textSecondary,
    },
    userName: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 4,
    },
    badge: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    emergencyButton: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: theme.colors.error,
      justifyContent: 'center',
      alignItems: 'center',
    },
    cardsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      paddingHorizontal: 16,
      marginBottom: 24,
    },
    card: {
      width: '48%',
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      marginRight: '2%',
    },
    cardRight: {
      marginRight: 0,
      marginLeft: '2%',
    },
    cardHeader: {
      marginBottom: 8,
    },
    cardValue: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 4,
    },
    cardTitle: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.text,
      marginBottom: 2,
    },
    cardSubtitle: {
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
    section: {
      paddingHorizontal: 20,
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 16,
    },
    actionsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    actionButton: {
      flex: 1,
      backgroundColor: theme.colors.surface,
      borderRadius: 8,
      padding: 16,
      alignItems: 'center',
      marginHorizontal: 4,
    },
    actionText: {
      fontSize: 12,
      fontWeight: '500',
      color: theme.colors.text,
      marginTop: 8,
      textAlign: 'center',
    },
    activityList: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 16,
    },
    activityItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    activityIcon: {
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    activityContent: {
      flex: 1,
    },
    activityTitle: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.text,
      marginBottom: 2,
    },
    activityTime: {
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
  });