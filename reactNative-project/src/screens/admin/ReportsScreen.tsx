import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  StatusBar,
  Dimensions,
} from 'react-native';
import {
  Text,
  Surface,
  IconButton,
  SegmentedButtons,
  Button,
  Menu,
  Divider,
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { format, subDays } from 'date-fns';
import { Colors } from '../../theme'; // Import theme colors

const { width } = Dimensions.get('window');

interface ReportData {
  requestsByDepartment: {
    department: string;
    count: number;
    color: string;
  }[];
  requestsByStatus: {
    status: string;
    count: number;
  }[];
  requestsTrend: {
    date: string;
    count: number;
  }[];
  nursePerformance: {
    name: string;
    completedRequests: number;
    averageResponseTime: number;
  }[];
}

export default function ReportsScreen() {
  const [timeRange, setTimeRange] = useState('week');
  const [reportType, setReportType] = useState('requests');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);

  useEffect(() => {
    fetchReportData();
  }, [timeRange]);

  const fetchReportData = async () => {
    const mockData: ReportData = {
      requestsByDepartment: [
        { department: 'Cardiology', count: 45, color: Colors.primary },
        { department: 'Neurology', count: 28, color: Colors.secondary },
        { department: 'Pediatrics', count: 32, color: Colors.border },
        { department: 'Oncology', count: 22, color: Colors.text },
      ],
      requestsByStatus: [
        { status: 'Completed', count: 85 },
        { status: 'In Progress', count: 45 },
        { status: 'Pending', count: 32 },
      ],
      requestsTrend: Array.from({ length: 7 }, (_, i) => ({
        date: format(subDays(new Date(), i), 'MM/dd'),
        count: Math.floor(Math.random() * 50) + 20,
      })).reverse(),
      nursePerformance: [
        { name: 'John Doe', completedRequests: 45, averageResponseTime: 12 },
        { name: 'Jane Smith', completedRequests: 38, averageResponseTime: 15 },
        { name: 'Mike Johnson', completedRequests: 42, averageResponseTime: 10 },
      ],
    };
    setReportData(mockData);
  };

  const renderChart = () => {
    if (!reportData) return null;

    switch (reportType) {
      case 'requests':
        return (
          <Surface style={styles.chartCard}>
            <Text style={styles.chartTitle}>Requests Trend</Text>
            <LineChart
              data={{
                labels: reportData.requestsTrend.map(item => item.date),
                datasets: [{ data: reportData.requestsTrend.map(item => item.count) }],
              }}
              width={width - 64}
              height={220}
              chartConfig={{
                backgroundColor: Colors.background,
                backgroundGradientFrom: Colors.background,
                backgroundGradientTo: Colors.background,
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(255, 112, 67, ${opacity})`,
                style: { borderRadius: 16 },
              }}
              bezier
              style={styles.chart}
            />
          </Surface>
        );

      case 'departments':
        return (
          <Surface style={styles.chartCard}>
            <Text style={styles.chartTitle}>Requests by Department</Text>
            <PieChart
              data={reportData.requestsByDepartment.map(item => ({
                name: item.department,
                population: item.count,
                color: item.color,
                legendFontColor: Colors.text,
                legendFontSize: 12,
              }))}
              width={width - 64}
              height={220}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              style={styles.chart}
            />
          </Surface>
        );

      case 'performance':
        return (
          <Surface style={styles.chartCard}>
            <Text style={styles.chartTitle}>Nurse Performance</Text>
            <BarChart
              data={{
                labels: reportData.nursePerformance.map(item => item.name.split(' ')[0]),
                datasets: [{ data: reportData.nursePerformance.map(item => item.completedRequests) }],
              }}
              width={width - 64}
              height={220}
              chartConfig={{
                backgroundColor: Colors.background,
                backgroundGradientFrom: Colors.background,
                backgroundGradientTo: Colors.background,
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(255, 112, 67, ${opacity})`,
                style: { borderRadius: 16 },
              }}
              style={styles.chart}
            />
          </Surface>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={[Colors.primary, Colors.secondary]} style={styles.header}>
        <BlurView intensity={20} style={styles.headerBlur}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Reports</Text>
            <Menu
              visible={showExportMenu}
              onDismiss={() => setShowExportMenu(false)}
              anchor={
                <IconButton
                  icon="export-variant"
                  iconColor={Colors.text}
                  size={24}
                  onPress={() => setShowExportMenu(true)}
                  style={styles.headerButton}
                />
              }
            >
              <Menu.Item onPress={() => {}} title="Export as PDF" />
              <Menu.Item onPress={() => {}} title="Export as CSV" />
              <Menu.Item onPress={() => {}} title="Share Report" />
            </Menu>
          </View>
          <SegmentedButtons
            value={timeRange}
            onValueChange={setTimeRange}
            buttons={[
              { value: 'week', label: 'Week' },
              { value: 'month', label: 'Month' },
              { value: 'year', label: 'Year' },
            ]}
            style={styles.segmentedButtons}
          />
        </BlurView>
      </LinearGradient>

      <ScrollView style={styles.content}>{renderChart()}</ScrollView>
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
    backgroundColor: Colors.secondary,
  },
  chartCard: {
    borderRadius: 16,
    padding: 16,
    backgroundColor: Colors.background,
    marginVertical: 16,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  chart: {
    borderRadius: 16,
  },
});
