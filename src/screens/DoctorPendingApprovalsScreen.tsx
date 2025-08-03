import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  useColorScheme,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { User, Appointment } from '../types';
import { AppointmentService } from '../services/appointmentService';

interface DoctorPendingApprovalsScreenProps {
  user: User;
}

const DoctorPendingApprovalsScreen: React.FC<DoctorPendingApprovalsScreenProps> = ({ user }) => {
  const isDarkMode = useColorScheme() === 'dark';
  const [pendingAppointments, setPendingAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [approvalNotes, setApprovalNotes] = useState('');
  const [showApprovalModal, setShowApprovalModal] = useState(false);

  useEffect(() => {
    loadPendingAppointments();
  }, []);

  const loadPendingAppointments = async () => {
    try {
      setLoading(true);
      const pending = await AppointmentService.getPendingAppointments(user.id);
      setPendingAppointments(pending);
    } catch (error: any) {
      console.error('Bekleyen randevular yüklenemedi:', error);
      Alert.alert('Hata', 'Bekleyen randevular yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (appointment: Appointment, notes?: string) => {
    try {
      setProcessing(appointment.id);
      await AppointmentService.approveAppointment(appointment.id, notes);
      Alert.alert('Başarılı', 'Randevu onaylandı');
      await loadPendingAppointments();
    } catch (error: any) {
      console.error('Randevu onaylanamadı:', error);
      Alert.alert('Hata', 'Randevu onaylanırken bir hata oluştu');
    } finally {
      setProcessing(null);
      setShowApprovalModal(false);
      setApprovalNotes('');
    }
  };

  const handleReject = async (appointment: Appointment, reason: string) => {
    if (!reason.trim()) {
      Alert.alert('Hata', 'Red sebebi belirtmelisiniz');
      return;
    }

    try {
      setProcessing(appointment.id);
      await AppointmentService.rejectAppointment(appointment.id, reason);
      Alert.alert('Başarılı', 'Randevu reddedildi');
      await loadPendingAppointments();
    } catch (error: any) {
      console.error('Randevu reddedilemedi:', error);
      Alert.alert('Hata', 'Randevu reddedilirken bir hata oluştu');
    } finally {
      setProcessing(null);
      setShowRejectModal(false);
      setRejectionReason('');
      setSelectedAppointment(null);
    }
  };

  const openApprovalModal = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowApprovalModal(true);
  };

  const openRejectModal = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowRejectModal(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'consultation': return '💬';
      case 'follow-up': return '🔄';
      case 'check-up': return '✅';
      case 'emergency': return '🚨';
      default: return '📅';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'consultation': return 'Konsültasyon';
      case 'follow-up': return 'Takip';
      case 'check-up': return 'Kontrol';
      case 'emergency': return 'Acil';
      default: return 'Diğer';
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, isDarkMode && styles.darkContainer]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={[styles.loadingText, isDarkMode && styles.darkSubtitle]}>
            Bekleyen randevular yükleniyor...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      <View style={styles.header}>
        <Text style={[styles.title, isDarkMode && styles.darkText]}>
          ⏳ Bekleyen Onaylar
        </Text>
        <Text style={[styles.subtitle, isDarkMode && styles.darkSubtitle]}>
          {pendingAppointments.length} randevu onay bekliyor
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {pendingAppointments.length === 0 ? (
          <View style={[styles.emptyContainer, isDarkMode && styles.darkSection]}>
            <Text style={styles.emptyIcon}>✅</Text>
            <Text style={[styles.emptyTitle, isDarkMode && styles.darkText]}>
              Onay bekleyen randevu yok
            </Text>
            <Text style={[styles.emptyText, isDarkMode && styles.darkSubtitle]}>
              Hastalarınız tarafından randevu talebi yapıldığında burada görünecektir.
            </Text>
            <TouchableOpacity 
              style={styles.refreshButton}
              onPress={loadPendingAppointments}
            >
              <Text style={styles.refreshButtonText}>
                🔄 Yenile
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          pendingAppointments.map((appointment) => (
            <View 
              key={appointment.id}
              style={[styles.appointmentCard, isDarkMode && styles.darkCard]}
            >
              <View style={styles.appointmentHeader}>
                <View style={styles.appointmentTypeContainer}>
                  <Text style={styles.typeIcon}>
                    {getTypeIcon(appointment.type)}
                  </Text>
                  <Text style={[styles.appointmentTitle, isDarkMode && styles.darkText]}>
                    {appointment.title}
                  </Text>
                </View>
                
                <View style={styles.pendingBadge}>
                  <Text style={styles.pendingText}>
                    Onay Bekliyor
                  </Text>
                </View>
              </View>

              <View style={styles.appointmentInfo}>
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, isDarkMode && styles.darkSubtitle]}>
                    👤 Hasta:
                  </Text>
                  <Text style={[styles.infoValue, isDarkMode && styles.darkText]}>
                    {appointment.patientName}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, isDarkMode && styles.darkSubtitle]}>
                    📧 Email:
                  </Text>
                  <Text style={[styles.infoValue, isDarkMode && styles.darkText]}>
                    {appointment.patientEmail}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, isDarkMode && styles.darkSubtitle]}>
                    📅 Tarih:
                  </Text>
                  <Text style={[styles.infoValue, isDarkMode && styles.darkText]}>
                    {formatDate(appointment.date)}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, isDarkMode && styles.darkSubtitle]}>
                    🕐 Saat:
                  </Text>
                  <Text style={[styles.infoValue, isDarkMode && styles.darkText]}>
                    {appointment.time} ({appointment.duration} dakika)
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, isDarkMode && styles.darkSubtitle]}>
                    🏷️ Tür:
                  </Text>
                  <Text style={[styles.infoValue, isDarkMode && styles.darkText]}>
                    {getTypeText(appointment.type)}
                  </Text>
                </View>

                {appointment.description && (
                  <View style={styles.infoRow}>
                    <Text style={[styles.infoLabel, isDarkMode && styles.darkSubtitle]}>
                      📝 Açıklama:
                    </Text>
                    <Text style={[styles.infoValue, isDarkMode && styles.darkText]}>
                      {appointment.description}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.appointmentActions}>
                <TouchableOpacity
                  style={[styles.rejectButton, processing === appointment.id && styles.disabledButton]}
                  onPress={() => openRejectModal(appointment)}
                  disabled={processing === appointment.id}
                >
                  <Text style={styles.rejectButtonText}>
                    {processing === appointment.id ? '...' : '❌ Reddet'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.approveButton, processing === appointment.id && styles.disabledButton]}
                  onPress={() => openApprovalModal(appointment)}
                  disabled={processing === appointment.id}
                >
                  <Text style={styles.approveButtonText}>
                    {processing === appointment.id ? '...' : '✅ Onayla'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.appointmentFooter}>
                <Text style={[styles.footerText, isDarkMode && styles.darkSubtitle]}>
                  Talep Tarihi: {new Date(appointment.createdAt).toLocaleDateString('tr-TR')}
                </Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Approval Modal */}
      <Modal
        visible={showApprovalModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowApprovalModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, isDarkMode && styles.darkModalContent]}>
            <Text style={[styles.modalTitle, isDarkMode && styles.darkText]}>
              Randevuyu Onayla
            </Text>
            
            {selectedAppointment && (
              <Text style={[styles.modalSubtitle, isDarkMode && styles.darkSubtitle]}>
                {selectedAppointment.patientName} - {selectedAppointment.title}
              </Text>
            )}

            <Text style={[styles.modalLabel, isDarkMode && styles.darkText]}>
              Notlar (Opsiyonel):
            </Text>
            <TextInput
              style={[styles.modalInput, isDarkMode && styles.darkModalInput]}
              value={approvalNotes}
              onChangeText={setApprovalNotes}
              placeholder="Randevu hakkında notlarınız..."
              placeholderTextColor={isDarkMode ? '#999' : '#666'}
              multiline
              numberOfLines={4}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => {
                  setShowApprovalModal(false);
                  setApprovalNotes('');
                }}
              >
                <Text style={styles.modalCancelButtonText}>İptal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalApproveButton}
                onPress={() => selectedAppointment && handleApprove(selectedAppointment, approvalNotes)}
              >
                <Text style={styles.modalApproveButtonText}>Onayla</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Rejection Modal */}
      <Modal
        visible={showRejectModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowRejectModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, isDarkMode && styles.darkModalContent]}>
            <Text style={[styles.modalTitle, isDarkMode && styles.darkText]}>
              Randevuyu Reddet
            </Text>
            
            {selectedAppointment && (
              <Text style={[styles.modalSubtitle, isDarkMode && styles.darkSubtitle]}>
                {selectedAppointment.patientName} - {selectedAppointment.title}
              </Text>
            )}

            <Text style={[styles.modalLabel, isDarkMode && styles.darkText]}>
              Red Sebebi *:
            </Text>
            <TextInput
              style={[styles.modalInput, isDarkMode && styles.darkModalInput]}
              value={rejectionReason}
              onChangeText={setRejectionReason}
              placeholder="Randevuyu neden reddediyorsunuz?"
              placeholderTextColor={isDarkMode ? '#999' : '#666'}
              multiline
              numberOfLines={4}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => {
                  setShowRejectModal(false);
                  setRejectionReason('');
                  setSelectedAppointment(null);
                }}
              >
                <Text style={styles.modalCancelButtonText}>İptal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalRejectButton}
                onPress={() => selectedAppointment && handleReject(selectedAppointment, rejectionReason)}
              >
                <Text style={styles.modalRejectButtonText}>Reddet</Text>
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
    backgroundColor: '#f8f9fa',
  },
  darkContainer: {
    backgroundColor: '#1a1a1a',
  },
  header: {
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6c757d',
  },
  darkText: {
    color: '#ffffff',
  },
  darkSubtitle: {
    color: '#adb5bd',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#6c757d',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    marginTop: 20,
  },
  darkSection: {
    backgroundColor: '#2d2d2d',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  refreshButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  appointmentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  darkCard: {
    backgroundColor: '#2d2d2d',
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  appointmentTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  typeIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  appointmentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
    flex: 1,
  },
  pendingBadge: {
    backgroundColor: '#ffc107',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pendingText: {
    color: '#000',
    fontSize: 12,
    fontWeight: 'bold',
  },
  appointmentInfo: {
    gap: 8,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoLabel: {
    fontSize: 14,
    color: '#6c757d',
    fontWeight: '500',
    minWidth: 100,
  },
  infoValue: {
    fontSize: 14,
    color: '#212529',
    flex: 1,
  },
  appointmentActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  rejectButton: {
    flex: 1,
    backgroundColor: '#dc3545',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  rejectButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  approveButton: {
    flex: 1,
    backgroundColor: '#28a745',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  approveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#999',
  },
  appointmentFooter: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  footerText: {
    fontSize: 12,
    color: '#6c757d',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    margin: 20,
    minWidth: 300,
  },
  darkModalContent: {
    backgroundColor: '#2d2d2d',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#6c757d',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#212529',
    marginBottom: 8,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#212529',
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  darkModalInput: {
    backgroundColor: '#444',
    borderColor: '#666',
    color: '#ffffff',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: '#6c757d',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalApproveButton: {
    flex: 1,
    backgroundColor: '#28a745',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalApproveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalRejectButton: {
    flex: 1,
    backgroundColor: '#dc3545',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalRejectButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default DoctorPendingApprovalsScreen;