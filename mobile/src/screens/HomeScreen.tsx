import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, SafeAreaView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@apollo/client';
import { useAuth } from '../auth/AuthContext';
import { GET_TODAY_ATTENDANCE, GET_MY_PLACEMENTS } from '../graphql/operations';
import { Card } from '../components/Card';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';
import { getClockInTime, getClockOutTime, formatTime, isActivePlacement, getStatusColor, getStatusLabel } from '../utils/helpers';

export const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useAuth();
  const { data: attendanceData, refetch: refetchAttendance, loading: attendanceLoading } = useQuery(GET_TODAY_ATTENDANCE);
  const { data: placementData, refetch: refetchPlacement, loading: placementLoading } = useQuery(GET_MY_PLACEMENTS);
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchAttendance(), refetchPlacement()]);
    setRefreshing(false);
  };

  const todayAttendance = attendanceData?.todayAttendance;
  const activePlacement = placementData?.myPlacements?.find((p: any) => isActivePlacement(p));
  const clockInTime = getClockInTime(todayAttendance);
  const clockOutTime = getClockOutTime(todayAttendance);

  const quickActions = [
    { name: 'Attendance', icon: 'time-outline', color: colors.primary, screen: 'Attendance' },
    { name: 'Activities', icon: 'document-text-outline', color: colors.success, screen: 'Activities' },
    { name: 'Reports', icon: 'bar-chart-outline', color: colors.info, screen: 'Reports' },
    { name: 'Profile', icon: 'person-outline', color: colors.warning, screen: 'Profile' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello, {user?.firstName || 'Student'}!</Text>
            <Text style={styles.date}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.firstName?.charAt(0) || '?'}{user?.lastName?.charAt(0) || ''}</Text>
          </View>
        </View>

        {activePlacement ? (
          <Card style={styles.placementCard}>
            <View style={styles.cardHeader}>
              <Ionicons name="business-outline" size={20} color={colors.primary} />
              <Text style={styles.cardTitle}>Current Placement</Text>
            </View>
            <Text style={styles.placeName}>{activePlacement.internshipPlace?.name || 'Not Assigned'}</Text>
            <View style={styles.placeInfo}>
              <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
              <Text style={styles.placeAddress}>{activePlacement.internshipPlace?.address || '-'}</Text>
            </View>
            <View style={styles.dateRange}>
              <Text style={styles.dateRangeText}>
                {new Date(activePlacement.startDate).toLocaleDateString()} - {new Date(activePlacement.endDate).toLocaleDateString()}
              </Text>
            </View>
          </Card>
        ) : (
          <Card style={styles.noPlacementCard}>
            <Ionicons name="alert-circle-outline" size={40} color={colors.warning} />
            <Text style={styles.noPlacementText}>No active placement</Text>
            <Text style={styles.noPlacementSubtext}>Contact your school administrator</Text>
          </Card>
        )}

        <Card style={styles.attendanceCard}>
          <View style={styles.cardHeader}>
            <Ionicons name="calendar-outline" size={20} color={colors.primary} />
            <Text style={styles.cardTitle}>Today's Attendance</Text>
            {todayAttendance && (
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(todayAttendance.status) + '20' }]}>
                <Text style={[styles.statusBadgeText, { color: getStatusColor(todayAttendance.status) }]}>
                  {getStatusLabel(todayAttendance.status)}
                </Text>
              </View>
            )}
          </View>
          
          {todayAttendance ? (
            <View style={styles.attendanceInfo}>
              <View style={styles.attendanceRow}>
                <View style={styles.attendanceItem}>
                  <Text style={styles.attendanceLabel}>Check In</Text>
                  <Text style={styles.attendanceValue}>{clockInTime ? formatTime(clockInTime) : '-'}</Text>
                </View>
                <View style={styles.attendanceDivider} />
              <View style={styles.attendanceItem}>
                <Text style={styles.attendanceLabel}>Check Out</Text>
                <Text style={styles.attendanceValue}>{clockOutTime ? formatTime(clockOutTime) : '-'}</Text>
              </View>
                <View style={styles.attendanceDivider} />
                <View style={styles.attendanceItem}>
                  <Text style={styles.attendanceLabel}>Hours</Text>
                  <Text style={styles.attendanceValue}>{todayAttendance.actualHours ? `${todayAttendance.actualHours}h` : '-'}</Text>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.noAttendanceContainer}>
              <Ionicons name="time-outline" size={32} color={colors.textTertiary} />
              <Text style={styles.noAttendanceText}>Not clocked in yet</Text>
              <TouchableOpacity style={styles.clockInButton} onPress={() => navigation.navigate('Attendance')}>
                <Text style={styles.clockInButtonText}>Clock In Now</Text>
              </TouchableOpacity>
            </View>
          )}
        </Card>

        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {quickActions.map((action, index) => (
              <TouchableOpacity 
                key={index}
                style={styles.actionCard}
                onPress={() => navigation.navigate(action.screen)}
                activeOpacity={0.7}
              >
                <View style={[styles.actionIconContainer, { backgroundColor: action.color + '15' }]}>
                  <Ionicons name={action.icon as any} size={24} color={action.color} />
                </View>
                <Text style={styles.actionName}>{action.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl + spacing.md,
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    ...typography.h2,
    color: colors.textInverse,
  },
  date: {
    ...typography.caption,
    color: colors.textInverse,
    opacity: 0.8,
    marginTop: spacing.xs,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    ...typography.bodyBold,
    color: colors.textInverse,
  },
  placementCard: {
    marginHorizontal: spacing.md,
    marginTop: -spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  cardTitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  placeName: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  placeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  placeAddress: {
    ...typography.caption,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  dateRange: {
    marginTop: spacing.xs,
  },
  dateRangeText: {
    ...typography.small,
    color: colors.textTertiary,
  },
  noPlacementCard: {
    marginHorizontal: spacing.md,
    marginTop: -spacing.lg,
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  noPlacementText: {
    ...typography.bodyBold,
    color: colors.text,
    marginTop: spacing.sm,
  },
  noPlacementSubtext: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  attendanceCard: {
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
  },
  statusBadge: {
    marginLeft: 'auto',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  statusBadgeText: {
    ...typography.small,
    fontWeight: '600',
  },
  attendanceInfo: {
    marginTop: spacing.sm,
  },
  attendanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  attendanceItem: {
    flex: 1,
    alignItems: 'center',
  },
  attendanceDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.border,
  },
  attendanceLabel: {
    ...typography.small,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  attendanceValue: {
    ...typography.bodyBold,
    color: colors.text,
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
  clockInButton: {
    marginTop: spacing.md,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  clockInButtonText: {
    ...typography.caption,
    color: colors.textInverse,
    fontWeight: '600',
  },
  quickActionsSection: {
    paddingHorizontal: spacing.md,
    marginTop: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    alignItems: 'center',
    ...shadows.small,
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  actionName: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '500',
  },
});
