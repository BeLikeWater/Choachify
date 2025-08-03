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
} from 'react-native';
import { User, Appointment } from '../types';
import { AppointmentService } from '../services/appointmentService';
import { PatientAppointmentRequestScreen } from './PatientAppointmentRequestScreen';

interface PatientAppointmentsScreenProps {
  user: User;
}

const PatientAppointmentsScreen: React.FC<PatientAppointmentsScreenProps> = ({ user }) => {
  const isDarkMode = useColorScheme() === 'dark';
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRequestForm, setShowRequestForm] = useState(false);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const patientAppointments = await AppointmentService.getAppointmentsByPatient(user.id);
      setAppointments(patientAppointments);
    } catch (error: any) {
      console.error('Randevular yüklenemedi:', error);
      Alert.alert('Hata', 'Randevular yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestSuccess = () => {
    setShowRequestForm(false);
    loadAppointments();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#ffc107';
      case 'scheduled': return '#007bff';
      case 'completed': return '#28a745';
      case 'cancelled': return '#dc3545';
      case 'rejected': return '#dc3545';
      case 'no-show': return '#6c757d';
      default: return '#6c757d';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Onay Bekliyor';
      case 'scheduled': return 'Planlandı';
      case 'completed': return 'Tamamlandı';
      case 'cancelled': return 'İptal Edildi';
      case 'rejected': return 'Reddedildi';
      case 'no-show': return 'Gelmedi';
      default: return status;
    }
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (showRequestForm) {
    return (
      <PatientAppointmentRequestScreen
        user={user}
        onSuccess={handleRequestSuccess}
        onCancel={() => setShowRequestForm(false)}
      />
    );
  }

  if (loading) {
    return (
      <View style={[styles.container, isDarkMode && styles.darkContainer]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={[styles.loadingText, isDarkMode && styles.darkSubtitle]}>
            Randevular yükleniyor...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={[styles.title, isDarkMode && styles.darkText]}>
            📅 Randevularım
          </Text>
          <Text style={[styles.subtitle, isDarkMode && styles.darkSubtitle]}>
            {appointments.length} randevu
          </Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowRequestForm(true)}
        >
          <Text style={styles.addButtonText}>+ Randevu Talep Et</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {appointments.length === 0 ? (
          <View style={[styles.emptyContainer, isDarkMode && styles.darkSection]}>
            <Text style={[styles.emptyIcon]}>📅</Text>
            <Text style={[styles.emptyTitle, isDarkMode && styles.darkText]}>
              Henüz randevunuz yok
            </Text>
            <Text style={[styles.emptyText, isDarkMode && styles.darkSubtitle]}>
              Henüz randevunuz bulunmuyor. Yukarıdaki "Randevu Talep Et" butonuna tıklayarak yeni bir randevu talebinde bulunabilirsiniz.
            </Text>
            <TouchableOpacity 
              style={styles.refreshButton}
              onPress={loadAppointments}
            >
              <Text style={styles.refreshButtonText}>
                🔄 Yenile
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          appointments.map((appointment) => (
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
                
                <View 
                  style={[
                    styles.statusBadge, 
                    { backgroundColor: getStatusColor(appointment.status) }
                  ]}
                >
                  <Text style={styles.statusText}>
                    {getStatusText(appointment.status)}
                  </Text>
                </View>
              </View>

              <View style={styles.appointmentInfo}>
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

                {appointment.notes && (
                  <View style={styles.infoRow}>
                    <Text style={[styles.infoLabel, isDarkMode && styles.darkSubtitle]}>
                      💬 Notlar:
                    </Text>
                    <Text style={[styles.infoValue, isDarkMode && styles.darkText]}>
                      {appointment.notes}
                    </Text>
                  </View>
                )}

                {appointment.rejectionReason && (
                  <View style={styles.infoRow}>
                    <Text style={[styles.infoLabel, isDarkMode && styles.darkSubtitle]}>
                      ❌ Red Sebebi:
                    </Text>
                    <Text style={[styles.infoValue, isDarkMode && styles.darkText, styles.rejectionText]}>
                      {appointment.rejectionReason}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.appointmentFooter}>
                <Text style={[styles.footerText, isDarkMode && styles.darkSubtitle]}>
                  Oluşturulma: {new Date(appointment.createdAt).toLocaleDateString('tr-TR')}
                </Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  headerContent: {
    flex: 1,
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
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  appointmentInfo: {
    gap: 8,
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
  appointmentFooter: {
    marginTop: 12,
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
  addButton: {
    backgroundColor: '#28a745',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  rejectionText: {
    color: '#dc3545',
    fontStyle: 'italic',
  },
});

export default PatientAppointmentsScreen;