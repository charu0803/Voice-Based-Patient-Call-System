import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  StatusBar,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import {
  Text,
  Surface,
  IconButton,
  Searchbar,
  Chip,
  Menu,
  Portal,
  Modal,
  Button,
  ProgressBar,
  List,
  Divider,
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';
import { format } from 'date-fns';
import { Colors } from '../../theme'; // Import theme colors

interface Request {
  id: string;
  patient: {
    id: string;
    name: string;
    room: string;
  };
  nurse: {
    id: string;
    name: string;
  };
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  department: string;
  createdAt: string;
  updatedAt: string;
  estimatedTime?: number;
  completionTime?: number;
}

export default function RequestManagementScreen() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<Request[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<{
    status: string[];
    priority: string[];
    department: string[];
  }>({
    status: [],
    priority: [],
    department: [],
  });
  const [filterMenuVisible, setFilterMenuVisible] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    // Mock data - replace with actual API call
    const mockRequests: Request[] = [
      {
        id: '1',
        patient: {
          id: 'p1',
          name: 'John Doe',
          room: '201',
        },
        nurse: {
          id: 'n1',
          name: 'Jane Smith',
        },
        description: 'Patient requires assistance with medication',
        priority: 'high',
        status: 'in_progress',
        department: 'Cardiology',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        estimatedTime: 30,
        completionTime: 15,
      },
    ];
    setRequests(mockRequests);
    setFilteredRequests(mockRequests);
  };

  const getStatusColor = (status: Request['status']) => {
    switch (status) {
      case 'pending':
        return Colors.mutedText;
      case 'assigned':
        return Colors.primary;
      case 'in_progress':
        return Colors.secondary;
      case 'completed':
        return Colors.text;
      case 'cancelled':
        return Colors.border;
      default:
        return Colors.mutedText;
    }
  };

  const getPriorityColor = (priority: Request['priority']) => {
    switch (priority) {
      case 'low':
        return Colors.text;
      case 'medium':
        return Colors.secondary;
      case 'high':
        return Colors.primary;
      default:
        return Colors.mutedText;
    }
  };

  const renderRequestCard = (request: Request) => (
    <Animated.View
      entering={FadeInDown}
      layout={Layout.springify()}
      key={request.id}
    >
      <Surface style={styles.requestCard}>
        <TouchableOpacity
          onPress={() => {
            setSelectedRequest(request);
            setModalVisible(true);
          }}
        >
          <View style={styles.cardHeader}>
            <View style={styles.headerLeft}>
              <Text style={styles.patientName}>{request.patient.name}</Text>
              <Text style={styles.roomNumber}>Room {request.patient.room}</Text>
            </View>
            <View style={styles.headerRight}>
              <Chip
                mode="outlined"
                style={[styles.statusChip, { borderColor: getStatusColor(request.status) }]}
              >
                {request.status.replace('_', ' ')}
              </Chip>
              <Chip
                mode="outlined"
                style={[styles.priorityChip, { borderColor: getPriorityColor(request.priority) }]}
              >
                {request.priority}
              </Chip>
            </View>
          </View>
        </TouchableOpacity>
      </Surface>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={[Colors.primary, Colors.secondary]} style={styles.header}>
        <BlurView intensity={20} style={styles.headerBlur}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Requests</Text>
          </View>
          <Searchbar
            placeholder="Search requests..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
          />
        </BlurView>
      </LinearGradient>
      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchRequests} />}
      >
        {filteredRequests.map(renderRequestCard)}
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
    fontWeight: 'bold',
    color: Colors.text,
  },
  searchBar: {
    marginBottom: 12,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  requestCard: {
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: Colors.background,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  patientName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  roomNumber: {
    fontSize: 14,
    color: Colors.mutedText,
  },
});
