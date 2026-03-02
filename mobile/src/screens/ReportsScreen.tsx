import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Alert, RefreshControl } from 'react-native';
import { useQuery, useMutation } from '@apollo/client';
import { GET_MY_REPORTS, CREATE_REPORT_MUTATION, SUBMIT_REPORT_MUTATION } from '../graphql/operations';

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
    if (!title || !content) {
      Alert.alert('Error', 'Please fill in all fields');
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
          title,
          content,
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
      Alert.alert('Error', error.message);
    }
  };

  const handleSubmitReport = async (reportId: string) => {
    try {
      await submitReport({ variables: { id: reportId } });
      refetch();
      Alert.alert('Success', 'Report submitted for review');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return '#34c759';
      case 'rejected': return '#ff3b30';
      case 'submitted': return '#007AFF';
      default: return '#ff9500';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Reports</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setShowModal(true)}>
          <Text style={styles.addButtonText}>+ New</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {loading ? (
          <Text style={styles.loadingText}>Loading...</Text>
        ) : reports.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📊</Text>
            <Text style={styles.emptyText}>No reports yet</Text>
            <Text style={styles.emptySubtext}>Tap "+ New" to create your first report</Text>
          </View>
        ) : (
          reports.map((report: any) => (
            <View key={report.id} style={styles.reportCard}>
              <View style={styles.reportHeader}>
                <Text style={styles.reportTitle}>{report.title}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(report.status) }]}>
                  <Text style={styles.statusText}>{report.status.toUpperCase()}</Text>
                </View>
              </View>
              <Text style={styles.reportType}>{report.reportType.charAt(0).toUpperCase() + report.reportType.slice(1)} Report</Text>
              <Text style={styles.reportContent} numberOfLines={2}>{report.content}</Text>
              <Text style={styles.reportDate}>
                {new Date(report.startDate).toLocaleDateString()} - {new Date(report.endDate).toLocaleDateString()}
              </Text>
              {report.reviewNotes && (
                <View style={styles.reviewNotes}>
                  <Text style={styles.reviewNotesLabel}>Review Notes:</Text>
                  <Text style={styles.reviewNotesText}>{report.reviewNotes}</Text>
                </View>
              )}
              {report.status === 'draft' && (
                <TouchableOpacity 
                  style={styles.submitButton}
                  onPress={() => handleSubmitReport(report.id)}
                >
                  <Text style={styles.submitButtonText}>Submit for Review</Text>
                </TouchableOpacity>
              )}
            </View>
          ))
        )}
      </ScrollView>

      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create Report</Text>
            
            <Text style={styles.label}>Report Type</Text>
            <View style={styles.typeSelector}>
              {['daily', 'weekly', 'monthly'].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[styles.typeButton, reportType === type && styles.typeButtonActive]}
                  onPress={() => setReportType(type)}
                >
                  <Text style={[styles.typeText, reportType === type && styles.typeTextActive]}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.input}
              placeholder="Title"
              value={title}
              onChangeText={setTitle}
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Content"
              value={content}
              onChangeText={setContent}
              multiline
              numberOfLines={6}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalCancelButton]} 
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.modalCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalSubmitButton]}
                onPress={handleCreateReport}
                disabled={creating}
              >
                <Text style={styles.modalSubmitButtonText}>
                  {creating ? 'Saving...' : 'Save as Draft'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  addButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  reportCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  reportType: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  reportContent: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  reportDate: {
    fontSize: 12,
    color: '#999',
  },
  reviewNotes: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#fff3cd',
    borderRadius: 8,
  },
  reviewNotesLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#856404',
  },
  reviewNotesText: {
    fontSize: 14,
    color: '#856404',
    marginTop: 4,
  },
  submitButton: {
    marginTop: 12,
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  typeSelector: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  typeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    marginHorizontal: 4,
  },
  typeButtonActive: {
    backgroundColor: '#007AFF',
  },
  typeText: {
    fontSize: 14,
    color: '#666',
  },
  typeTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 6,
  },
  modalCancelButton: {
    backgroundColor: '#f5f5f5',
  },
  modalSubmitButton: {
    backgroundColor: '#007AFF',
  },
  modalCancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  modalSubmitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
