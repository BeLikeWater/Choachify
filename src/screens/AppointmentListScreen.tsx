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
} from 'react-native';
import { Appointment, Patient } from '../types';
import { AppointmentService } from '../services/appointmentService';

interface AppointmentListScreenProps {
  patients: Patient[];
  onAppointmentPress: (appointment: Appointment) => void;
  onAddAppointment: (selectedPatient?: Patient) => void;
}

const AppointmentListScreen: React.FC<AppointmentListScreenProps> = ({
  patients,
  onAppointmentPress,
  onAddAppointment,
}) => {
  const isDarkMode = useColorScheme() === 'dark';
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');

  // Randevuları yükle
  const loadAppointments = async () => {
    try {
      setLoading(true);
      const fetchedAppointments = await AppointmentService.getAllAppointments();
      setAppointments(fetchedAppointments);
    } catch (error) {
      console.error('Randevular yüklenemedi:', error);
      Alert.alert('Hata', 'Randevular yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  // Arama filtresi
  const filteredAppointments = appointments.filter(appointment =>
    appointment.title.toLowerCase().includes(searchText.toLowerCase()) ||
    appointment.patientName.toLowerCase().includes(searchText.toLowerCase()) ||
    appointment.description?.toLowerCase().includes(searchText.toLowerCase())
  );

  // Randevu durumu
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'scheduled': return { text: 'Planlandı', color: '#007bff', icon: '📅' };
      case 'completed': return { text: 'Tamamlandı', color: '#28a745', icon: '✅' };
      case 'cancelled': return { text: 'İptal Edildi', color: '#dc3545', icon: '❌' };
      case 'no-show': return { text: 'Gelmedi', color: '#ffc107', icon: '⚠️' };
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
          {filteredAppointments.length} randevu
        </Text>
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

      {/* Yeni Randevu Ekle Butonu */}
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => onAddAppointment()}
      >
        <Text style={styles.addButtonText}>➕ Yeni Randevu Ekle</Text>
      </TouchableOpacity>

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
              </View>
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
  addButton: {
    backgroundColor: '#007bff',
    marginHorizontal: 20,
    marginBottom: 20,
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
});

export default AppointmentListScreen;