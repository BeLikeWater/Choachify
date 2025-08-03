import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  useColorScheme,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { AppointmentService } from '../services/appointmentService';
import { AuthService } from '../services/authService';
import { User, AppointmentRequest } from '../types';

interface PatientAppointmentRequestScreenProps {
  user: User;
  onSuccess: () => void;
  onCancel: () => void;
}

export const PatientAppointmentRequestScreen: React.FC<PatientAppointmentRequestScreenProps> = ({
  user,
  onSuccess,
  onCancel,
}) => {
  const isDarkMode = useColorScheme() === 'dark';
  const [loading, setLoading] = useState(false);
  const [doctorUser, setDoctorUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<AppointmentRequest>({
    doctorId: user.doctorId || '',
    title: '',
    description: '',
    date: '',
    time: '',
    duration: 30,
    type: 'consultation',
  });

  useEffect(() => {
    loadDoctorInfo();
  }, []);

  const loadDoctorInfo = async () => {
    if (!user.doctorId) {
      Alert.alert('Hata', 'Hasta kayıt bilgilerinizde doktor bilgisi bulunamadı');
      return;
    }

    try {
      const doctors = await AuthService.getDoctors();
      const doctor = doctors.find(d => d.id === user.doctorId);
      if (doctor) {
        setDoctorUser(doctor);
        setFormData(prev => ({ ...prev, doctorId: doctor.id }));
      } else {
        Alert.alert('Hata', 'Doktor bilgisi bulunamadı');
      }
    } catch (error) {
      console.error('Doktor bilgisi yüklenemedi:', error);
      Alert.alert('Hata', 'Doktor bilgisi yüklenirken bir hata oluştu');
    }
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      Alert.alert('Hata', 'Randevu başlığı zorunludur');
      return;
    }

    if (!formData.date.trim()) {
      Alert.alert('Hata', 'Randevu tarihi zorunludur');
      return;
    }

    if (!formData.time.trim()) {
      Alert.alert('Hata', 'Randevu saati zorunludur');
      return;
    }

    if (!doctorUser) {
      Alert.alert('Hata', 'Doktor bilgisi bulunamadı');
      return;
    }

    const selectedDate = new Date(formData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      Alert.alert('Hata', 'Geçmiş bir tarihe randevu alınamaz');
      return;
    }

    try {
      setLoading(true);
      await AppointmentService.requestAppointment(user, doctorUser, formData);
      Alert.alert(
        'Başarılı', 
        'Randevu talebiniz başarıyla gönderildi. Doktorunuzun onayını bekleyiniz.',
        [{ text: 'Tamam', onPress: onSuccess }]
      );
    } catch (error: any) {
      console.error('Randevu talebi gönderilemedi:', error);
      Alert.alert('Hata', error.message || 'Randevu talebi gönderilirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const generateTimeOptions = () => {
    const times = [];
    for (let hour = 8; hour <= 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        times.push(timeString);
      }
    }
    return times;
  };

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.darkContainer]}>
      <KeyboardAvoidingView 
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onCancel} style={styles.cancelButton}>
              <Text style={styles.cancelButtonText}>← İptal</Text>
            </TouchableOpacity>
            <Text style={[styles.title, isDarkMode && styles.darkText]}>
              📅 Randevu Talebi
            </Text>
            <View style={styles.placeholder} />
          </View>

          {/* Doctor Info */}
          {doctorUser && (
            <View style={[styles.doctorCard, isDarkMode && styles.darkCard]}>
              <Text style={[styles.doctorTitle, isDarkMode && styles.darkText]}>
                Randevu Alınacak Doktor:
              </Text>
              <Text style={[styles.doctorName, isDarkMode && styles.darkText]}>
                👨‍⚕️ Dr. {doctorUser.firstName} {doctorUser.lastName}
              </Text>
              {doctorUser.specialization && (
                <Text style={[styles.doctorSpecialization, isDarkMode && styles.darkSubtitle]}>
                  {doctorUser.specialization}
                </Text>
              )}
            </View>
          )}

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, isDarkMode && styles.darkText]}>
                Randevu Başlığı *
              </Text>
              <TextInput
                style={[styles.input, isDarkMode && styles.darkInput]}
                value={formData.title}
                onChangeText={(text) => setFormData({...formData, title: text})}
                placeholder="Örn: Kontrol muayenesi"
                placeholderTextColor={isDarkMode ? '#999' : '#666'}
                editable={!loading}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, isDarkMode && styles.darkText]}>
                Açıklama
              </Text>
              <TextInput
                style={[styles.input, styles.textArea, isDarkMode && styles.darkInput]}
                value={formData.description}
                onChangeText={(text) => setFormData({...formData, description: text})}
                placeholder="Randevu hakkında detaylar..."
                placeholderTextColor={isDarkMode ? '#999' : '#666'}
                multiline
                numberOfLines={4}
                editable={!loading}
              />
            </View>

            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={[styles.label, isDarkMode && styles.darkText]}>
                  Tarih *
                </Text>
                <TextInput
                  style={[styles.input, isDarkMode && styles.darkInput]}
                  value={formData.date}
                  onChangeText={(text) => setFormData({...formData, date: text})}
                  placeholder={getTomorrowDate()}
                  placeholderTextColor={isDarkMode ? '#999' : '#666'}
                  editable={!loading}
                />
                <Text style={[styles.hint, isDarkMode && styles.darkSubtitle]}>
                  YYYY-MM-DD formatında
                </Text>
              </View>

              <View style={styles.halfInput}>
                <Text style={[styles.label, isDarkMode && styles.darkText]}>
                  Saat *
                </Text>
                <TextInput
                  style={[styles.input, isDarkMode && styles.darkInput]}
                  value={formData.time}
                  onChangeText={(text) => setFormData({...formData, time: text})}
                  placeholder="09:00"
                  placeholderTextColor={isDarkMode ? '#999' : '#666'}
                  editable={!loading}
                />
                <Text style={[styles.hint, isDarkMode && styles.darkSubtitle]}>
                  HH:MM formatında
                </Text>
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={[styles.label, isDarkMode && styles.darkText]}>
                  Süre (dakika)
                </Text>
                <TextInput
                  style={[styles.input, isDarkMode && styles.darkInput]}
                  value={formData.duration.toString()}
                  onChangeText={(text) => setFormData({...formData, duration: parseInt(text) || 30})}
                  placeholder="30"
                  placeholderTextColor={isDarkMode ? '#999' : '#666'}
                  keyboardType="numeric"
                  editable={!loading}
                />
              </View>

              <View style={styles.halfInput}>
                <Text style={[styles.label, isDarkMode && styles.darkText]}>
                  Randevu Tipi
                </Text>
                <View style={styles.typeContainer}>
                  <TouchableOpacity
                    style={[
                      styles.typeButton,
                      formData.type === 'consultation' && styles.typeButtonActive,
                      isDarkMode && styles.darkTypeButton,
                    ]}
                    onPress={() => setFormData({...formData, type: 'consultation'})}
                    disabled={loading}
                  >
                    <Text style={[
                      styles.typeButtonText,
                      formData.type === 'consultation' && styles.typeButtonTextActive,
                      isDarkMode && styles.darkText,
                    ]}>
                      Muayene
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.typeButton,
                      formData.type === 'follow-up' && styles.typeButtonActive,
                      isDarkMode && styles.darkTypeButton,
                    ]}
                    onPress={() => setFormData({...formData, type: 'follow-up'})}
                    disabled={loading}
                  >
                    <Text style={[
                      styles.typeButtonText,
                      formData.type === 'follow-up' && styles.typeButtonTextActive,
                      isDarkMode && styles.darkText,
                    ]}>
                      Kontrol
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Randevu Talebini Gönder</Text>
              )}
            </TouchableOpacity>

            {/* Info */}
            <View style={[styles.infoCard, isDarkMode && styles.darkInfoCard]}>
              <Text style={[styles.infoTitle, isDarkMode && styles.darkText]}>
                ℹ️ Bilgi
              </Text>
              <Text style={[styles.infoText, isDarkMode && styles.darkSubtitle]}>
                Randevu talebiniz doktorunuza gönderilecek ve onaylanmayı bekleyecektir. 
                Doktor onayladıktan sonra randevunuz kesinleşecektir.
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
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
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    marginBottom: 20,
  },
  cancelButton: {
    padding: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#007bff',
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212529',
  },
  placeholder: {
    width: 60,
  },
  darkText: {
    color: '#ffffff',
  },
  darkSubtitle: {
    color: '#adb5bd',
  },
  doctorCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  darkCard: {
    backgroundColor: '#2d2d2d',
    borderColor: '#444',
  },
  doctorTitle: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 8,
  },
  doctorName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 4,
  },
  doctorSpecialization: {
    fontSize: 14,
    color: '#6c757d',
  },
  form: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  halfInput: {
    flex: 1,
    marginRight: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#212529',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#212529',
  },
  darkInput: {
    backgroundColor: '#2d2d2d',
    borderColor: '#444',
    color: '#ffffff',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  hint: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 4,
  },
  typeContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  darkTypeButton: {
    backgroundColor: '#2d2d2d',
    borderColor: '#444',
  },
  typeButtonActive: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  typeButtonText: {
    fontSize: 14,
    color: '#212529',
    fontWeight: '500',
  },
  typeButtonTextActive: {
    color: '#fff',
  },
  submitButton: {
    backgroundColor: '#28a745',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  submitButtonDisabled: {
    backgroundColor: '#999',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: '#e3f2fd',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  darkInfoCard: {
    backgroundColor: '#1565c0',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1976d2',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#1976d2',
    lineHeight: 20,
  },
});