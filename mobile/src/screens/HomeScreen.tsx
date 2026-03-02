import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useQuery } from '@apollo/client';
import { useAuth } from '../auth/AuthContext';
import { GET_TODAY_ATTENDANCE, GET_MY_PLACEMENTS } from '../graphql/operations';

export const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useAuth();
  const { data: attendanceData, refetch: refetchAttendance } = useQuery(GET_TODAY_ATTENDANCE);
  const { data: placementData, refetch: refetchPlacement } = useQuery(GET_MY_PLACEMENTS);
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchAttendance(), refetchPlacement()]);
    setRefreshing(false);
  };

  const todayAttendance = attendanceData?.todayAttendance;
  const activePlacement = placementData?.myPlacements?.find((p: any) => p.isActive);

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello, {user?.firstName}!</Text>
        <Text style={styles.date}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</Text>
      </View>

      {activePlacement && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Current Placement</Text>
          <Text style={styles.placeName}>{activePlacement.place.name}</Text>
          <Text style={styles.placeAddress}>{activePlacement.place.address}</Text>
        </View>
      )}

      <View style={styles.attendanceCard}>
        <Text style={styles.cardTitle}>Today's Status</Text>
        {todayAttendance ? (
          <View>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Status</Text>
              <Text style={[styles.statusValue, { color: todayAttendance.status === 'present' ? '#34c759' : '#ff9500' }]}>
                {todayAttendance.status.charAt(0).toUpperCase() + todayAttendance.status.slice(1)}
              </Text>
            </View>
            {todayAttendance.clockInTime && (
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Clock In</Text>
                <Text style={styles.statusValue}>{new Date(todayAttendance.clockInTime).toLocaleTimeString()}</Text>
              </View>
            )}
            {todayAttendance.clockOutTime && (
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Clock Out</Text>
                <Text style={styles.statusValue}>{new Date(todayAttendance.clockOutTime).toLocaleTimeString()}</Text>
              </View>
            )}
            {todayAttendance.actualHours && (
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Hours Worked</Text>
                <Text style={styles.statusValue}>{todayAttendance.actualHours} hrs</Text>
              </View>
            )}
          </View>
        ) : (
          <Text style={styles.noAttendance}>Not clocked in yet</Text>
        )}
      </View>

      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionGrid}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Attendance')}
          >
            <Text style={styles.actionIcon}>⏰</Text>
            <Text style={styles.actionText}>Attendance</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Activities')}
          >
            <Text style={styles.actionIcon}>📝</Text>
            <Text style={styles.actionText}>Activities</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Reports')}
          >
            <Text style={styles.actionIcon}>📊</Text>
            <Text style={styles.actionText}>Reports</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Profile')}
          >
            <Text style={styles.actionIcon}>👤</Text>
            <Text style={styles.actionText}>Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#007AFF',
    padding: 20,
    paddingTop: 40,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  date: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#fff',
    margin: 16,
    marginTop: -20,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  placeName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  placeAddress: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  attendanceCard: {
    backgroundColor: '#fff',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  statusLabel: {
    fontSize: 14,
    color: '#666',
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  noAttendance: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
  quickActions: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  actionIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
});
