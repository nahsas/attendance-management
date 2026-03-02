import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ScrollView, SafeAreaView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation } from '@apollo/client';
import * as Location from 'expo-location';
import { GET_TODAY_ATTENDANCE, GET_MY_PLACEMENTS, CLOCK_IN_MUTATION, CLOCK_OUT_MUTATION, LOG_BREAK_MUTATION, END_BREAK_MUTATION } from '../graphql/operations';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';
import { getClockInTime, getClockOutTime, formatTime, isActivePlacement, getStatusColor, getStatusLabel } from '../utils/helpers';

export const AttendanceScreen: React.FC = () => {
  const { data: attendanceData, refetch: refetchAttendance, loading: attendanceLoading } = useQuery(GET_TODAY_ATTENDANCE);
  const { data: placementData, loading: placementLoading } = useQuery(GET_MY_PLACEMENTS);
  const [clockInMutation, { loading: clockingIn }] = useMutation(CLOCK_IN_MUTATION);
  const [clockOutMutation, { loading: clockingOut }] = useMutation(CLOCK_OUT_MUTATION);
  const [logBreakMutation] = useMutation(LOG_BREAK_MUTATION);
  const [endBreakMutation] = useMutation(END_BREAK_MUTATION);
  
  const [location, setLocation] = useState<any>(null);
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [currentBreakId, setCurrentBreakId] = useState<string | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);

  const todayAttendance = attendanceData?.todayAttendance;
  const activePlacement = placementData?.myPlacements?.find((p: any) => isActivePlacement(p));
  const breakConfig = activePlacement?.internshipPlace?.breakConfig;
  
  const clockInTime = getClockInTime(todayAttendance);
  const clockOutTime = getClockOutTime(todayAttendance);
  
  const activeBreaks = todayAttendance?.breakLogs?.filter((b: any) => !b.endTime) || [];
  const hasActiveBreak = activeBreaks.length > 0;

  useEffect(() => {
    getLocation();
  }, []);

  useEffect(() => {
    if (hasActiveBreak && activeBreaks[0]) {
      setIsOnBreak(true);
      setCurrentBreakId(activeBreaks[0].id);
    } else {
      setIsOnBreak(false);
      setCurrentBreakId(null);
    }
  }, [hasActiveBreak, activeBreaks]);

  const getLocation = async () => {
    setLoadingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Location permission is needed for attendance. Please enable it in Settings.');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);
    } catch (error) {
      console.error('Location error:', error);
      Alert.alert('Error', 'Could not get your location. Please try again.');
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

    const placeLat = parseFloat(activePlacement.internshipPlace.latitude);
    const placeLon = parseFloat(activePlacement.internshipPlace.longitude);
    const distance = calculateDistance(location.latitude, location.longitude, placeLat, placeLon);

    if (distance > 500) {
      Alert.alert('Too Far', `You must be within 500m of your internship place. Current distance: ${Math.round(distance)}m`);
      return;
    }

    try {
      await clockInMutation({
        variables: {
          studentPlacementId: activePlacement.id,
          latitude: location.latitude,
          longitude: location.longitude,
        },
      });
      refetchAttendance();
      Alert.alert('Success', 'Clocked in successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to clock in');
    }
  };

  const handleClockOut = async () => {
    if (!location || !todayAttendance) return;

    try {
      await clockOutMutation({
        variables: {
          sessionId: todayAttendance.id,
          latitude: location.latitude,
          longitude: location.longitude,
        },
      });
      refetchAttendance();
      Alert.alert('Success', 'Clocked out successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to clock out');
    }
  };

  const handleLogBreak = async (breakNumber: number) => {
    if (!todayAttendance) return;
    try {
      const result = await logBreakMutation({
        variables: {
          sessionId: todayAttendance.id,
          breakNumber,
        },
      });
      setIsOnBreak(true);
      setCurrentBreakId(result.data.logBreak.breakLog.id);
      refetchAttendance();
      Alert.alert('Success', `Break ${breakNumber} started`);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to start break');
    }
  };

  const handleEndBreak = async () => {
    if (!currentBreakId) return;
    try {
      await endBreakMutation({ variables: { breakLogId: currentBreakId } });
      setIsOnBreak(false);
      setCurrentBreakId(null);
      refetchAttendance();
      Alert.alert('Success', 'Break ended');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to end break');
    }
  };

  const isLoading = attendanceLoading || placementLoading;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <View style={styles.header}>
        <Text style={styles.title}>Attendance</Text>
        <Text style={styles.subtitle}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activePlacement ? (
          <Card style={styles.placeCard}>
            <View style={styles.placeHeader}>
              <Ionicons name="business" size={24} color={colors.primary} />
              <View style={styles.placeInfo}>
                <Text style={styles.placeName}>{activePlacement.internshipPlace?.name}</Text>
                <Text style={styles.placeAddress}>{activePlacement.internshipPlace?.address}</Text>
              </View>
            </View>
          </Card>
        ) : (
          <Card style={styles.noPlacementCard}>
            <Ionicons name="alert-circle" size={40} color={colors.warning} />
            <Text style={styles.noPlacementText}>No active placement</Text>
          </Card>
        )}

        <Card style={styles.locationCard}>
          <View style={styles.locationHeader}>
            <Ionicons name="location" size={20} color={colors.primary} />
            <Text style={styles.locationTitle}>Location</Text>
          </View>
          
          {loadingLocation ? (
            <View style={styles.locationLoading}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.locationLoadingText}>Getting your location...</Text>
            </View>
          ) : location ? (
            <View style={styles.locationEnabled}>
              <Ionicons name="checkmark-circle" size={20} color={colors.success} />
              <Text style={styles.locationEnabledText}>Location enabled</Text>
              <TouchableOpacity onPress={getLocation} style={styles.refreshLocation}>
                <Ionicons name="refresh" size={16} color={colors.primary} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.locationButton} onPress={getLocation}>
              <Ionicons name="location-outline" size={20} color={colors.primary} />
              <Text style={styles.locationButtonText}>Enable Location</Text>
            </TouchableOpacity>
          )}
        </Card>

        <Card style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Ionicons name="time" size={20} color={colors.primary} />
            <Text style={styles.statusTitle}>Today's Status</Text>
          </View>
          
          {todayAttendance ? (
            <View style={styles.statusContent}>
              <View style={styles.statusMain}>
                <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(todayAttendance.status) }]} />
                <Text style={[styles.statusText, { color: getStatusColor(todayAttendance.status) }]}>
                  {getStatusLabel(todayAttendance.status)}
                </Text>
              </View>
              
              <View style={styles.timeRow}>
                <View style={styles.timeItem}>
                  <Text style={styles.timeLabel}>Check In</Text>
                  <Text style={styles.timeValue}>{clockInTime ? formatTime(clockInTime) : '-'}</Text>
                </View>
                <View style={styles.timeDivider} />
                <View style={styles.timeItem}>
                  <Text style={styles.timeLabel}>Check Out</Text>
                  <Text style={styles.timeValue}>{clockOutTime ? formatTime(clockOutTime) : '-'}</Text>
                </View>
                <View style={styles.timeDivider} />
                <View style={styles.timeItem}>
                  <Text style={styles.timeLabel}>Hours</Text>
                  <Text style={styles.timeValue}>{todayAttendance.actualHours ? `${todayAttendance.actualHours}h` : '-'}</Text>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.noAttendanceContainer}>
              <Ionicons name="time-outline" size={32} color={colors.textTertiary} />
              <Text style={styles.noAttendanceText}>Not clocked in</Text>
            </View>
          )}
        </Card>

        <View style={styles.actions}>
          {!todayAttendance ? (
            <Button
              title="Clock In"
              onPress={handleClockIn}
              variant="success"
              size="large"
              loading={clockingIn}
              disabled={!location || !activePlacement}
              style={styles.mainButton}
            />
          ) : clockOutTime ? (
            <View style={styles.completedContainer}>
              <Ionicons name="checkmark-circle" size={40} color={colors.success} />
              <Text style={styles.completedText}>Attendance completed</Text>
              <Text style={styles.completedSubtext}>See you tomorrow!</Text>
            </View>
          ) : (
            <>
              <Button
                title="Clock Out"
                onPress={handleClockOut}
                variant="danger"
                size="large"
                loading={clockingOut}
                disabled={!location}
                style={styles.mainButton}
              />

              {breakConfig && (
                <Card style={styles.breakCard}>
                  <View style={styles.breakHeader}>
                    <Ionicons name="cafe-outline" size={20} color={colors.warning} />
                    <Text style={styles.breakTitle}>Breaks</Text>
                  </View>
                  
                  <View style={styles.breakButtons}>
                    {hasActiveBreak ? (
                      <Button
                        title="End Break"
                        onPress={handleEndBreak}
                        variant="warning"
                        style={styles.breakButton}
                      />
                    ) : (
                      <>
                        {breakConfig.breakCount >= 1 && (
                          <Button
                            title="Start Break 1"
                            onPress={() => handleLogBreak(1)}
                            variant="warning"
                            style={styles.breakButton}
                          />
                        )}
                        {breakConfig.breakCount >= 2 && (
                          <Button
                            title="Start Break 2"
                            onPress={() => handleLogBreak(2)}
                            variant="warning"
                            style={styles.breakButton}
                          />
                        )}
                      </>
                    )}
                  </View>
                </Card>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
  },
  title: {
    ...typography.h1,
    color: colors.textInverse,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textInverse,
    opacity: 0.8,
    marginTop: spacing.xs,
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  placeCard: {
    marginBottom: spacing.md,
  },
  placeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  placeInfo: {
    marginLeft: spacing.md,
    flex: 1,
  },
  placeName: {
    ...typography.h3,
    color: colors.text,
  },
  placeAddress: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  noPlacementCard: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  noPlacementText: {
    ...typography.bodyBold,
    color: colors.text,
    marginTop: spacing.sm,
  },
  locationCard: {
    marginBottom: spacing.md,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  locationTitle: {
    ...typography.bodyBold,
    color: colors.text,
    marginLeft: spacing.sm,
  },
  locationLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
  },
  locationLoadingText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary + '15',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  locationButtonText: {
    ...typography.bodyBold,
    color: colors.primary,
    marginLeft: spacing.sm,
  },
  locationEnabled: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
  },
  locationEnabledText: {
    ...typography.body,
    color: colors.success,
    marginLeft: spacing.xs,
    marginRight: spacing.md,
  },
  refreshLocation: {
    padding: spacing.xs,
  },
  statusCard: {
    marginBottom: spacing.md,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  statusTitle: {
    ...typography.bodyBold,
    color: colors.text,
    marginLeft: spacing.sm,
  },
  statusContent: {
    alignItems: 'center',
  },
  statusMain: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.sm,
  },
  statusText: {
    ...typography.h3,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  timeItem: {
    alignItems: 'center',
    flex: 1,
  },
  timeLabel: {
    ...typography.small,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  timeValue: {
    ...typography.bodyBold,
    color: colors.text,
  },
  timeDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
  },
  noAttendanceContainer: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  noAttendanceText: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: spacing.sm,
  },
  actions: {
    marginTop: spacing.sm,
  },
  mainButton: {
    marginBottom: spacing.md,
  },
  completedContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    backgroundColor: colors.success + '15',
    borderRadius: borderRadius.md,
  },
  completedText: {
    ...typography.h3,
    color: colors.success,
    marginTop: spacing.sm,
  },
  completedSubtext: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  breakCard: {
    marginTop: spacing.sm,
  },
  breakHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  breakTitle: {
    ...typography.bodyBold,
    color: colors.text,
    marginLeft: spacing.sm,
  },
  breakButtons: {
    gap: spacing.sm,
  },
  breakButton: {
    marginBottom: spacing.xs,
  },
});
