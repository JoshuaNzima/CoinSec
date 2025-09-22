import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { useTheme } from '../contexts/ThemeContext';
import { CheckpointScan, Checkpoint } from '@guard-services/shared';

export default function CheckpointsScreen() {
  const { theme } = useTheme();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [recentScans, setRecentScans] = useState<CheckpointScan[]>([]);
  const [checkpoints] = useState<Checkpoint[]>([
    {
      id: 'cp-1',
      name: 'Main Entrance',
      description: 'Primary building entrance checkpoint',
      latitude: 37.78825,
      longitude: -122.4324,
      qr_code: 'CHECKPOINT_MAIN_ENTRANCE',
      is_active: true,
      created_at: new Date().toISOString(),
    },
    {
      id: 'cp-2',
      name: 'Parking Lot',
      description: 'Vehicle parking area checkpoint',
      latitude: 37.78855,
      longitude: -122.4334,
      qr_code: 'CHECKPOINT_PARKING_LOT',
      is_active: true,
      created_at: new Date().toISOString(),
    },
    {
      id: 'cp-3',
      name: 'Emergency Exit',
      description: 'Emergency exit checkpoint',
      latitude: 37.78835,
      longitude: -122.4314,
      qr_code: 'CHECKPOINT_EMERGENCY_EXIT',
      is_active: true,
      created_at: new Date().toISOString(),
    },
  ]);

  useEffect(() => {
    getBarCodeScannerPermissions();
    loadRecentScans();
  }, []);

  const getBarCodeScannerPermissions = async () => {
    const { status } = await BarCodeScanner.requestPermissionsAsync();
    setHasPermission(status === 'granted');
  };

  const loadRecentScans = () => {
    // Mock recent scans data
    const mockScans: CheckpointScan[] = [
      {
        id: 'scan-1',
        user_id: 'current-user',
        user_name: 'John Doe',
        checkpoint_id: 'cp-1',
        latitude: 37.78825,
        longitude: -122.4324,
        notes: 'All clear',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 min ago
        verified: true,
        verification_method: 'qr',
      },
      {
        id: 'scan-2',
        user_id: 'current-user',
        user_name: 'John Doe',
        checkpoint_id: 'cp-2',
        latitude: 37.78855,
        longitude: -122.4334,
        notes: 'Minor debris cleaned',
        timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(), // 90 min ago
        verified: true,
        verification_method: 'qr',
      },
    ];
    setRecentScans(mockScans);
  };

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    setScanned(true);
    
    // Find checkpoint by QR code
    const checkpoint = checkpoints.find(cp => cp.qr_code === data);
    
    if (checkpoint) {
      Alert.alert(
        'Checkpoint Found',
        `Scan checkpoint: ${checkpoint.name}?`,
        [
          { text: 'Cancel', onPress: () => setScanned(false) },
          { 
            text: 'Scan', 
            onPress: () => {
              handleCheckpointScan(checkpoint);
              setShowScanner(false);
              setScanned(false);
            }
          },
        ]
      );
    } else {
      Alert.alert(
        'Invalid QR Code',
        'This QR code is not recognized as a valid checkpoint.',
        [{ text: 'OK', onPress: () => setScanned(false) }]
      );
    }
  };

  const handleCheckpointScan = (checkpoint: Checkpoint) => {
    const newScan: CheckpointScan = {
      id: `scan-${Date.now()}`,
      user_id: 'current-user',
      user_name: 'John Doe',
      checkpoint_id: checkpoint.id,
      latitude: checkpoint.latitude,
      longitude: checkpoint.longitude,
      notes: '',
      timestamp: new Date().toISOString(),
      verified: true,
      verification_method: 'qr',
    };

    setRecentScans(prev => [newScan, ...prev]);
    
    Alert.alert(
      'Checkpoint Scanned',
      `Successfully scanned ${checkpoint.name}`,
      [{ text: 'OK' }]
    );
  };

  const handleManualScan = (checkpoint: Checkpoint) => {
    Alert.alert(
      'Manual Scan',
      `Manually scan checkpoint: ${checkpoint.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Confirm', 
          onPress: () => handleCheckpointScan(checkpoint)
        },
      ]
    );
  };

  const renderCheckpoint = ({ item }: { item: Checkpoint }) => (
    <TouchableOpacity 
      style={styles.checkpointCard}
      onPress={() => handleManualScan(item)}
    >
      <View style={styles.checkpointHeader}>
        <View style={styles.checkpointInfo}>
          <Ionicons 
            name="location" 
            size={20} 
            color={item.is_active ? theme.colors.success : theme.colors.textSecondary} 
          />
          <Text style={[styles.checkpointName, { color: theme.colors.text }]}>
            {item.name}
          </Text>
        </View>
        <View style={[
          styles.statusBadge,
          { backgroundColor: item.is_active ? theme.colors.success : theme.colors.textSecondary }
        ]}>
          <Text style={styles.statusText}>
            {item.is_active ? 'Active' : 'Inactive'}
          </Text>
        </View>
      </View>
      
      <Text style={[styles.checkpointDescription, { color: theme.colors.textSecondary }]}>
        {item.description}
      </Text>
      
      <TouchableOpacity style={styles.scanButton}>
        <Ionicons name="qr-code-outline" size={16} color={theme.colors.primary} />
        <Text style={[styles.scanButtonText, { color: theme.colors.primary }]}>
          Manual Scan
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderRecentScan = ({ item }: { item: CheckpointScan }) => {
    const checkpoint = checkpoints.find(cp => cp.id === item.checkpoint_id);
    
    return (
      <View style={styles.scanCard}>
        <View style={styles.scanHeader}>
          <Ionicons 
            name={item.verified ? "checkmark-circle" : "alert-circle"} 
            size={20} 
            color={item.verified ? theme.colors.success : theme.colors.warning} 
          />
          <Text style={[styles.scanCheckpoint, { color: theme.colors.text }]}>
            {checkpoint?.name || 'Unknown Checkpoint'}
          </Text>
          <Text style={[styles.scanTime, { color: theme.colors.textSecondary }]}>
            {new Date(item.timestamp).toLocaleTimeString()}
          </Text>
        </View>
        
        {item.notes && (
          <Text style={[styles.scanNotes, { color: theme.colors.textSecondary }]}>
            Notes: {item.notes}
          </Text>
        )}
      </View>
    );
  };

  const styles = createStyles(theme);

  if (hasPermission === null) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.permissionText}>Requesting camera permission...</Text>
      </SafeAreaView>
    );
  }

  if (hasPermission === false) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.permissionText}>No access to camera</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={getBarCodeScannerPermissions}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (showScanner) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.scannerHeader}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => {
              setShowScanner(false);
              setScanned(false);
            }}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.scannerTitle}>Scan QR Code</Text>
        </View>
        
        <View style={styles.scannerContainer}>
          <BarCodeScanner
            onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
            style={StyleSheet.absoluteFillObject}
          />
          
          <View style={styles.scannerOverlay}>
            <View style={styles.scannerFrame} />
          </View>
          
          <Text style={styles.scannerInstructions}>
            Position the QR code within the frame to scan
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Checkpoints</Text>
        <TouchableOpacity 
          style={styles.scanQRButton} 
          onPress={() => setShowScanner(true)}
        >
          <Ionicons name="qr-code" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{checkpoints.length}</Text>
          <Text style={styles.statLabel}>Total Checkpoints</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{recentScans.length}</Text>
          <Text style={styles.statLabel}>Today's Scans</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {checkpoints.filter(cp => cp.is_active).length}
          </Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
      </View>

      {/* Checkpoints List */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Available Checkpoints</Text>
        <FlatList
          data={checkpoints}
          renderItem={renderCheckpoint}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
        />
      </View>

      {/* Recent Scans */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Scans</Text>
        <FlatList
          data={recentScans}
          renderItem={renderRecentScan}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    permissionText: {
      textAlign: 'center',
      fontSize: 16,
      color: theme.colors.text,
      margin: 20,
    },
    permissionButton: {
      backgroundColor: theme.colors.primary,
      padding: 16,
      borderRadius: 8,
      margin: 20,
    },
    permissionButtonText: {
      color: '#ffffff',
      textAlign: 'center',
      fontWeight: '600',
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
    scanQRButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    scannerHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingBottom: 16,
    },
    backButton: {
      marginRight: 16,
    },
    scannerTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: theme.colors.text,
    },
    scannerContainer: {
      flex: 1,
      margin: 20,
      borderRadius: 12,
      overflow: 'hidden',
      position: 'relative',
    },
    scannerOverlay: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: 'center',
      alignItems: 'center',
    },
    scannerFrame: {
      width: 200,
      height: 200,
      borderWidth: 2,
      borderColor: '#ffffff',
      borderRadius: 12,
    },
    scannerInstructions: {
      position: 'absolute',
      bottom: 50,
      left: 0,
      right: 0,
      textAlign: 'center',
      color: '#ffffff',
      fontSize: 16,
      backgroundColor: 'rgba(0,0,0,0.5)',
      padding: 16,
    },
    stats: {
      flexDirection: 'row',
      paddingHorizontal: 20,
      marginBottom: 24,
    },
    statItem: {
      flex: 1,
      backgroundColor: theme.colors.surface,
      borderRadius: 8,
      padding: 16,
      marginHorizontal: 4,
      alignItems: 'center',
    },
    statNumber: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.primary,
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
    section: {
      flex: 1,
      paddingHorizontal: 20,
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 12,
    },
    checkpointCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
    },
    checkpointHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    checkpointInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    checkpointName: {
      fontSize: 16,
      fontWeight: '600',
      marginLeft: 8,
    },
    statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
    },
    statusText: {
      fontSize: 10,
      fontWeight: '600',
      color: '#ffffff',
    },
    checkpointDescription: {
      fontSize: 14,
      marginBottom: 12,
    },
    scanButton: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
    },
    scanButtonText: {
      fontSize: 14,
      fontWeight: '500',
      marginLeft: 4,
    },
    scanCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 8,
      padding: 12,
      marginBottom: 8,
    },
    scanHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 4,
    },
    scanCheckpoint: {
      fontSize: 14,
      fontWeight: '500',
      marginLeft: 8,
      flex: 1,
    },
    scanTime: {
      fontSize: 12,
    },
    scanNotes: {
      fontSize: 12,
      marginTop: 4,
    },
  });