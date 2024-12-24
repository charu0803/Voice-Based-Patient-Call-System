import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  StatusBar,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  Text,
  Surface,
  IconButton,
  useTheme,
  Searchbar,
  Menu,
  Chip,
  Avatar,
  FAB,
  Portal,
  Modal,
  Button,
  Divider,
  List,
  TextInput,
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';
import { format } from 'date-fns';
import { User } from '../../types/api';
import { Department, departmentApi, taskApi, userApi } from '../../services/api';
import { Colors } from '../../theme'; // Import theme colors

interface NurseStats {
  completedRequests: number;
  activeRequests: number;
  averageResponseTime: number;
  rating: number;
}

export default function ManageNursesScreen({ navigation }) {
  const [nurses, setNurses] = useState<User[]>([]);
  const [filteredNurses, setFilteredNurses] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNurse, setSelectedNurse] = useState<User | null>(null);
  const [nurseStats, setNurseStats] = useState<NurseStats | null>(null);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [isTaskModalVisible, setIsTaskModalVisible] = useState(false);
  const [taskDescription, setTaskDescription] = useState('');
  const [isAssigningTask, setIsAssigningTask] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);

  useEffect(() => {
    fetchNurses();
    fetchDepartments();
  }, []);

  const fetchNurses = async () => {
    try {
      const response = await userApi.getUsersByRole('nurse');
      setNurses(response);
      setFilteredNurses(response);
    } catch (err) {
      console.error('Error fetching nurses:', err);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await departmentApi.getAll();
      setDepartments(response.departments);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const filtered = nurses.filter(nurse =>
      `${nurse.firstName} ${nurse.lastName} ${nurse.email}`
        .toLowerCase()
        .includes(query.toLowerCase())
    );
    setFilteredNurses(filtered);
  };

  const handleFilter = (filter: string) => {
    setSelectedFilters(prev => {
      const newFilters = prev.includes(filter)
        ? prev.filter(f => f !== filter)
        : [...prev, filter];

      const filtered = nurses.filter(nurse =>
        newFilters.length === 0 || newFilters.includes(nurse.department!.toLocaleLowerCase())
      );
      setFilteredNurses(filtered);

      return newFilters;
    });
  };

  const renderNurseCard = (nurse: User) => (
    <Animated.View entering={FadeInDown} layout={Layout.springify()} key={nurse._id}>
      <Surface style={styles.nurseCard}>
        <TouchableOpacity
          onPress={() => {
            setSelectedNurse(nurse);
            setModalVisible(true);
          }}
        >
          <View style={styles.cardHeader}>
            <View style={styles.nurseInfo}>
              <Avatar.Text
                size={50}
                label={`${nurse.firstName[0]}${nurse.lastName[0]}`}
                style={{ backgroundColor: Colors.primary }}
              />
              <View style={styles.nameContainer}>
                <Text style={styles.nurseName}>{nurse.firstName} {nurse.lastName}</Text>
                <Text style={styles.nurseEmail}>{nurse.email}</Text>
              </View>
            </View>
            <Chip
              mode="outlined"
              style={[
                styles.statusChip,
                { borderColor: getStatusColor(nurse.status) },
              ]}
            >
              {nurse.status}
            </Chip>
          </View>
        </TouchableOpacity>
      </Surface>
    </Animated.View>
  );

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'Active':
        return Colors.primary;
      case 'On Leave':
        return Colors.secondary;
      case 'Busy':
        return '#F44336';
      default:
        return '#757575';
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={[Colors.primary, Colors.secondary]} style={styles.header}>
        <BlurView intensity={20} style={styles.headerBlur}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Manage Nurses</Text>
            <IconButton
              icon="filter-variant"
              iconColor={Colors.text}
              size={24}
              onPress={() => setShowFilterMenu(true)}
              style={styles.headerButton}
            />
          </View>
          <Searchbar
            placeholder="Search nurses..."
            onChangeText={handleSearch}
            value={searchQuery}
            style={styles.searchBar}
            inputStyle={styles.searchInput}
          />
        </BlurView>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchNurses} />
        }
      >
        <View style={styles.filterChips}>
          {departments.map((dept) => (
            <Chip
              key={dept.id}
              selected={selectedFilters.includes(dept.id)}
              onPress={() => handleFilter(dept.id)}
              style={styles.filterChip}
              showSelectedOverlay
            >
              {dept.name}
            </Chip>
          ))}
        </View>
        {filteredNurses.map(renderNurseCard)}
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
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
  },
  headerButton: {
    backgroundColor: Colors.border,
  },
  searchBar: {
    marginBottom: 12,
    backgroundColor: Colors.background,
  },
  searchInput: {
    fontSize: 16,
    color: Colors.text,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  filterChip: {
    marginRight: 8,
    backgroundColor: Colors.background,
  },
  nurseCard: {
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  nurseInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nameContainer: {
    marginLeft: 12,
  },
  nurseName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  nurseEmail: {
    fontSize: 14,
    color: Colors.mutedText,
  },
  statusChip: {
    height: 28,
  },
});
