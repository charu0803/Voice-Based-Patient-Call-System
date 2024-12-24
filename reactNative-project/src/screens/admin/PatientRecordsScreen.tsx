import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import {
  Text,
  Surface,
  IconButton,
  Searchbar,
  Chip,
  Avatar,
  FAB,
  Portal,
  Modal,
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';
import { Colors } from '../../theme'; // Import custom theme colors

interface PatientRecord {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
  gender: string;
  room: string;
  status: string;
  lastVisit: string;
  diagnosis: string[];
  avatar?: string;
}

export default function PatientRecordsScreen() {
  const [records, setRecords] = useState<PatientRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<PatientRecord | null>(null);

  const filters = ['Active', 'Discharged', 'Critical', 'Regular', 'Emergency'];

  const fetchRecords = async () => {
    // Mock data for now
    const mockRecords: PatientRecord[] = [
      {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        age: 45,
        gender: 'Male',
        room: '201',
        status: 'Active',
        lastVisit: '2024-03-15',
        diagnosis: ['Hypertension', 'Diabetes'],
      },
    ];
    setRecords(mockRecords);
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchRecords();
    setRefreshing(false);
  };

  const toggleFilter = (filter: string) => {
    setSelectedFilters((prev) =>
      prev.includes(filter) ? prev.filter((f) => f !== filter) : [...prev, filter]
    );
  };

  const filteredRecords = records.filter((record) => {
    const matchesSearch = (
      record.firstName.toLowerCase() +
      record.lastName.toLowerCase() +
      record.room
    ).includes(searchQuery.toLowerCase());

    const matchesFilters =
      selectedFilters.length === 0 || selectedFilters.includes(record.status);

    return matchesSearch && matchesFilters;
  });

  const renderPatientCard = (record: PatientRecord) => (
    <Animated.View entering={FadeInDown} layout={Layout.springify()} key={record.id}>
      <Surface style={styles.patientCard}>
        <TouchableOpacity
          onPress={() => {
            setSelectedRecord(record);
            setModalVisible(true);
          }}
        >
          <View style={styles.cardHeader}>
            <View style={styles.patientInfo}>
              <Avatar.Image
                size={50}
                source={
                  record.avatar
                    ? { uri: record.avatar }
                    : require('../../../assets/default-avatar.png')
                }
              />
              <View style={styles.nameContainer}>
                <Text style={styles.patientName}>
                  {record.firstName} {record.lastName}
                </Text>
                <Text style={styles.patientDetails}>
                  {record.age} years • Room {record.room}
                </Text>
              </View>
            </View>
            <Chip
              mode="outlined"
              style={[
                styles.statusChip,
                { borderColor: Colors.primary, color: Colors.text },
              ]}
            >
              {record.status}
            </Chip>
          </View>

          <View style={styles.diagnosisContainer}>
            {record.diagnosis.map((diagnosis, index) => (
              <Chip key={index} style={styles.diagnosisChip} textStyle={styles.diagnosisText}>
                {diagnosis}
              </Chip>
            ))}
          </View>

          <View style={styles.cardFooter}>
            <Text style={styles.lastVisit}>
              Last visit: {new Date(record.lastVisit).toLocaleDateString()}
            </Text>
            <IconButton icon="chevron-right" size={24} iconColor={Colors.primary} />
          </View>
        </TouchableOpacity>
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
            <Text style={styles.headerTitle}>Patient Records</Text>
            <IconButton
              icon="plus"
              iconColor={Colors.text}
              size={24}
              onPress={() => {}}
              style={styles.headerButton}
            />
          </View>
          <Searchbar
            placeholder="Search patients..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
            inputStyle={styles.searchInput}
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filtersContainer}
          >
            {filters.map((filter) => (
              <Chip
                key={filter}
                selected={selectedFilters.includes(filter)}
                onPress={() => toggleFilter(filter)}
                style={styles.filterChip}
              >
                {filter}
              </Chip>
            ))}
          </ScrollView>
        </BlurView>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {filteredRecords.map(renderPatientCard)}
      </ScrollView>

      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modalContent}
        >
          {selectedRecord && (
            <View>
              <Text style={styles.modalTitle}>Patient Details</Text>
              {/* Add detailed patient information */}
            </View>
          )}
        </Modal>
      </Portal>

      <FAB icon="plus" style={styles.fab} onPress={() => {}} color={Colors.primary} />
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
  patientCard: {
    borderRadius: 12,
    elevation: 2,
  },
  modalContent: {
    backgroundColor: Colors.background,
  },
});
