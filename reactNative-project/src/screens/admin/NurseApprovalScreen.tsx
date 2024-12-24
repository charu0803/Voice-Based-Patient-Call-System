import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  StatusBar,
} from 'react-native';
import {
  Text,
  Surface,
  IconButton,
  Avatar,
  Button,
  Chip,
  Searchbar,
  Portal,
  Modal,
} from 'react-native-paper';
import { userApi, User } from '../../services/api';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';
import { format } from 'date-fns';
import { Colors } from '../../theme'; // Import custom theme colors

export default function NurseApprovalScreen() {
  const [pendingNurses, setPendingNurses] = useState<User[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNurse, setSelectedNurse] = useState<User | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const fetchPendingNurses = async () => {
    try {
      const response = await userApi.getPendingNurses();
      setPendingNurses(response);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch pending nurse registrations');
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchPendingNurses();
    setRefreshing(false);
  }, []);

  useEffect(() => {
    fetchPendingNurses();
  }, []);

  const handleApproval = async (userId: string, status: 'approved' | 'rejected') => {
    try {
      setLoading(true);
      await userApi.approveNurse(userId, status);
      Alert.alert(
        'Success',
        `Nurse registration ${status}`,
        [{ text: 'OK', onPress: fetchPendingNurses }]
      );
    } catch (error) {
      Alert.alert('Error', `Failed to ${status} nurse registration`);
    } finally {
      setLoading(false);
      setModalVisible(false);
    }
  };

  const filteredNurses = pendingNurses.filter(nurse =>
    (nurse.firstName + ' ' + nurse.lastName + nurse.email)
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const renderNurseCard = (nurse: User) => (
    <Animated.View
      entering={FadeInDown}
      layout={Layout.springify()}
      key={nurse._id}
    >
      <Surface style={styles.nurseCard}>
        <View style={styles.cardHeader}>
          <View style={styles.nurseInfo}>
            <Avatar.Text
              size={50}
              label={`${nurse.firstName[0]}${nurse.lastName[0]}`}
              style={{ backgroundColor: Colors.primary }}
            />
            <View style={styles.nameContainer}>
              <Text style={styles.nurseName}>
                {nurse.firstName} {nurse.lastName}
              </Text>
              <Text style={styles.nurseEmail}>{nurse.email}</Text>
            </View>
          </View>
          <Chip mode="outlined" style={styles.departmentChip}>
            {nurse.department}
          </Chip>
        </View>

        <View style={styles.cardContent}>
          <View style={styles.infoRow}>
            <Icon name="calendar" size={20} color={Colors.text} />
            <Text style={styles.infoText}>
              Applied: {format(new Date(nurse.createdAt), 'MMM dd, yyyy')}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="phone" size={20} color={Colors.text} />
            <Text style={styles.infoText}>{nurse.phone || 'No phone provided'}</Text>
          </View>
        </View>

        <View style={styles.cardActions}>
          <Button
            mode="contained"
            onPress={() => {
              setSelectedNurse(nurse);
              setModalVisible(true);
            }}
            icon="account-details"
            style={styles.viewButton}
            color={Colors.primary}
          >
            View Details
          </Button>
        </View>
      </Surface>
    </Animated.View>
  );

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
            <Text style={styles.headerTitle}>Nurse Approvals</Text>
            <IconButton
              icon="refresh"
              iconColor={Colors.text}
              size={24}
              onPress={onRefresh}
              style={styles.headerButton}
            />
          </View>
          <Searchbar
            placeholder="Search nurses..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
            inputStyle={styles.searchInput}
          />
        </BlurView>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredNurses.length === 0 ? (
          <Surface style={styles.emptyContainer}>
            <Icon name="account-check" size={48} color={Colors.primary} />
            <Text style={styles.emptyText}>No pending approvals</Text>
            <Text style={styles.emptySubtext}>
              All nurse registrations have been processed
            </Text>
          </Surface>
        ) : (
          filteredNurses.map(renderNurseCard)
        )}
      </ScrollView>

      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modalContent}
        >
          {selectedNurse && (
            <View>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Nurse Details</Text>
                <IconButton
                  icon="close"
                  size={24}
                  onPress={() => setModalVisible(false)}
                  color={Colors.text}
                />
              </View>

              <View style={styles.modalBody}>
                <Avatar.Text
                  size={80}
                  label={`${selectedNurse.firstName[0]}${selectedNurse.lastName[0]}`}
                  style={[styles.modalAvatar, { backgroundColor: Colors.primary }]}
                />
                <Text style={[styles.modalName, { color: Colors.text }]}>
                  {selectedNurse.firstName} {selectedNurse.lastName}
                </Text>
                <Text style={[styles.modalEmail, { color: Colors.mutedText }]}>
                  {selectedNurse.email}
                </Text>
              </View>

              <View style={styles.modalActions}>
                <Button
                  mode="contained"
                  onPress={() => handleApproval(selectedNurse._id, 'approved')}
                  style={styles.actionButton}
                  color={Colors.primary}
                >
                  Approve
                </Button>
                <Button
                  mode="contained"
                  onPress={() => handleApproval(selectedNurse._id, 'rejected')}
                  style={[styles.actionButton, { backgroundColor: Colors.border }]}
                >
                  Reject
                </Button>
              </View>
            </View>
          )}
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
  searchBar: {
    marginBottom: 12,
    elevation: 0,
    backgroundColor: Colors.background,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
    borderRadius: 16,
    marginTop: 32,
    backgroundColor: Colors.background,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
});

