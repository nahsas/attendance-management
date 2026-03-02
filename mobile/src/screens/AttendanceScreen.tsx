import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useQuery, useMutation } from '@apollo/client';
import * as Location from 'expo-location';
import { GET_TODAY_ATTENDANCE, GET_MY_PLACEMENTS, CLOCK_IN_MUTATION, CLOCK_OUT_MUTATION, LOG_BREAK_MUTATION, END_BREAK_MUTATION } from '../graphql/operations';

export const AttendanceScreen: React.FC = () => {
  const { data: attendanceData, refetch: refetchAttendance } = useQuery(GET_TODAY_ATTENDANCE);
  const { data: placementData } = useQuery(GET_MY_PLACEMENTS);
  const [clockIn, { loading: clockingIn }] = useMutation(CLOCK_IN_MUTATION);
  const [clockOut, { loading: clockingOut }] = useMutation(CLOCK_OUT_MUTATION);
  const [logBreak] = useMutation(LOG_BREAK_MUTATION);
  const [endBreak] = useMutation(END_BREAK_MUTATION);
  
  const [location, setLocation] = useState<any>(null);
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [currentBreakId, setCurrentBreakId] = useState<string | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);

  const todayAttendance = attendanceData?.todayAttendance;
  const activePlacement = placementData?.myPlacements?.find((p: any) => p.isActive);
  const breakConfig = activePlacement?.place?.breakConfig;

  useEffect(() => {
    getLocation();
  }, []);

  const getLocation = async () => {
    setLoadingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required for attendance');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);
    } catch (error) {
      console.error('Location error:', error);
    } finally {
      setLoadingLocation(false);
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3;
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const handleClockIn = async () => {
    if (!location || !activePlacement) {
      Alert.alert('Error', 'Location or placement not available');
      return;
    }

    const placeLat = activePlacement.place.latitude;
    const placeLon = activePlacement.place.longitude;
    const distance = calculateDistance(location.latitude, location.longitude, placeLat, placeLon);

    if (distance > 500) {
      Alert.alert('Too Far', 'You must be within 500m of your internship place to clock in');
      return;
    }

    try {
      await clockIn({
        variables: {
          studentPlacementId: activePlacement.id,
          latitude: location.latitude,
          longitude: location.longitude,
        },
      });
      refetchAttendance();
      Alert.alert('Success', 'Clocked in successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const handleClockOut = async () => {
    if (!location || !todayAttendance) return;

    try {
      await clockOut({
        variables: {
          sessionId: todayAttendance.id,
          latitude: location.latitude,
          longitude: location.longitude,
        },
      });
      refetchAttendance();
      Alert.alert('Success', 'Clocked out successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const handleLogBreak = async (breakNumber: number) => {
    if (!todayAttendance) return;
    try {
      const result = await logBreak({
        variables: {
          sessionId: todayAttendance.id,
          breakNumber,
        },
      });
      setIsOnBreak(true);
      setCurrentBreakId(result.data.logBreak.breakLog.id);
      Alert.alert('Success', `Break ${breakNumber} started`);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const handleEndBreak = async () => {
    if (!currentBreakId) return;
    try {
      await endBreak({ variables: { breakLogId: currentBreakId } });
      setIsOnBreak(false);
      setCurrentBreakId(null);
      Alert.alert('Success', 'Break ended');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Attendance</Text>
        <Text style={styles.subtitle}>{new Date().toLocaleDateString()}</Text>
      </View>

      {activePlacement && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Internship Place</Text>
          <Text style={styles.placeName}>{activePlacement.place.name}</Text>
          <Text style={styles.placeAddress}>{activePlacement.place.address}</Text>
        </View>
      )}

      {loadingLocation ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Getting location...</Text>
        </View>
      ) : !location ? (
        <TouchableOpacity style={styles.locationButton} onPress={getLocation}>
          <Text style={styles.locationButtonText}>Enable Location</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.locationStatus}>
          <Text style={styles.locationText}>📍 Location enabled</Text>
        </View>
      )}

      <View style={styles.statusCard}>
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
          <Text style={styles.noAttendance}>Not clocked in</Text>
        )}
      </View>

      <View style={styles.actions}>
        {!todayAttendance ? (
          <TouchableOpacity 
            style={[styles.clockButton, styles.clockInButton]} 
            onPress={handleClockIn}
            disabled={clockingIn || !location}
          >
            {clockingIn ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.clockButtonText}>Clock In</Text>
            )}
          </TouchableOpacity>
        ) : todayAttendance.clockOutTime ? (
          <View style={styles.completedContainer}>
            <Text style={styles.completedText}>✓ Attendance completed for today</Text>
          </View>
        ) : (
          <>
            <TouchableOpacity 
              style={[styles.clockButton, styles.clockOutButton]} 
              onPress={handleClockOut}
              disabled={clockingOut}
            >
              {clockingOut ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.clockButtonText}>Clock Out</Text>
              )}
            </TouchableOpacity>

            {breakConfig && (
              <View style={styles.breakSection}>
                <Text style={styles.breakTitle}>Breaks</Text>
                {breakConfig.breakCount >= 1 && (
                  isOnBreak ? (
                    <TouchableOpacity style={styles.breakButton} onPress={handleEndBreak}>
                      <Text style={styles.breakButtonText}>End Break</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity style={styles.breakButton} onPress={() => handleLogBreak(1)}>
                      <Text style={styles.breakButtonText}>Start Break 1</Text>
                    </TouchableOpacity>
                  )
                )}
                {breakConfig.breakCount === 2 && !isOnBreak && (
                  <TouchableOpacity style={styles.breakButton} onPress={() => handleLogBreak(2)}>
                    <Text style={styles.breakButtonText}>Start Break 2</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </>
        )}
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
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
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  locationButton: {
    margin: 16,
    marginTop: 0,
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  locationButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  locationStatus: {
    margin: 16,
    marginTop: 0,
    padding: 12,
    backgroundColor: '#e8f5e9',
    borderRadius: 8,
    alignItems: 'center',
  },
  locationText: {
    color: '#34c759',
    fontSize: 14,
  },
  statusCard: {
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
  actions: {
    padding: 16,
  },
  clockButton: {
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  clockInButton: {
    backgroundColor: '#34c759',
  },
  clockOutButton: {
    backgroundColor: '#ff3b30',
  },
  clockButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  completedContainer: {
    padding: 20,
    backgroundColor: '#e8f5e9',
    borderRadius: 12,
    alignItems: 'center',
  },
  completedText: {
    color: '#34c759',
    fontSize: 16,
    fontWeight: '600',
  },
  breakSection: {
    marginTop: 20,
  },
  breakTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  breakButton: {
    backgroundColor: '#ff9500',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  breakButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});
