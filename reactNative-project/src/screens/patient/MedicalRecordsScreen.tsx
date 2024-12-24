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
  Portal,
  Modal,
  Button,
  List,
  Divider,
  SegmentedButtons,
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';
import { format } from 'date-fns';

interface MedicalRecord {
  id: string;
  date: string;
  type: 'diagnosis' | 'procedure' | 'test' | 'vaccination';
  title: string;
  description: string;
  doctor: string;
  department: string;
  attachments?: {
    id: string;
    name: string;
    type: string;
    url: string;
  }[];
  notes?: string;
  followUp?: {
    date: string;
    instructions: string;
  };
  results?: {
    key: string;
    value: string;
    unit?: string;
    normalRange?: string;
  }[];
}

export default function MedicalRecordsScreen() {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<MedicalRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(
    null
  );
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedType, setSelectedType] = useState('all');
  const [timeRange, setTimeRange] = useState('all');
  const theme = useTheme();

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    const mockRecords: MedicalRecord[] = [
      {
        id: '1',
        date: '2024-03-15',
        type: 'diagnosis',
        title: 'Acute Bronchitis',
        description: 'Patient presented with persistent cough and fever...',
        doctor: 'Dr. Sarah Johnson',
        department: 'Pulmonology',
        notes: 'Prescribed antibiotics and recommended rest',
        followUp: {
          date: '2024-03-22',
          instructions: 'Return if symptoms persist',
        },
        attachments: [
          {
            id: 'a1',
            name: 'Chest X-Ray',
            type: 'image/jpeg',
            url: 'https://example.com/xray.jpg',
          },
        ],
        results: [
          {
            key: 'Temperature',
            value: '38.5',
            unit: '°C',
            normalRange: '36.5-37.5',
          },
          {
            key: 'WBC Count',
            value: '11.5',
            unit: 'K/µL',
            normalRange: '4.5-11.0',
          },
        ],
      },
    ];
    setRecords(mockRecords);
    setFilteredRecords(mockRecords);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    filterRecords(query, selectedType, timeRange);
  };

  const filterRecords = (query: string, type: string, range: string) => {
    const now = new Date();
    const filtered = records.filter((record) => {
      const matchesSearch =
        (record.title + record.description + record.doctor)
          .toLowerCase()
          .includes(query.toLowerCase());
      const matchesType = type === 'all' || record.type === type;

      const recordDate = new Date(record.date);
      let matchesRange = true;

      switch (range) {
        case '3months':
          matchesRange = recordDate >= new Date(now.setMonth(now.getMonth() - 3));
          break;
        case '6months':
          matchesRange = recordDate >= new Date(now.setMonth(now.getMonth() - 6));
          break;
        case '1year':
          matchesRange = recordDate >= new Date(now.setFullYear(now.getFullYear() - 1));
          break;
      }

      return matchesSearch && matchesType && matchesRange;
    });

    setFilteredRecords(filtered);
  };

  const getRecordIcon = (type: MedicalRecord['type']) => {
    switch (type) {
      case 'diagnosis':
        return 'stethoscope';
      case 'procedure':
        return 'medical-bag';
      case 'test':
        return 'test-tube';
      case 'vaccination':
        return 'needle';
      default:
        return 'file-document';
    }
  };

  const renderRecord = (record: MedicalRecord) => (
    <Animated.View
      entering={FadeInDown}
      layout={Layout.springify()}
      key={record.id}
    >
      <Surface style={styles.recordCard}>
        <TouchableOpacity
          onPress={() => {
            setSelectedRecord(record);
            setModalVisible(true);
          }}
        >
          <View style={styles.cardHeader}>
            <View style={styles.headerLeft}>
              <Icon
                name={getRecordIcon(record.type)}
                size={24}
                color={theme.colors.primary}
              />
              <View style={styles.recordInfo}>
                <Text style={styles.recordTitle}>{record.title}</Text>
                <Text style={styles.recordDate}>
                  {format(new Date(record.date), 'MMM dd, yyyy')}
                </Text>
              </View>
            </View>
            <Chip mode="outlined">{record.type}</Chip>
          </View>
          <View style={styles.cardContent}>
            <Text numberOfLines={2} style={styles.description}>
              {record.description}
            </Text>
            <View style={styles.doctorInfo}>
              <Icon name="doctor" size={16} color="#666" />
              <Text style={styles.doctorText}>{record.doctor}</Text>
              <Text style={styles.departmentText}>• {record.department}</Text>
            </View>
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
            <Text style={styles.headerTitle}>Medical Records</Text>
            <IconButton
              icon="download"
              iconColor="#fff"
              size={24}
              onPress={() => {}}
              style={styles.headerButton}
            />
          </View>
          <Searchbar
            placeholder="Search records..."
            onChangeText={handleSearch}
            value={searchQuery}
            style={styles.searchBar}
            inputStyle={styles.searchInput}
          />
          <SegmentedButtons
            value={selectedType}
            onValueChange={(value) => {
              setSelectedType(value);
              filterRecords(searchQuery, value, timeRange);
            }}
            buttons={[
              { value: 'all', label: 'All' },
              { value: 'diagnosis', label: 'Diagnoses' },
              { value: 'procedure', label: 'Procedures' },
              { value: 'test', label: 'Tests' },
              { value: 'vaccination', label: 'Vaccinations' },
            ]}
            style={styles.segmentedButtons}
          />
        </BlurView>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {filteredRecords.map(renderRecord)}
      </ScrollView>

      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modalContent}
        >
          {/* Add modal content here */}
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  // Styling goes here
});
