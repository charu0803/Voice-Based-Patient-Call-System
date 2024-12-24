import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Card, Text } from 'react-native-paper';
import { useAuth } from '../../contexts/AuthContext';
import { shiftApi, Shift } from '../../services/api';
import { Colors } from '../../theme'; // Import Colors

export const ScheduleScreen = () => {
  const { user } = useAuth();
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');

  const fetchShifts = async () => {
    try {
      if (user?.id) {
        const data = await shiftApi.getNurseShifts(user.id);
        if (Array.isArray(data)) {
          setShifts(data);
        } else {
          console.error('Unexpected data format:', data);
        }
      } else {
        console.error('No user ID available');
      }
    } catch (error) {
      console.error('Error fetching shifts:', error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchShifts();
  }, [user?.id]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchShifts();
  }, [user?.id]);

  const markedDates = shifts.reduce((acc, shift) => {
    acc[shift.date] = { marked: true, dotColor: Colors.primary };
    return acc;
  }, {} as { [key: string]: any });

  const selectedDateShifts = shifts.filter(shift => shift.date === selectedDate);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Calendar
        onDayPress={day => setSelectedDate(day.dateString)}
        markedDates={{
          ...markedDates,
          [selectedDate]: {
            selected: true,
            marked: markedDates[selectedDate]?.marked,
            dotColor: Colors.primary,
          },
        }}
        theme={{
          selectedDayBackgroundColor: Colors.primary,
          todayTextColor: Colors.primary,
          arrowColor: Colors.primary,
          textDayFontFamily: 'Roboto-Regular',
          textMonthFontFamily: 'Roboto-Regular',
          textDayHeaderFontFamily: 'Roboto-Regular',
        }}
      />

      <View style={styles.shiftsContainer}>
        {selectedDate ? (
          selectedDateShifts.length > 0 ? (
            selectedDateShifts.map(shift => (
              <Card key={shift._id} style={styles.shiftCard}>
                <Card.Content>
                  <Text variant="titleMedium" style={styles.text}>
                    Department: {shift.department}
                  </Text>
                  <Text variant="bodyMedium" style={styles.text}>
                    Time: {shift.startTime} - {shift.endTime}
                  </Text>
                  {shift.notes && (
                    <Text variant="bodyMedium" style={styles.text}>
                      Notes: {shift.notes}
                    </Text>
                  )}
                </Card.Content>
              </Card>
            ))
          ) : (
            <Text style={styles.noShifts}>No shifts scheduled for this date</Text>
          )
        ) : (
          <Text style={styles.selectDate}>Select a date to view shifts</Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  shiftsContainer: {
    padding: 16,
  },
  shiftCard: {
    marginBottom: 12,
    backgroundColor: Colors.background,
  },
  noShifts: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: Colors.mutedText,
  },
  selectDate: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: Colors.mutedText,
  },
  text: {
    color: Colors.text,
  },
});

export default ScheduleScreen;
