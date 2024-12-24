import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import {
  Surface,
  Text,
  Button,
  Chip,
  ActivityIndicator,
} from 'react-native-paper';
import { useAuth } from '../../contexts/AuthContext';
import { taskApi, Task } from '../../services/api';
import { Picker } from '@react-native-picker/picker';
import { Colors } from '../../theme'; // Import Colors

export default function TasksScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const { user } = useAuth();

  const fetchTasks = async (status: string) => {
    try {
      const data = await taskApi.getNurseTasks();
      const filteredTasks = status === 'all' ? data : data.filter(task => task.status === status);
      setTasks(filteredTasks);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch tasks');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTasks(selectedStatus);
  }, [selectedStatus]);

  const handleStatusChange = async (taskId: string, newStatus: 'completed' | 'rejected') => {
    try {
      await taskApi.updateTaskStatus(taskId, newStatus);
      fetchTasks(selectedStatus);
    } catch (error) {
      Alert.alert('Error', 'Failed to update task status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return Colors.secondary;
      case 'completed':
        return Colors.primary;
      case 'rejected':
        return '#EF5350';
      default:
        return Colors.text;
    }
  };

  const renderTask = ({ item }: { item: Task }) => (
    <Surface style={styles.taskCard} elevation={1}>
      <View style={styles.taskHeader}>
        <Text variant="titleMedium" style={styles.taskTitle}>
          {item.description}
        </Text>
        <Chip
          style={[styles.statusChip, { backgroundColor: getStatusColor(item.status) }]}
          textStyle={{ color: 'white' }}
        >
          {item.status.toUpperCase()}
        </Chip>
      </View>

      {item.patient && (
        <Text variant="bodyMedium" style={styles.patientName}>
          Patient ID: {item.patient}
        </Text>
      )}

      <Text variant="bodySmall" style={styles.date}>
        Created: {new Date(item.createdAt).toLocaleDateString()}
      </Text>

      {item.status === 'pending' && (
        <View style={styles.actions}>
          <Button
            mode="contained"
            onPress={() => handleStatusChange(item._id, 'completed')}
            style={[styles.actionButton, { backgroundColor: Colors.primary }]}
          >
            Complete
          </Button>
          <Button
            mode="contained"
            onPress={() => handleStatusChange(item._id, 'rejected')}
            style={[styles.actionButton, { backgroundColor: '#EF5350' }]}
          >
            Reject
          </Button>
        </View>
      )}
    </Surface>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.loadingIndicator} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Picker
        selectedValue={selectedStatus}
        onValueChange={(itemValue) => setSelectedStatus(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="All" value="all" />
        <Picker.Item label="Pending" value="pending" />
        <Picker.Item label="Completed" value="completed" />
        <Picker.Item label="Rejected" value="rejected" />
      </Picker>
      <FlatList
        data={tasks}
        renderItem={renderTask}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => fetchTasks(selectedStatus)} />
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text variant="bodyLarge" style={styles.emptyText}>
              No tasks available
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 16,
  },
  taskCard: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: Colors.background,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskTitle: {
    flex: 1,
    marginRight: 8,
    color: Colors.text,
  },
  statusChip: {
    borderRadius: 4,
  },
  patientName: {
    marginVertical: 4,
    color: Colors.mutedText,
  },
  date: {
    color: Colors.mutedText,
    marginBottom: 8,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
    gap: 8,
  },
  actionButton: {
    minWidth: 100,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    color: Colors.text,
  },
  picker: {
    width: '100%',
    marginBottom: 16,
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    fontSize: 16,
    color: Colors.text,
  },
});
