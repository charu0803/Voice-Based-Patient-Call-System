import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
  StatusBar,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { Surface, IconButton, useTheme } from 'react-native-paper';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Colors } from '../../theme'; // Import Colors from theme.js

export default function AdminDashboard() {
  const { logout } = useAuth();
  const navigation = useNavigation<NavigationProp<any>>();
  const { width } = useWindowDimensions();
  const theme = useTheme();

  const menuItems = [
    { title: 'Nurse Approvals', description: 'Review and manage nurse registration requests', icon: 'account-check', screen: 'NurseApproval', gradient: [Colors.primary, Colors.secondary] },
    { title: 'Create Request', description: 'Create and assign new patient requests', icon: 'plus-circle', screen: 'CreateRequest', gradient: [Colors.primary, Colors.secondary] },
    { title: 'Manage Requests', description: 'View and filter all patient requests', icon: 'clipboard-list', screen: 'RequestManagement', gradient: [Colors.primary, Colors.secondary] },
    { title: 'Manage Nurses', description: 'View and manage nurse accounts', icon: 'account-group', screen: 'ManageNurses', gradient: [Colors.primary, Colors.secondary] },
    { title: 'Patient Records', description: 'Access and manage patient information', icon: 'folder-account', screen: 'PatientRecords', gradient: [Colors.primary, Colors.secondary] },
    { title: 'Reports', description: 'View and generate system reports', icon: 'chart-bar', screen: 'Reports', gradient: [Colors.primary, Colors.secondary] },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={[Colors.primary, Colors.secondary]} style={styles.header}>
        <BlurView intensity={20} style={styles.headerBlur}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Admin Dashboard</Text>
            <Text style={styles.headerSubtitle}>Healthcare Management System</Text>
            <IconButton
              icon="logout"
              iconColor={Colors.text}
              size={24}
              onPress={logout}
              style={styles.logoutButton}
            />
          </View>
        </BlurView>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.gridContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.gridItem, { width: width / 2 - 24 }]}
              onPress={() => navigation.navigate(item.screen)}
            >
              <Surface style={styles.surface}>
                <LinearGradient colors={item.gradient} style={styles.cardGradient}>
                  <View style={styles.iconContainer}>
                    <Icon name={item.icon} size={32} color={Colors.text} />
                  </View>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.cardDescription} numberOfLines={2}>
                    {item.description}
                  </Text>
                </LinearGradient>
              </Surface>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingTop: 48,
    paddingBottom: 16,
  },
  headerBlur: {
    padding: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'Roboto-Regular',
    fontWeight: 'bold',
    color: Colors.text,
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: 'Roboto-Regular',
    color: Colors.mutedText,
    marginTop: 4,
  },
  logoutButton: {
    backgroundColor: Colors.border,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  gridItem: {
    marginBottom: 16,
  },
  surface: {
    borderRadius: 16,
    elevation: 4,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  cardGradient: {
    padding: 16,
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.mutedText,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: 'Roboto-Regular',
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 8,
    textAlign: 'center',
  },
  cardDescription: {
    fontSize: 12,
    fontFamily: 'Roboto-Regular',
    color: Colors.text,
    opacity: 0.9,
    textAlign: 'center',
    marginTop: 4,
  },
});
