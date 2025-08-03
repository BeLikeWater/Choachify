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
import { commonStyles } from '../styles/commonStyles';

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
    <View style={[commonStyles.container, isDarkMode && commonStyles.darkContainer]}>
      <View style={commonStyles.header}>
        <Text style={[commonStyles.titleLarge, isDarkMode && commonStyles.darkText]}>
          📅 Randevular
        </Text>
        <Text style={[commonStyles.subtitle, isDarkMode && commonStyles.darkSubtitle]}>
          {currentTab === 'scheduled' ? appointments.length : pendingAppointments.length} randevu
        </Text>
      </View>

      {/* Tab Buttons */}
      <View style={commonStyles.tabContainer}>
        <TouchableOpacity
          style={[
            commonStyles.tabButton,
            currentTab === 'scheduled' && commonStyles.tabButtonActive,
          ]}
          onPress={() => setCurrentTab('scheduled')}
        >
          <Text style={[
            commonStyles.tabButtonText,
            currentTab === 'scheduled' && commonStyles.tabButtonTextActive,
          ]}>
            📅 Planlanmış ({appointments.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            commonStyles.tabButton,
            currentTab === 'pending' && commonStyles.tabButtonActive,
          ]}
          onPress={() => setCurrentTab('pending')}
        >
          <Text style={[
            commonStyles.tabButtonText,
            currentTab === 'pending' && commonStyles.tabButtonTextActive,
          ]}>
            ⏳ Bekleyen Onaylar ({pendingAppointments.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Arama Çubuğu */}
      <View style={commonStyles.searchContainer}>
        <TextInput
          style={[commonStyles.searchInput, isDarkMode && commonStyles.darkInput]}
          placeholder="Randevu ara..."
          placeholderTextColor={isDarkMode ? '#9ca3af' : '#6b7280'}
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      {/* Action Buttons */}
      <View style={commonStyles.actionButtons}>
        <TouchableOpacity 
          style={[commonStyles.buttonSecondary, { flex: 0.3 }]}
          onPress={loadAppointments}
          disabled={loading}
        >
          <Text style={commonStyles.buttonTextSecondary}>🔄 Yenile</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[commonStyles.buttonPrimary, { flex: 0.7 }]}
          onPress={() => onAddAppointment()}
        >
          <Text style={commonStyles.buttonText}>➕ Yeni Randevu Ekle</Text>
        </TouchableOpacity>
      </View>

      {/* Randevu Listesi */}
      <ScrollView style={commonStyles.listContainer}>
        {loading ? (
          <View style={commonStyles.loadingContainer}>
            <ActivityIndicator size="large" color="#6366f1" />
            <Text style={[commonStyles.loadingText, isDarkMode && commonStyles.darkSubtitle]}>
              Randevular yükleniyor...
            </Text>
          </View>
        ) : sortedAppointments.map((appointment) => {
          const statusInfo = getStatusInfo(appointment.status);
          const typeInfo = getTypeInfo(appointment.type);
          
          return (
            <TouchableOpacity
              key={appointment.id}
              style={[commonStyles.card, isDarkMode && styles.darkCard]}
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
                
                <View style={[commonStyles.statusBadge, { backgroundColor: statusInfo.color }]}>
                  <Text style={commonStyles.statusText}>
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
                    style={[commonStyles.buttonDanger, processing === appointment.id && styles.disabledButton, { flex: 1 }]}
                    onPress={() => openRejectModal(appointment)}
                    disabled={processing === appointment.id}
                  >
                    <Text style={commonStyles.buttonText}>
                      {processing === appointment.id ? '...' : '❌ Reddet'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[commonStyles.buttonSuccess, processing === appointment.id && styles.disabledButton, { flex: 1 }]}
                    onPress={() => openApprovalModal(appointment)}
                    disabled={processing === appointment.id}
                  >
                    <Text style={commonStyles.buttonText}>
                      {processing === appointment.id ? '...' : '✅ Onayla'}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </TouchableOpacity>
          );
        })}

        {!loading && sortedAppointments.length === 0 && (
          <View style={commonStyles.emptyContainer}>
            <Text style={commonStyles.emptyIcon}>📅</Text>
            <Text style={[commonStyles.emptyTitle, isDarkMode && commonStyles.darkText]}>
              {currentTab === 'scheduled' ? 'Randevu Yok' : 'Bekleyen Onay Yok'}
            </Text>
            <Text style={[commonStyles.emptyText, isDarkMode && commonStyles.darkSubtitle]}>
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
        <View style={commonStyles.modalOverlay}>
          <View style={[commonStyles.modalContent, isDarkMode && commonStyles.darkModalContent]}>
            <Text style={[commonStyles.modalTitle, isDarkMode && commonStyles.darkText]}>
              Randevuyu Onayla
            </Text>
            
            {selectedAppointment && (
              <Text style={[commonStyles.modalSubtitle, isDarkMode && commonStyles.darkSubtitle]}>
                {selectedAppointment.patientName} - {selectedAppointment.title}
              </Text>
            )}

            <Text style={[commonStyles.label, isDarkMode && commonStyles.darkText]}>
              Notlar (Opsiyonel):
            </Text>
            <TextInput
              style={[commonStyles.input, isDarkMode && commonStyles.darkInput]}
              value={approvalNotes}
              onChangeText={setApprovalNotes}
              placeholder="Randevu hakkında notlarınız..."
              placeholderTextColor={isDarkMode ? '#999' : '#666'}
              multiline
              numberOfLines={4}
            />

            <View style={commonStyles.modalActions}>
              <TouchableOpacity
                style={commonStyles.buttonSecondary}
                onPress={() => {
                  setShowApprovalModal(false);
                  setApprovalNotes('');
                }}
              >
                <Text style={commonStyles.buttonTextSecondary}>İptal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={commonStyles.buttonSuccess}
                onPress={() => selectedAppointment && handleApprove(selectedAppointment, approvalNotes)}
              >
                <Text style={commonStyles.buttonText}>Onayla</Text>
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
        <View style={commonStyles.modalOverlay}>
          <View style={[commonStyles.modalContent, isDarkMode && commonStyles.darkModalContent]}>
            <Text style={[commonStyles.modalTitle, isDarkMode && commonStyles.darkText]}>
              Randevuyu Reddet
            </Text>
            
            {selectedAppointment && (
              <Text style={[commonStyles.modalSubtitle, isDarkMode && commonStyles.darkSubtitle]}>
                {selectedAppointment.patientName} - {selectedAppointment.title}
              </Text>
            )}

            <Text style={[commonStyles.label, isDarkMode && commonStyles.darkText]}>
              Red Sebebi *:
            </Text>
            <TextInput
              style={[commonStyles.input, isDarkMode && commonStyles.darkInput]}
              value={rejectionReason}
              onChangeText={setRejectionReason}
              placeholder="Randevuyu neden reddediyorsunuz?"
              placeholderTextColor={isDarkMode ? '#999' : '#666'}
              multiline
              numberOfLines={4}
            />

            <View style={commonStyles.modalActions}>
              <TouchableOpacity
                style={commonStyles.buttonSecondary}
                onPress={() => {
                  setShowRejectModal(false);
                  setRejectionReason('');
                  setSelectedAppointment(null);
                }}
              >
                <Text style={commonStyles.buttonTextSecondary}>İptal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={commonStyles.buttonDanger}
                onPress={() => selectedAppointment && handleReject(selectedAppointment, rejectionReason)}
              >
                <Text style={commonStyles.buttonText}>Reddet</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  // Custom appointment card layout styles
  darkCard: {
    backgroundColor: '#262626',
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
    fontSize: 20,
    marginRight: 12,
  },
  
  titleContainer: {
    flex: 1,
  },
  
  appointmentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
  },
  
  appointmentPatient: {
    fontSize: 14,
    color: '#6b7280',
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
    color: '#6b7280',
  },
  
  typeRow: {
    marginBottom: 4,
  },
  
  typeText: {
    fontSize: 14,
    color: '#6b7280',
  },
  
  descriptionRow: {
    marginBottom: 4,
  },
  
  descriptionText: {
    fontSize: 14,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  
  notesRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  
  notesText: {
    fontSize: 12,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  
  rejectionText: {
    fontSize: 12,
    color: '#ef4444',
    fontStyle: 'italic',
  },
  
  appointmentActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  
  disabledButton: {
    backgroundColor: '#a3a3a3',
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
});

export default AppointmentListScreen;