import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  TextInput,
  ActivityIndicator,
} from 'react-native';
// Using patients from props instead of mock data
import { Patient } from '../types';

interface PatientListScreenProps {
  patients: Patient[];
  loading?: boolean;
  onPatientPress: (patient: Patient) => void;
  onAddPatient: () => void;
  onUploadMockData?: () => void;
  onAddAppointment?: (patient: Patient) => void;
  onViewMeasurements?: (patient: Patient) => void;
  onViewDietPlans?: (patient: Patient) => void;
}

const PatientListScreen: React.FC<PatientListScreenProps> = ({
  patients,
  loading = false,
  onPatientPress,
  onAddPatient,
  onUploadMockData,
  onAddAppointment,
  onViewMeasurements,
  onViewDietPlans,
}) => {
  const isDarkMode = useColorScheme() === 'dark';
  const [searchText, setSearchText] = useState('');

  const filteredPatients = patients.filter(patient =>
    patient.firstName.toLowerCase().includes(searchText.toLowerCase()) ||
    patient.lastName.toLowerCase().includes(searchText.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchText.toLowerCase())
  );

  const getGenderIcon = (gender: string) => {
    switch (gender) {
      case 'male': return '👨';
      case 'female': return '👩';
      default: return '👤';
    }
  };

  const getBMIStatus = (bmi: number) => {
    if (bmi < 18.5) return { text: 'Zayıf', color: '#2196f3' };
    if (bmi < 25) return { text: 'Normal', color: '#4caf50' };
    if (bmi < 30) return { text: 'Fazla Kilolu', color: '#ff9800' };
    return { text: 'Obez', color: '#f44336' };
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR');
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      <View style={styles.header}>
        <Text style={[styles.title, isDarkMode && styles.darkText]}>
          👥 Hasta Listesi
        </Text>
        <Text style={[styles.subtitle, isDarkMode && styles.darkSubtitle]}>
          {filteredPatients.length} hasta
        </Text>
      </View>

      {/* Arama Çubuğu */}
      <View style={styles.searchContainer}>
        <TextInput
          style={[styles.searchInput, isDarkMode && styles.darkInput]}
          placeholder="Hasta ara..."
          placeholderTextColor={isDarkMode ? '#999' : '#666'}
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      {/* Yeni Hasta Ekle Butonu */}
      <TouchableOpacity 
        style={styles.addButton}
        onPress={onAddPatient}
      >
        <Text style={styles.addButtonText}>➕ Yeni Hasta Ekle</Text>
      </TouchableOpacity>

      {/* Mock Data Upload Butonu (sadece geliştirme amaçlı) */}
      {onUploadMockData && patients.length === 0 && !loading && (
        <TouchableOpacity 
          style={[styles.addButton, styles.mockDataButton]}
          onPress={onUploadMockData}
        >
          <Text style={styles.addButtonText}>📤 Mock Verileri Yükle</Text>
        </TouchableOpacity>
      )}

      {/* Hasta Listesi */}
      <ScrollView style={styles.patientList}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007bff" />
            <Text style={[styles.loadingText, isDarkMode && styles.darkSubtitle]}>
              Hastalar yükleniyor...
            </Text>
          </View>
        ) : filteredPatients.map((patient) => {
          const bmiStatus = getBMIStatus(patient.bmi);
          const age = calculateAge(patient.birthDate);
          
          return (
            <TouchableOpacity
              key={patient.id}
              style={[styles.patientCard, isDarkMode && styles.darkCard]}
              onPress={() => onPatientPress(patient)}
            >
              <View style={styles.patientHeader}>
                <View style={styles.patientNameRow}>
                  <Text style={styles.genderIcon}>
                    {getGenderIcon(patient.gender)}
                  </Text>
                  <View style={styles.nameContainer}>
                    <Text style={[styles.patientName, isDarkMode && styles.darkText]}>
                      {patient.firstName} {patient.lastName}
                    </Text>
                    <Text style={[styles.patientAge, isDarkMode && styles.darkSubtitle]}>
                      {age} yaşında
                    </Text>
                  </View>
                </View>
                
                <View style={[styles.bmiBadge, { backgroundColor: bmiStatus.color }]}>
                  <Text style={styles.bmiText}>
                    VKİ: {patient.bmi}
                  </Text>
                </View>
              </View>

              <View style={styles.patientInfo}>
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, isDarkMode && styles.darkSubtitle]}>
                    📧 {patient.email}
                  </Text>
                </View>
                
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, isDarkMode && styles.darkSubtitle]}>
                    📞 {patient.phone}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, isDarkMode && styles.darkSubtitle]}>
                    📏 {patient.height} cm • ⚖️ {patient.weight} kg
                  </Text>
                </View>

                {patient.medicalHistory.length > 0 && (
                  <View style={styles.infoRow}>
                    <Text style={[styles.infoLabel, isDarkMode && styles.darkSubtitle]}>
                      🏥 {patient.medicalHistory.join(', ')}
                    </Text>
                  </View>
                )}

                <View style={styles.dateRow}>
                  <Text style={[styles.dateText, isDarkMode && styles.darkSubtitle]}>
                    Son güncelleme: {formatDate(patient.updatedAt)}
                  </Text>
                </View>

                {/* Butonlar */}
                <View style={styles.actionButtons}>
                  {onAddAppointment && (
                    <TouchableOpacity
                      style={styles.appointmentButton}
                      onPress={() => onAddAppointment(patient)}
                    >
                      <Text style={styles.appointmentButtonText}>
                        📅 Randevu
                      </Text>
                    </TouchableOpacity>
                  )}
                  
                  {onViewMeasurements && (
                    <TouchableOpacity
                      style={styles.measurementButton}
                      onPress={() => onViewMeasurements(patient)}
                    >
                      <Text style={styles.measurementButtonText}>
                        📊 Ölçümler
                      </Text>
                    </TouchableOpacity>
                  )}
                  
                  {onViewDietPlans && (
                    <TouchableOpacity
                      style={styles.dietButton}
                      onPress={() => onViewDietPlans(patient)}
                    >
                      <Text style={styles.dietButtonText}>
                        🥗 Diyet
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          );
        })}

        {!loading && filteredPatients.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, isDarkMode && styles.darkSubtitle]}>
              {patients.length === 0 
                ? 'Henüz hasta kaydı yok. Yeni hasta ekleyebilir veya mock verileri yükleyebilirsiniz.'
                : 'Arama kriterlerinize uygun hasta bulunamadı.'
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
  patientList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  patientCard: {
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
  patientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  patientNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  genderIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  nameContainer: {
    flex: 1,
  },
  patientName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
  },
  patientAge: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 2,
  },
  bmiBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  bmiText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  patientInfo: {
    gap: 6,
  },
  infoRow: {
    marginBottom: 4,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6c757d',
  },
  dateRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  dateText: {
    fontSize: 12,
    color: '#6c757d',
    fontStyle: 'italic',
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
  mockDataButton: {
    backgroundColor: '#28a745',
    marginBottom: 10,
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  appointmentButton: {
    backgroundColor: '#17a2b8',
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  appointmentButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  measurementButton: {
    backgroundColor: '#28a745',
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  measurementButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  dietButton: {
    backgroundColor: '#fd7e14',
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  dietButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default PatientListScreen;