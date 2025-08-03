import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  TextInput,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { Appointment, Patient, User } from '../types';
import { AppointmentService } from '../services/appointmentService';

interface AppointmentListScreenProps {
  patients: Patient[];
  user: User;
  onAppointmentPress: (appointment: Appointment) => void;
  onAddAppointment: (selectedPatient?: Patient) => void;
}

const AppointmentListScreen: React.FC<AppointmentListScreenProps> = ({
  patients,
  user,
  onAppointmentPress,
  onAddAppointment,
}) => {
  const isDarkMode = useColorScheme() === 'dark';
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [pendingAppointments, setPendingAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [currentTab, setCurrentTab] = useState<'scheduled' | 'pending'>('scheduled');
  const [processing, setProcessing] = useState<string | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  // Randevuları yükle
  const loadAppointments = async () => {
    try {
      setLoading(true);
      // Doktor için kendi randevularını getir
      const [scheduledApps, pendingApps] = await Promise.all([
        AppointmentService.getDoctorAppointments(user.id),
        AppointmentService.getPendingAppointments(user.id)
      ]);
      
      // Sadece scheduled, completed, cancelled, no-show durumlarını al
      const filteredScheduled = scheduledApps.filter(app => 
        ['scheduled', 'completed', 'cancelled', 'no-show'].includes(app.status)
      );
      
      setAppointments(filteredScheduled);
      setPendingAppointments(pendingApps);
    } catch (error) {
      console.error('Randevular yüklenemedi:', error);
      Alert.alert('Hata', 'Randevular yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (appointment: Appointment, notes?: string) => {
    try {
      setProcessing(appointment.id);
      await AppointmentService.approveAppointment(appointment.id, notes);
      Alert.alert('Başarılı', 'Randevu onaylandı');
      await loadAppointments(); // Listeleri yenile
    } catch (error: any) {
      console.error('Randevu onaylanamadı:', error);
      Alert.alert('Hata', 'Randevu onaylanırken bir hata oluştu');
    } finally {
      setProcessing(null);
      setShowApprovalModal(false);
      setApprovalNotes('');
      setSelectedAppointment(null);
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
      await loadAppointments(); // Listeleri yenile
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

  useEffect(() => {
    loadAppointments();
  }, []);

  // Sayfa her açıldığında randevuları yenile
  useEffect(() => {
    const interval = setInterval(() => {
      loadAppointments();
    }, 5000); // 5 saniyede bir yenile

    return () => clearInterval(interval);
  }, []);

  // Arama filtresi
  const currentAppointments = currentTab === 'scheduled' ? appointments : pendingAppointments;
  const filteredAppointments = currentAppointments.filter(appointment =>
    appointment.title.toLowerCase().includes(searchText.toLowerCase()) ||
    appointment.patientName.toLowerCase().includes(searchText.toLowerCase()) ||
    appointment.description?.toLowerCase().includes(searchText.toLowerCase())
  );

  // Randevu durumu
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending': return { text: 'Onay Bekliyor', color: '#ffc107', icon: '⏳' };
      case 'scheduled': return { text: 'Planlandı', color: '#007bff', icon: '📅' };
      case 'completed': return { text: 'Tamamlandı', color: '#28a745', icon: '✅' };
      case 'cancelled': return { text: 'İptal Edildi', color: '#dc3545', icon: '❌' };
      case 'rejected': return { text: 'Reddedildi', color: '#dc3545', icon: '❌' };
      case 'no-show': return { text: 'Gelmedi', color: '#6c757d', icon: '⚠️' };
      default: return { text: 'Bilinmeyen', color: '#6c757d', icon: '❓' };
    }
  };

  // Randevu tipi
  const getTypeInfo = (type: string) => {
    switch (type) {
      case 'consultation': return { text: 'Konsültasyon', icon: '👨‍⚕️' };
      case 'follow-up': return { text: 'Takip', icon: '🔄' };
      case 'check-up': return { text: 'Kontrol', icon: '🩺' };
      case 'emergency': return { text: 'Acil', icon: '🚨' };
      case 'other': return { text: 'Diğer', icon: '📋' };
      default: return { text: 'Bilinmeyen', icon: '❓' };
    }
  };

  // Tarih formatı
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Zaman formatı
  const formatTime = (timeString: string) => {
    return timeString;
  };

  // Randevuları tarih ve saate göre sırala
  const sortedAppointments = filteredAppointments.sort((a, b) => {
    const dateTimeA = new Date(`${a.date}T${a.time}`);
    const dateTimeB = new Date(`${b.date}T${b.time}`);
    return dateTimeB.getTime() - dateTimeA.getTime(); // En yeni önce
  });

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      <View style={styles.header}>
        <Text style={[styles.title, isDarkMode && styles.darkText]}>
          📅 Randevular
        </Text>
        <Text style={[styles.subtitle, isDarkMode && styles.darkSubtitle]}>
          {currentTab === 'scheduled' ? appointments.length : pendingAppointments.length} randevu
        </Text>
      </View>

      {/* Tab Buttons */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            currentTab === 'scheduled' && styles.activeTabButton,
            isDarkMode && styles.darkTabButton,
            currentTab === 'scheduled' && isDarkMode && styles.darkActiveTabButton,
          ]}
          onPress={() => setCurrentTab('scheduled')}
        >
          <Text style={[
            styles.tabButtonText,
            currentTab === 'scheduled' && styles.activeTabButtonText,
            isDarkMode && styles.darkTabButtonText,
          ]}>
            📅 Planlanmış ({appointments.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabButton,
            currentTab === 'pending' && styles.activeTabButton,
            isDarkMode && styles.darkTabButton,
            currentTab === 'pending' && isDarkMode && styles.darkActiveTabButton,
          ]}
          onPress={() => setCurrentTab('pending')}
        >
          <Text style={[
            styles.tabButtonText,
            currentTab === 'pending' && styles.activeTabButtonText,
            isDarkMode && styles.darkTabButtonText,
          ]}>
            ⏳ Bekleyen Onaylar ({pendingAppointments.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Arama Çubuğu */}
      <View style={styles.searchContainer}>
        <TextInput
          style={[styles.searchInput, isDarkMode && styles.darkInput]}
          placeholder="Randevu ara..."
          placeholderTextColor={isDarkMode ? '#999' : '#666'}
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={loadAppointments}
          disabled={loading}
        >
          <Text style={styles.refreshButtonText}>🔄 Yenile</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => onAddAppointment()}
        >
          <Text style={styles.addButtonText}>➕ Yeni Randevu Ekle</Text>
        </TouchableOpacity>
      </View>

      {/* Randevu Listesi */}
      <ScrollView style={styles.appointmentList}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007bff" />
            <Text style={[styles.loadingText, isDarkMode && styles.darkSubtitle]}>
              Randevular yükleniyor...
            </Text>
          </View>
        ) : sortedAppointments.map((appointment) => {
          const statusInfo = getStatusInfo(appointment.status);
          const typeInfo = getTypeInfo(appointment.type);
          
          return (
            <TouchableOpacity
              key={appointment.id}
              style={[styles.appointmentCard, isDarkMode && styles.darkCard]}
              onPress={() => onAppointmentPress(appointment)}
            >
              <View style={styles.appointmentHeader}>
                <View style={styles.appointmentTitleRow}>
                  <Text style={styles.typeIcon}>
                    {typeInfo.icon}
                  </Text>
                  <View style={styles.titleContainer}>
                    <Text style={[styles.appointmentTitle, isDarkMode && styles.darkText]}>
                      {appointment.title}
                    </Text>
                    <Text style={[styles.appointmentPatient, isDarkMode && styles.darkSubtitle]}>
                      {appointment.patientName}
                    </Text>
                  </View>
                </View>
                
                <View style={[styles.statusBadge, { backgroundColor: statusInfo.color }]}>
                  <Text style={styles.statusText}>
                    {statusInfo.icon} {statusInfo.text}
                  </Text>
                </View>
              </View>

              <View style={styles.appointmentInfo}>
                <View style={styles.dateTimeRow}>
                  <Text style={[styles.dateTimeText, isDarkMode && styles.darkSubtitle]}>
                    📅 {formatDate(appointment.date)}
                  </Text>
                  <Text style={[styles.dateTimeText, isDarkMode && styles.darkSubtitle]}>
                    ⏰ {formatTime(appointment.time)} ({appointment.duration} dk)
                  </Text>
                </View>
                
                <View style={styles.typeRow}>
                  <Text style={[styles.typeText, isDarkMode && styles.darkSubtitle]}>
                    {typeInfo.icon} {typeInfo.text}
                  </Text>
                </View>

                {appointment.description && (
                  <View style={styles.descriptionRow}>
                    <Text style={[styles.descriptionText, isDarkMode && styles.darkSubtitle]}>
                      📝 {appointment.description}
                    </Text>
                  </View>
                )}

                {appointment.notes && (
                  <View style={styles.notesRow}>
                    <Text style={[styles.notesText, isDarkMode && styles.darkSubtitle]}>
                      💭 {appointment.notes}
                    </Text>
                  </View>
                )}

                {appointment.rejectionReason && (
                  <View style={styles.notesRow}>
                    <Text style={[styles.rejectionText, isDarkMode && styles.darkSubtitle]}>
                      ❌ Red Sebebi: {appointment.rejectionReason}
                    </Text>
                  </View>
                )}
              </View>

              {/* Pending randevular için onay/red butonları */}
              {currentTab === 'pending' && (
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
              )}
            </TouchableOpacity>
          );
        })}

        {!loading && sortedAppointments.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, isDarkMode && styles.darkSubtitle]}>
              {appointments.length === 0 
                ? 'Henüz randevu kaydı yok. Yeni randevu ekleyebilirsiniz.'
                : 'Arama kriterlerinize uygun randevu bulunamadı.'
              }
            </Text>
          </View>
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
  },
  title: {
    fontSize: 28,
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
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  darkInput: {
    backgroundColor: '#2d2d2d',
    borderColor: '#444',
    color: '#ffffff',
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  refreshButton: {
    backgroundColor: '#6c757d',
    flex: 0.3,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  refreshButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#007bff',
    flex: 0.7,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  appointmentList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  appointmentCard: {
    backgroundColor: '#ffffff',
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
  appointmentTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  typeIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  appointmentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
  },
  appointmentPatient: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  appointmentInfo: {
    gap: 6,
  },
  dateTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  dateTimeText: {
    fontSize: 14,
    color: '#6c757d',
  },
  typeRow: {
    marginBottom: 4,
  },
  typeText: {
    fontSize: 14,
    color: '#6c757d',
  },
  descriptionRow: {
    marginBottom: 4,
  },
  descriptionText: {
    fontSize: 14,
    color: '#6c757d',
    fontStyle: 'italic',
  },
  notesRow: {
    marginTop: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  notesText: {
    fontSize: 12,
    color: '#6c757d',
    fontStyle: 'italic',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: '#6c757d',
    marginTop: 16,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  darkTabButton: {
    backgroundColor: 'transparent',
  },
  activeTabButton: {
    backgroundColor: '#007bff',
  },
  darkActiveTabButton: {
    backgroundColor: '#007bff',
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6c757d',
  },
  darkTabButtonText: {
    color: '#adb5bd',
  },
  activeTabButtonText: {
    color: '#fff',
  },
  appointmentActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  rejectButton: {
    flex: 1,
    backgroundColor: '#dc3545',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  rejectButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  approveButton: {
    flex: 1,
    backgroundColor: '#28a745',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  approveButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#999',
  },
  rejectionText: {
    fontSize: 12,
    color: '#dc3545',
    fontStyle: 'italic',
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

export default AppointmentListScreen;