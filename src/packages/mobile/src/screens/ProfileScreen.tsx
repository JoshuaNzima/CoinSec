import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

export default function ProfileScreen() {
  const { user, signOut, updateProfile } = useAuth();
  const { theme, themeMode, setThemeMode } = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationSharing, setLocationSharing] = useState(true);

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: signOut },
      ]
    );
  };

  const handleThemeChange = () => {
    const themes = ['light', 'dark', 'system'];
    const currentIndex = themes.indexOf(themeMode);
    const nextIndex = (currentIndex + 1) % themes.length;
    setThemeMode(themes[nextIndex] as any);
  };

  const handleBiometricToggle = () => {
    if (user) {
      updateProfile({ biometricEnabled: !user.biometricEnabled });
    }
  };

  const handle2FAToggle = () => {
    if (user) {
      updateProfile({ twoFactorEnabled: !user.twoFactorEnabled });
    }
  };

  const styles = createStyles(theme);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={48} color={theme.colors.primary} />
          </View>
          <Text style={styles.name}>{user?.name || 'User'}</Text>
          <Text style={styles.email}>{user?.email || 'No email'}</Text>
          <View style={styles.badge}>
            <Ionicons name="shield-checkmark" size={16} color={theme.colors.primary} />
            <Text style={styles.badgeText}>Badge: {user?.badge || 'N/A'}</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <TouchableOpacity style={styles.actionItem}>
            <Ionicons name="document-text-outline" size={20} color={theme.colors.primary} />
            <Text style={styles.actionText}>View My Reports</Text>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionItem}>
            <Ionicons name="time-outline" size={20} color={theme.colors.primary} />
            <Text style={styles.actionText}>Shift History</Text>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionItem}>
            <Ionicons name="school-outline" size={20} color={theme.colors.primary} />
            <Text style={styles.actionText}>Training Modules</Text>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="notifications-outline" size={20} color={theme.colors.primary} />
              <Text style={styles.settingText}>Push Notifications</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: theme.colors.border, true: theme.colors.success }}
              thumbColor={notificationsEnabled ? '#ffffff' : theme.colors.textSecondary}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="location-outline" size={20} color={theme.colors.primary} />
              <Text style={styles.settingText}>Location Sharing</Text>
            </View>
            <Switch
              value={locationSharing}
              onValueChange={setLocationSharing}
              trackColor={{ false: theme.colors.border, true: theme.colors.success }}
              thumbColor={locationSharing ? '#ffffff' : theme.colors.textSecondary}
            />
          </View>

          <TouchableOpacity style={styles.settingItem} onPress={handleThemeChange}>
            <View style={styles.settingInfo}>
              <Ionicons name="moon-outline" size={20} color={theme.colors.primary} />
              <Text style={styles.settingText}>Theme</Text>
            </View>
            <View style={styles.settingValue}>
              <Text style={styles.settingValueText}>
                {themeMode.charAt(0).toUpperCase() + themeMode.slice(1)}
              </Text>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="language-outline" size={20} color={theme.colors.primary} />
              <Text style={styles.settingText}>Language</Text>
            </View>
            <View style={styles.settingValue}>
              <Text style={styles.settingValueText}>English</Text>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Security */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="finger-print-outline" size={20} color={theme.colors.primary} />
              <Text style={styles.settingText}>Biometric Login</Text>
            </View>
            <Switch
              value={user?.biometricEnabled || false}
              onValueChange={handleBiometricToggle}
              trackColor={{ false: theme.colors.border, true: theme.colors.success }}
              thumbColor={user?.biometricEnabled ? '#ffffff' : theme.colors.textSecondary}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="shield-outline" size={20} color={theme.colors.primary} />
              <Text style={styles.settingText}>Two-Factor Auth</Text>
            </View>
            <Switch
              value={user?.twoFactorEnabled || false}
              onValueChange={handle2FAToggle}
              trackColor={{ false: theme.colors.border, true: theme.colors.success }}
              thumbColor={user?.twoFactorEnabled ? '#ffffff' : theme.colors.textSecondary}
            />
          </View>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="key-outline" size={20} color={theme.colors.primary} />
              <Text style={styles.settingText}>Change Password</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="help-circle-outline" size={20} color={theme.colors.primary} />
              <Text style={styles.settingText}>Help & Support</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="document-outline" size={20} color={theme.colors.primary} />
              <Text style={styles.settingText}>Privacy Policy</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="information-circle-outline" size={20} color={theme.colors.primary} />
              <Text style={styles.settingText}>App Version</Text>
            </View>
            <Text style={styles.settingValueText}>1.0.0</Text>
          </TouchableOpacity>
        </View>

        {/* Sign Out */}
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={20} color={theme.colors.error} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollView: {
      flex: 1,
      paddingHorizontal: 20,
    },
    header: {
      alignItems: 'center',
      paddingVertical: 24,
    },
    avatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: theme.colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
    },
    name: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 4,
    },
    email: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      marginBottom: 8,
    },
    badge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
    },
    badgeText: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.primary,
      marginLeft: 4,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 16,
    },
    actionItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 8,
    },
    actionText: {
      fontSize: 16,
      color: theme.colors.text,
      marginLeft: 12,
      flex: 1,
    },
    settingItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 8,
    },
    settingInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    settingText: {
      fontSize: 16,
      color: theme.colors.text,
      marginLeft: 12,
    },
    settingValue: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    settingValueText: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      marginRight: 8,
    },
    signOutButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 16,
      marginTop: 16,
    },
    signOutText: {
      fontSize: 16,
      fontWeight: '500',
      color: theme.colors.error,
      marginLeft: 8,
    },
    bottomSpacer: {
      height: 24,
    },
  });