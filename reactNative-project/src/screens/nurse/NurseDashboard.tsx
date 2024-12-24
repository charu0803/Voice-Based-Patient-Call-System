import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { Surface, IconButton } from 'react-native-paper';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Colors } from '../../theme'; // Import Colors

export default function NurseDashboard() {
  const { logout, user } = useAuth();
  const navigation = useNavigation<NavigationProp<any>>();

  const menuItems = [
    {
      title: 'My Patients',
      description: 'View and manage your assigned patients',
      icon: 'account-group',
      screen: 'MyPatients',
      gradient: [Colors.primary, Colors.secondary] as const,
    },
    {
      title: 'Register Patient',
      description: 'Register a new patient in the system',
      icon: 'account-plus',
      screen: 'PatientRegistration',
      gradient: [Colors.secondary, Colors.border] as const,
    },
    {
      title: 'Schedule',
      description: 'View your work schedule and assignments',
      icon: 'calendar-clock',
      screen: 'Schedule',
      gradient: [Colors.mutedText, Colors.primary] as const,
    },
    {
      title: 'Tasks',
      description: 'Manage patient care tasks',
      icon: 'clipboard-check',
      screen: 'Tasks',
      gradient: [Colors.primary, Colors.text] as const,
    },
    {
      title: 'Messages',
      description: 'Communication with team members',
      icon: 'message-text',
      screen: 'Messages',
      gradient: [Colors.border, Colors.secondary] as const,
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={[Colors.primary, Colors.secondary]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <BlurView intensity={20} style={styles.headerBlur}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.headerTitle}>Welcome Back</Text>
              <Text style={styles.headerSubtitle}>Nurse {user?.firstName}</Text>
            </View>
            <IconButton
              icon="logout"
              iconColor="#fff"
              size={24}
              onPress={logout}
              style={styles.logoutButton}
            />
          </View>
        </BlurView>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => navigation.navigate(item.screen)}
          >
            <Surface style={styles.card}>
              <LinearGradient
                colors={item.gradient}
                style={styles.cardGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.iconContainer}>
                  <Icon name={item.icon} size={28} color="#fff" />
                </View>
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.cardDescription}>{item.description}</Text>
                </View>
                <Icon name="chevron-right" size={24} color="#fff" />
              </LinearGradient>
            </Surface>
          </TouchableOpacity>
        ))}
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
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 16,
    fontFamily: 'Roboto-Regular',
    color: Colors.mutedText,
    marginTop: 4,
  },
  logoutButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    borderRadius: 16,
    marginBottom: 16,
    elevation: 4,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  cardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
    marginLeft: 16,
    marginRight: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: 'Roboto-Regular',
    fontWeight: 'bold',
    color: '#fff',
  },
  cardDescription: {
    fontSize: 14,
    fontFamily: 'Roboto-Regular',
    color: '#fff',
    opacity: 0.9,
    marginTop: 4,
  },
});
