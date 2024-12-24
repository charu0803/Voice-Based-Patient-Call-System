import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import {
  Text,
  Surface,
  IconButton,
  useTheme,
  Searchbar,
  Chip,
  Badge,
  Portal,
  Modal,
  Button,
  List,
  ProgressBar,
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';
import { format } from 'date-fns';

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  instructions: string;
  remainingDoses: number;
  totalDoses: number;
  nextDose: string;
  type: 'pill' | 'liquid' | 'injection';
  status: 'active' | 'completed' | 'discontinued';
  sideEffects: string[];
  prescribedBy: string;
}

export default function MedicationsScreen() {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [filteredMeds, setFilteredMeds] = useState<Medication[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMed, setSelectedMed] = useState<Medication | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'active' | 'completed'>('all');
  const theme = useTheme();

  useEffect(() => {
    fetchMedications();
  }, []);

  const fetchMedications = async () => {
    const mockMeds: Medication[] = [
      {
        id: '1',
        name: 'Amoxicillin',
        dosage: '500mg',
        frequency: 'Every 8 hours',
        startDate: '2024-03-01',
        endDate: '2024-03-14',
        instructions: 'Take with food',
        remainingDoses: 18,
        totalDoses: 42,
        nextDose: '2024-03-10T14:00:00',
        type: 'pill',
        status: 'active',
        sideEffects: ['Nausea', 'Diarrhea', 'Rash'],
        prescribedBy: 'Dr. Smith',
      },
    ];
    setMedications(mockMeds);
    setFilteredMeds(mockMeds);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    filterMedications(query, selectedFilter);
  };

  const filterMedications = (query: string, filter: typeof selectedFilter) => {
    let filtered = medications.filter(
      (med) =>
        med.name.toLowerCase().includes(query.toLowerCase()) ||
        med.dosage.toLowerCase().includes(query.toLowerCase())
    );

    if (filter !== 'all') {
      filtered = filtered.filter((med) => med.status === filter);
    }

    setFilteredMeds(filtered);
  };

  const handleFilter = (filter: typeof selectedFilter) => {
    setSelectedFilter(filter);
    filterMedications(searchQuery, filter);
  };

  const getMedicationIcon = (type: Medication['type']) => {
    switch (type) {
      case 'pill':
        return 'pill';
      case 'liquid':
        return 'bottle-tonic';
      case 'injection':
        return 'needle';
      default:
        return 'pill';
    }
  };

  const getStatusColor = (status: Medication['status']) => {
    switch (status) {
      case 'active':
        return '#4CAF50';
      case 'completed':
        return '#2196F3';
      case 'discontinued':
        return '#F44336';
      default:
        return '#757575';
    }
  };

  const renderMedicationCard = (medication: Medication) => (
    <Animated.View
      entering={FadeInDown}
      layout={Layout.springify()}
      key={medication.id}
    >
      <Surface style={styles.medicationCard}>
        <TouchableOpacity
          onPress={() => {
            setSelectedMed(medication);
            setModalVisible(true);
          }}
        >
          <View style={styles.cardHeader}>
            <View style={styles.headerLeft}>
              <Icon
                name={getMedicationIcon(medication.type)}
                size={24}
                color={theme.colors.primary}
              />
              <View style={styles.medicationInfo}>
                <Text style={styles.medicationName}>{medication.name}</Text>
                <Text style={styles.dosage}>{medication.dosage}</Text>
              </View>
            </View>
            <Chip
              mode="outlined"
              style={[styles.statusChip, { borderColor: getStatusColor(medication.status) }]}
            >
              {medication.status}
            </Chip>
          </View>
          <View style={styles.progressSection}>
            <Text style={styles.remainingText}>
              {medication.remainingDoses} doses remaining of {medication.totalDoses}
            </Text>
            <ProgressBar
              progress={medication.remainingDoses / medication.totalDoses}
              color={theme.colors.primary}
              style={styles.progressBar}
            />
          </View>
        </TouchableOpacity>
      </Surface>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#1E88E5', '#1565C0']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <BlurView intensity={20} style={styles.headerBlur}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Medications</Text>
            <Badge size={24} style={styles.activeMedsBadge}>
              {medications.filter((m) => m.status === 'active').length}
            </Badge>
          </View>
          <Searchbar
            placeholder="Search medications..."
            onChangeText={handleSearch}
            value={searchQuery}
            style={styles.searchBar}
          />
          <View style={styles.filterButtons}>
            <Button
              mode={selectedFilter === 'all' ? 'contained' : 'outlined'}
              onPress={() => handleFilter('all')}
              style={styles.filterButton}
            >
              All
            </Button>
            <Button
              mode={selectedFilter === 'active' ? 'contained' : 'outlined'}
              onPress={() => handleFilter('active')}
              style={styles.filterButton}
            >
              Active
            </Button>
            <Button
              mode={selectedFilter === 'completed' ? 'contained' : 'outlined'}
              onPress={() => handleFilter('completed')}
              style={styles.filterButton}
            >
              Completed
            </Button>
          </View>
        </BlurView>
      </LinearGradient>

      <ScrollView style={styles.content}>{filteredMeds.map(renderMedicationCard)}</ScrollView>

      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modalContent}
        >
          {selectedMed && (
            <ScrollView>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{selectedMed.name}</Text>
                <IconButton
                  icon="close"
                  size={24}
                  onPress={() => setModalVisible(false)}
                />
              </View>
              <List.Section>
                <List.Item
                  title="Dosage"
                  description={selectedMed.dosage}
                  left={(props) => <List.Icon {...props} icon="pill" />}
                />
                <List.Item
                  title="Frequency"
                  description={selectedMed.frequency}
                  left={(props) => <List.Icon {...props} icon="clock" />}
                />
                <List.Item
                  title="Instructions"
                  description={selectedMed.instructions}
                  left={(props) => <List.Icon {...props} icon="note" />}
                />
              </List.Section>
            </ScrollView>
          )}
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
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
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  activeMedsBadge: {
    backgroundColor: '#4CAF50',
  },
  searchBar: {
    marginBottom: 12,
    elevation: 0,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  medicationCard: {
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  medicationInfo: {
    flex: 1,
  },
  medicationName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  dosage: {
    fontSize: 14,
    color: '#666',
  },
  statusChip: {
    height: 28,
  },
  progressSection: {
    padding: 16,
  },
  remainingText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  modalContent: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 12,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});
