import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { incidentService, Incident } from '@guard-services/shared';

export default function IncidentsScreen() {
  const { theme } = useTheme();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'open' | 'assigned'>('all');

  useEffect(() => {
    loadIncidents();
  }, []);

  const loadIncidents = async () => {
    try {
      const data = await incidentService.getIncidents();
      setIncidents(data);
    } catch (error) {
      console.error('Failed to load incidents:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadIncidents();
    setRefreshing(false);
  };

  const handleCreateIncident = () => {
    Alert.alert('Create Incident', 'Navigate to incident creation form', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Create', onPress: () => console.log('Navigate to create incident') },
    ]);
  };

  const getPriorityColor = (priority: Incident['priority']) => {
    switch (priority) {
      case 'critical': return theme.colors.error;
      case 'high': return '#f59e0b';
      case 'medium': return '#3b82f6';
      case 'low': return theme.colors.success;
      default: return theme.colors.textSecondary;
    }
  };

  const getStatusIcon = (status: Incident['status']) => {
    switch (status) {
      case 'open': return 'alert-circle';
      case 'in_progress': return 'time';
      case 'resolved': return 'checkmark-circle';
      case 'closed': return 'close-circle';
      default: return 'help-circle';
    }
  };

  const filteredIncidents = incidents.filter(incident => {
    if (filter === 'open') return incident.status === 'open';
    if (filter === 'assigned') return incident.assigned_to; // Would check current user ID
    return true;
  });

  const renderIncident = ({ item }: { item: Incident }) => (
    <TouchableOpacity style={styles.incidentCard}>
      <View style={styles.incidentHeader}>
        <View style={styles.incidentMeta}>
          <Ionicons 
            name={getStatusIcon(item.status)} 
            size={20} 
            color={getPriorityColor(item.priority)} 
          />
          <Text style={[styles.incidentTitle, { color: theme.colors.text }]}>
            {item.title}
          </Text>
        </View>
        <Text style={[styles.priority, { color: getPriorityColor(item.priority) }]}>
          {item.priority.toUpperCase()}
        </Text>
      </View>
      
      <Text style={[styles.description, { color: theme.colors.textSecondary }]} numberOfLines={2}>
        {item.description}
      </Text>
      
      <View style={styles.incidentFooter}>
        <Text style={[styles.reporter, { color: theme.colors.textSecondary }]}>
          Reporter: {item.reporter_name}
        </Text>
        <Text style={[styles.time, { color: theme.colors.textSecondary }]}>
          {new Date(item.created_at).toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const styles = createStyles(theme);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Incidents</Text>
        <TouchableOpacity style={styles.createButton} onPress={handleCreateIncident}>
          <Ionicons name="add" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterTabs}>
        {[
          { key: 'all', label: 'All' },
          { key: 'open', label: 'Open' },
          { key: 'assigned', label: 'Assigned' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.filterTab,
              filter === tab.key && styles.activeFilterTab,
            ]}
            onPress={() => setFilter(tab.key as any)}
          >
            <Text style={[
              styles.filterTabText,
              filter === tab.key && styles.activeFilterTabText,
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Incidents List */}
      <FlatList
        data={filteredIncidents}
        renderItem={renderIncident}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingBottom: 16,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.text,
    },
    createButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    filterTabs: {
      flexDirection: 'row',
      paddingHorizontal: 20,
      marginBottom: 16,
    },
    filterTab: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      marginRight: 8,
      backgroundColor: theme.colors.surface,
    },
    activeFilterTab: {
      backgroundColor: theme.colors.primary,
    },
    filterTabText: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.textSecondary,
    },
    activeFilterTabText: {
      color: theme.colors.background,
    },
    list: {
      flex: 1,
    },
    listContent: {
      paddingHorizontal: 20,
      paddingBottom: 20,
    },
    incidentCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
    },
    incidentHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 8,
    },
    incidentMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    incidentTitle: {
      fontSize: 16,
      fontWeight: '600',
      marginLeft: 8,
      flex: 1,
    },
    priority: {
      fontSize: 12,
      fontWeight: '600',
    },
    description: {
      fontSize: 14,
      marginBottom: 12,
      lineHeight: 20,
    },
    incidentFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    reporter: {
      fontSize: 12,
    },
    time: {
      fontSize: 12,
    },
  });