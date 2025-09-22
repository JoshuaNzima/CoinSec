import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Circle } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useTheme } from '../contexts/ThemeContext';
import { gpsService, LocationData } from '@guard-services/shared';

export default function GPSTrackingScreen() {
  const { theme } = useTheme();
  const [isTracking, setIsTracking] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [teamLocations, setTeamLocations] = useState<LocationData[]>([]);
  const [mapRegion, setMapRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  useEffect(() => {
    requestLocationPermission();
    loadTeamLocations();
  }, []);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required for GPS tracking');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const locationData: LocationData = {
        user_id: 'current-user',
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy || undefined,
        heading: location.coords.heading || undefined,
        speed: location.coords.speed || undefined,
        timestamp: new Date().toISOString(),
      };

      setCurrentLocation(locationData);
      setMapRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    } catch (error) {
      console.error('Location permission error:', error);
      Alert.alert('Error', 'Failed to get location permission');
    }
  };

  const loadTeamLocations = async () => {
    try {
      const locations = await gpsService.getAllLocations();
      setTeamLocations(locations);
    } catch (error) {
      console.error('Failed to load team locations:', error);
    }
  };

  const toggleTracking = async () => {
    if (!isTracking) {
      const success = await gpsService.startTracking();
      if (success) {
        setIsTracking(true);
        Alert.alert('GPS Tracking', 'Location tracking started');
      } else {
        Alert.alert('Error', 'Failed to start GPS tracking');
      }
    } else {
      gpsService.stopTracking();
      setIsTracking(false);
      Alert.alert('GPS Tracking', 'Location tracking stopped');
    }
  };

  const getCurrentLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({});
      const locationData: LocationData = {
        user_id: 'current-user',
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy || undefined,
        timestamp: new Date().toISOString(),
      };

      setCurrentLocation(locationData);
      setMapRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });

      // Update location on server
      await gpsService.updateLocation(locationData);
    } catch (error) {
      console.error('Get location error:', error);
      Alert.alert('Error', 'Failed to get current location');
    }
  };

  const styles = createStyles(theme);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>GPS Tracking</Text>
        <View style={styles.headerControls}>
          <TouchableOpacity style={styles.refreshButton} onPress={getCurrentLocation}>
            <Ionicons name="refresh" size={20} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Map */}
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          region={mapRegion}
          onRegionChangeComplete={setMapRegion}
          showsUserLocation={true}
          showsMyLocationButton={false}
          followsUserLocation={isTracking}
        >
          {/* Current Location */}
          {currentLocation && (
            <>
              <Marker
                coordinate={{
                  latitude: currentLocation.latitude,
                  longitude: currentLocation.longitude,
                }}
                title="You"
                description="Your current location"
                pinColor="blue"
              />
              {currentLocation.accuracy && (
                <Circle
                  center={{
                    latitude: currentLocation.latitude,
                    longitude: currentLocation.longitude,
                  }}
                  radius={currentLocation.accuracy}
                  strokeColor="rgba(0, 122, 255, 0.5)"
                  fillColor="rgba(0, 122, 255, 0.1)"
                />
              )}
            </>
          )}

          {/* Team Locations */}
          {teamLocations.map((location, index) => (
            <Marker
              key={`team-${index}`}
              coordinate={{
                latitude: location.latitude,
                longitude: location.longitude,
              }}
              title={`Guard ${location.user_id}`}
              description={`Updated: ${new Date(location.timestamp).toLocaleTimeString()}`}
              pinColor="red"
            />
          ))}
        </MapView>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <View style={styles.trackingControl}>
          <View style={styles.trackingInfo}>
            <Ionicons 
              name={isTracking ? "radio-button-on" : "radio-button-off"} 
              size={24} 
              color={isTracking ? theme.colors.success : theme.colors.textSecondary} 
            />
            <View style={styles.trackingText}>
              <Text style={styles.trackingTitle}>Location Sharing</Text>
              <Text style={styles.trackingSubtitle}>
                {isTracking ? 'Broadcasting your location' : 'Location sharing is off'}
              </Text>
            </View>
          </View>
          <Switch
            value={isTracking}
            onValueChange={toggleTracking}
            trackColor={{ false: theme.colors.border, true: theme.colors.success }}
            thumbColor={isTracking ? '#ffffff' : theme.colors.textSecondary}
          />
        </View>

        {/* Location Info */}
        {currentLocation && (
          <View style={styles.locationInfo}>
            <View style={styles.locationItem}>
              <Text style={styles.locationLabel}>Latitude</Text>
              <Text style={styles.locationValue}>
                {currentLocation.latitude.toFixed(6)}°
              </Text>
            </View>
            <View style={styles.locationItem}>
              <Text style={styles.locationLabel}>Longitude</Text>
              <Text style={styles.locationValue}>
                {currentLocation.longitude.toFixed(6)}°
              </Text>
            </View>
            {currentLocation.accuracy && (
              <View style={styles.locationItem}>
                <Text style={styles.locationLabel}>Accuracy</Text>
                <Text style={styles.locationValue}>
                  ±{Math.round(currentLocation.accuracy)}m
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Team Status */}
        <View style={styles.teamStatus}>
          <Text style={styles.teamTitle}>Team Status</Text>
          <Text style={styles.teamCount}>
            {teamLocations.length} guards online
          </Text>
        </View>
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
    headerControls: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    refreshButton: {
      padding: 8,
    },
    mapContainer: {
      flex: 1,
      marginHorizontal: 20,
      borderRadius: 12,
      overflow: 'hidden',
      marginBottom: 16,
    },
    map: {
      flex: 1,
    },
    controls: {
      paddingHorizontal: 20,
      paddingBottom: 20,
    },
    trackingControl: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
    },
    trackingInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    trackingText: {
      marginLeft: 12,
      flex: 1,
    },
    trackingTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 2,
    },
    trackingSubtitle: {
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
    locationInfo: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
    },
    locationItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    locationLabel: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    locationValue: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.text,
    },
    teamStatus: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 16,
    },
    teamTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 4,
    },
    teamCount: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
  });