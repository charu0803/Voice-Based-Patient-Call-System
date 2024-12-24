import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import {
  List,
  Card,
  Text,
  Badge,
  Button,
  ActivityIndicator,
} from 'react-native-paper';
import { nurseApi, Request, User } from '../../services/api';
import { format } from 'date-fns';
import { Colors } from '../../theme'; // Import Colors

interface PatientWithRequests {
  patient: User;
  requests: Request[];
}

export default function MyPatientsScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [patientsData, setPatientsData] = useState<PatientWithRequests[]>([]);

  const fetchPatients = async () => {
    try {
      const data = await nurseApi.getMyPatients();
      setPatientsData(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch patients data');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchPatients();
    setRefreshing(false);
  }, []);

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleStatusUpdate = async (requestId: string, newStatus: string) => {
    try {
      await nurseApi.updateRequestStatus(requestId, newStatus);
      await fetchPatients(); // Refresh the data
      Alert.alert('Success', 'Request status updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update request status');
    }
  };

  const renderRequestItem = (request: Request) => (
    <Card style={styles.requestCard} key={request._id}>
      <Card.Content>
        <View style={styles.requestHeader}>
          <Badge
            style={[
              styles.priorityBadge,
              { backgroundColor: Colors[request.priority] },
            ]}
          >
            {request.priority}
          </Badge>
          <Badge
            style={[
              styles.statusBadge,
              { backgroundColor: Colors[request.status] },
            ]}
          >
            {request.status}
          </Badge>
        </View>

        <Text style={styles.description}>{request.description}</Text>
        <Text style={styles.timestamp}>
          Created: {format(new Date(request.createdAt), 'MMM dd, yyyy HH:mm')}
        </Text>

        <View style={styles.actionButtons}>
          {request.status === 'assigned' && (
            <Button
              mode="contained"
              onPress={() => handleStatusUpdate(request._id, 'in_progress')}
              style={styles.actionButton}
              color={Colors.primary}
            >
              Start
            </Button>
          )}
          {request.status === 'in_progress' && (
            <Button
              mode="contained"
              onPress={() => handleStatusUpdate(request._id, 'completed')}
              style={styles.actionButton}
              color={Colors.secondary}
            >
              Complete
            </Button>
          )}
        </View>
      </Card.Content>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[Colors.primary]}
        />
      }
    >
      {patientsData.length === 0 ? (
        <Text style={styles.emptyText}>No patients assigned yet</Text>
      ) : (
        patientsData.map((patientData) => (
          <List.Accordion
            key={patientData.patient._id}
            title={`${patientData.patient.firstName} ${patientData.patient.lastName}`}
            description={`Room: ${patientData.patient.room}`}
            style={styles.accordion}
            titleStyle={{ color: Colors.text }}
          >
            {patientData.requests.length === 0 ? (
              <Text style={styles.noRequests}>No requests from this patient</Text>
            ) : (
              patientData.requests.map((request) => renderRequestItem(request))
            )}
          </List.Accordion>
        ))
      )}
    </ScrollView>
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
  accordion: {
    backgroundColor: Colors.background,
    marginBottom: 1,
  },
  requestCard: {
    margin: 8,
    elevation: 2,
    backgroundColor: Colors.secondary,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  priorityBadge: {
    alignSelf: 'flex-start',
    color: Colors.text,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    color: Colors.text,
  },
  description: {
    fontSize: 16,
    marginVertical: 8,
    color: Colors.text,
  },
  timestamp: {
    fontSize: 12,
    color: Colors.mutedText,
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  actionButton: {
    marginLeft: 8,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: Colors.text,
  },
  noRequests: {
    textAlign: 'center',
    padding: 16,
    color: Colors.mutedText,
    fontStyle: 'italic',
  },
});
