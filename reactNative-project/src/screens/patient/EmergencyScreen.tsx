import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  Text,
  Surface,
  IconButton,
  Button,
  Portal,
  Modal,
  ProgressBar,
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
} from 'react-native-reanimated';
import { useAuth } from '../../contexts/AuthContext';
import { userApi } from '../../services/api';
import { Colors } from '../../theme'; // Import consistent theme colors

export default function EmergencyScreen() {
  const [emergencyActive, setEmergencyActive] = useState(false);
  const [helpOnWay, setHelpOnWay] = useState(false);
  const [confirmationVisible, setConfirmationVisible] = useState(false);
  const [estimatedTime, setEstimatedTime] = useState(0);
  const { user } = useAuth();

  const pulseStyle = useAnimatedStyle(() => {
    if (!emergencyActive) return {};
    return {
      transform: [
        {
          scale: withRepeat(
            withSequence(withSpring(1.2), withSpring(1)),
            -1,
            true
          ),
        },
      ],
    };
  });

  const handleEmergency = () => {
    setConfirmationVisible(true);
  };

  const confirmEmergency = async () => {
    setConfirmationVisible(false);
    setEmergencyActive(true);
    setEstimatedTime(3);

    setTimeout(() => {
      setHelpOnWay(true);
    }, 2000);

    try {
      const response = await userApi.getNurseByDepartment('emergency');
      if (!response) {
        Alert.alert('Error', 'No Emergency Nurse Available. Contact Admin');
        return;
      }

      const requestData = {
        patient: user.id,
        nurse: response._id,
        priority: 'high',
        description: 'Emergency alert triggered',
        department: 'Emergency',
      };

      await userApi.createRequest(requestData);
    } catch (error) {
      Alert.alert('Error', 'Failed to send emergency alert');
    }
  };

  const cancelEmergency = () => {
    setEmergencyActive(false);
    setHelpOnWay(false);
  };

  const EmergencyButton = () => (
    <Animated.View style={[styles.emergencyButtonContainer, pulseStyle]}>
      <TouchableOpacity
        style={[
          styles.emergencyButton,
          emergencyActive && styles.emergencyButtonActive,
        ]}
        onPress={handleEmergency}
        disabled={emergencyActive}
      >
        <Icon
          name="alert-octagon"
          size={64}
          color={emergencyActive ? Colors.text : Colors.primary}
        />
        <Text
          style={[
            styles.emergencyButtonText,
            emergencyActive && styles.emergencyButtonTextActive,
          ]}
        >
          {emergencyActive ? 'EMERGENCY ACTIVE' : 'PRESS FOR EMERGENCY'}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );

  const QuickActions = () => (
    <View style={styles.quickActions}>
      {[
        { name: 'phone', text: 'Call Nurse' },
        { name: 'medical-bag', text: 'Medical Help' },
        { name: 'pill', text: 'Medicine' },
        { name: 'account-nurse', text: 'Assistance' },
      ].map((action, index) => (
        <Surface style={styles.actionCard} key={index}>
          <TouchableOpacity style={styles.actionButton}>
            <Icon name={action.name} size={32} color={Colors.primary} />
            <Text style={styles.actionText}>{action.text}</Text>
          </TouchableOpacity>
        </Surface>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={
          emergencyActive
            ? [Colors.error, Colors.secondary]
            : [Colors.primary, Colors.secondary]
        }
        style={styles.header}
      >
        <BlurView intensity={20} style={styles.headerBlur}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Emergency</Text>
            {emergencyActive && (
              <IconButton
                icon="close"
                iconColor={Colors.text}
                size={24}
                onPress={cancelEmergency}
                style={styles.headerButton}
              />
            )}
          </View>
        </BlurView>
      </LinearGradient>

      <ScrollView style={styles.content}>
        <Animated.View entering={FadeInDown}>
          {emergencyActive ? (
            <Surface style={styles.statusCard}>
              <View style={styles.statusHeader}>
                <Icon name="alert-circle" size={32} color={Colors.error} />
                <Text style={styles.statusTitle}>Emergency Alert Active</Text>
              </View>
              {helpOnWay && (
                <>
                  <Text style={styles.statusText}>Help is on the way!</Text>
                  <View style={styles.estimatedTime}>
                    <Text style={styles.estimatedTimeText}>
                      Estimated arrival in {estimatedTime} minutes
                    </Text>
                    <ProgressBar
                      progress={0.3}
                      color={Colors.primary}
                      style={styles.progressBar}
                    />
                  </View>
                </>
              )}
              <Button
                mode="contained"
                onPress={cancelEmergency}
                style={styles.cancelButton}
                icon="close-circle"
              >
                Cancel Emergency
              </Button>
            </Surface>
          ) : (
            <>
              <EmergencyButton />
              <Surface style={styles.infoCard}>
                <Text style={styles.infoTitle}>Quick Actions</Text>
                <Text style={styles.infoText}>
                  Select an action below or press the emergency button for
                  immediate assistance
                </Text>
              </Surface>
              <QuickActions />
            </>
          )}
        </Animated.View>
      </ScrollView>

      <Portal>
        <Modal
          visible={confirmationVisible}
          onDismiss={() => setConfirmationVisible(false)}
          contentContainerStyle={styles.modalContent}
        >
          <View style={styles.modalHeader}>
            <Icon name="alert" size={48} color={Colors.error} />
            <Text style={styles.modalTitle}>Confirm Emergency</Text>
          </View>
          <Text style={styles.modalText}>
            Are you sure you want to trigger an emergency alert? This will
            immediately notify medical staff.
          </Text>
          <View style={styles.modalActions}>
            <Button
              mode="outlined"
              onPress={() => setConfirmationVisible(false)}
              style={styles.modalButton}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={confirmEmergency}
              style={[styles.modalButton, { backgroundColor: Colors.error }]}
            >
              Confirm Emergency
            </Button>
          </View>
        </Modal>
      </Portal>
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
    fontWeight: 'bold',
    color: Colors.text,
  },
  headerButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  emergencyButtonContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  emergencyButton: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: Colors.text,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  emergencyButtonActive: {
    backgroundColor: Colors.error,
    borderColor: Colors.text,
  },
  emergencyButtonText: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
    textAlign: 'center',
  },
  emergencyButtonTextActive: {
    color: Colors.text,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
  },
  actionButton: {
    padding: 20,
    alignItems: 'center',
  },
  actionText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: 'bold',
  },
  statusCard: {
    padding: 20,
    borderRadius: 12,
    marginVertical: 24,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  statusText: {
    fontSize: 18,
    textAlign: 'center',
    marginVertical: 16,
  },
  estimatedTime: {
    marginVertical: 16,
  },
  estimatedTimeText: {
    fontSize: 16,
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  cancelButton: {
    marginTop: 24,
  },
  infoCard: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 16,
    lineHeight: 24,
  },
  modalContent: {
    backgroundColor: Colors.text,
    margin: 20,
    borderRadius: 12,
    padding: 20,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 12,
  },
  modalText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
  },
});
