import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Alert, RefreshControl, SafeAreaView, StatusBar, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation } from '@apollo/client';
import { GET_MY_REPORTS, CREATE_REPORT_MUTATION, SUBMIT_REPORT_MUTATION } from '../graphql/operations';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { colors, spacing, typography, borderRadius } from '../theme';
import { getStatusColor, getStatusLabel, formatShortDate } from '../utils/helpers';

export const ReportsScreen: React.FC = () => {
  const { data, loading, refetch } = useQuery(GET_MY_REPORTS);
  const [createReport, { loading: creating }] = useMutation(CREATE_REPORT_MUTATION);
  const [submitReport] = useMutation(SUBMIT_REPORT_MUTATION);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [reportType, setReportType] = useState('daily');
  const [refreshing, setRefreshing] = useState(false);

  const reports = data?.myReports || [];

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleCreateReport = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }
    if (!content.trim()) {
      Alert.alert('Error', 'Please enter content');
      return;
    }

    const today = new Date();
    const startDate = new Date(today);
    const endDate = new Date(today);

    if (reportType === 'weekly') {
      startDate.setDate(today.getDate() - 7);
    } else if (reportType === 'monthly') {
      startDate.setMonth(today.getMonth() - 1);
    }

    try {
      await createReport({
        variables: {
          title: title.trim(),
          content: content.trim(),
          reportType,
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
        },
      });
      setShowModal(false);
      setTitle('');
      setContent('');
      setReportType('daily');
      refetch();
      Alert.alert('Success', 'Report created as draft');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create report');
    }
  };

  const handleSubmitReport = async (reportId: string) => {
    try {
      await submitReport({ variables: { id: reportId } });
      refetch();
      Alert.alert('Success', 'Report submitted for review');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to submit report');
    }
  };

  const reportTypes = [
    { key: 'daily', label: 'Daily' },
    { key: 'weekly', label: 'Weekly' },
    { key: 'monthly', label: 'Monthly' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <View style={styles.header}>
        <Text style={styles.title}>Reports</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setShowModal(true)}>
          <Ionicons name="add" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
        showsVerticalScrollIndicator={false}
      >
        {loading && !refreshing ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Loading...</Text>
          </View>
        ) : reports.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Ionicons name="bar-chart-outline" size={48} color={colors.textTertiary} />
            <Text style={styles.emptyTitle}>No reports yet</Text>
            <Text style={styles.emptySubtitle}>Tap the + button to create your first report</Text>
          </Card>
        ) : (
          reports.map((report: any) => (
            <Card key={report.id} style={styles.reportCard}>
              <View style={styles.reportHeader}>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(report.status) + '20' }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(report.status) }]}>
                    {getStatusLabel(report.status)}
                  </Text>
                </View>
                <Text style={styles.reportType}>{report.reportType.toUpperCase()}</Text>
              </View>
              
              <Text style={styles.reportTitle}>{report.title}</Text>
              <Text style={styles.reportContent} numberOfLines={2}>{report.content}</Text>
              
              <View style={styles.reportFooter}>
                <View style={styles.reportDate}>
                  <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
                  <Text style={styles.reportDateText}>
                    {formatShortDate(report.startDate)} - {formatShortDate(report.endDate)}
                  </Text>
                </View>
              </View>

              {report.reviewNotes && (
                <View style={styles.reviewNotes}>
                  <Ionicons name="chatbubble-outline" size={14} color={colors.warning} />
                  <Text style={styles.reviewNotesText}>{report.reviewNotes}</Text>
                </View>
              )}

              {report.status === 'DRAFT' && (
                <Button
                  title="Submit for Review"
                  onPress={() => handleSubmitReport(report.id)}
                  variant="primary"
                  size="small"
                  style={styles.submitButton}
                />
              )}
            </Card>
          ))
        )}
      </ScrollView>

      <Modal visible={showModal} animationType="slide" transparent>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Report</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Report Type</Text>
            <View style={styles.typeSelector}>
              {reportTypes.map((type) => (
                <TouchableOpacity
                  key={type.key}
                  style={[
                    styles.typeButton,
                    reportType === type.key && styles.typeButtonActive
                  ]}
                  onPress={() => setReportType(type.key)}
                >
                  <Text style={[
                    styles.typeText,
                    reportType === type.key && styles.typeTextActive
                  ]}>
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Title</Text>
            <TextInput
              style={styles.input}
              placeholder="Report title"
              value={title}
              onChangeText={setTitle}
              placeholderTextColor={colors.textTertiary}
            />
            
            <Text style={styles.inputLabel}>Content</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe your work..."
              value={content}
              onChangeText={setContent}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              placeholderTextColor={colors.textTertiary}
            />

            <View style={styles.modalFooter}>
              <Button
                title="Cancel"
                onPress={() => setShowModal(false)}
                variant="secondary"
                style={styles.modalButton}
              />
              <Button
                title={creating ? 'Saving...' : 'Save as Draft'}
                onPress={handleCreateReport}
                loading={creating}
                style={styles.modalButton}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    ...typography.h1,
    color: colors.textInverse,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl * 2,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.text,
    marginTop: spacing.md,
  },
  emptySubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  reportCard: {
    marginBottom: spacing.md,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  statusText: {
    ...typography.small,
    fontWeight: '600',
  },
  reportType: {
    ...typography.small,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  reportTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  reportContent: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  reportFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reportDate: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reportDateText: {
    ...typography.small,
    color: colors.textTertiary,
    marginLeft: spacing.xs,
  },
  reviewNotes: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.warning + '15',
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    marginTop: spacing.sm,
  },
  reviewNotesText: {
    ...typography.caption,
    color: colors.warning,
    marginLeft: spacing.xs,
    flex: 1,
  },
  submitButton: {
    marginTop: spacing.md,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalTitle: {
    ...typography.h2,
    color: colors.text,
  },
  inputLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  typeSelector: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  typeButton: {
    flex: 1,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  typeButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  typeText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  typeTextActive: {
    color: colors.textInverse,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  textArea: {
    height: 150,
    textAlignVertical: 'top',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  modalButton: {
    flex: 1,
  },
});
