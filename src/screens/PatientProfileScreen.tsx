import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
  useColorScheme,
  ActivityIndicator,
} from 'react-native';
import { User, Patient } from '../types';
import { PatientService } from '../services/patientService';

interface PatientProfileScreenProps {
  user: User;
}

const PatientProfileScreen: React.FC<PatientProfileScreenProps> = ({ user }) => {
  const isDarkMode = useColorScheme() === 'dark';
  const [patientData, setPatientData] = useState<Patient | null>(null);
  const [doctorData, setDoctorData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPatientData();
  }, []);

  const loadPatientData = async () => {
    try {
      setLoading(true);
      
      // Hasta verilerini bul (user email'i ile eşleşen hasta kaydı)
      const allPatients = await PatientService.getAllPatients();
      const patient = allPatients.find(p => p.email === user.email);
      
      if (patient) {
        setPatientData(patient);
      }
      
      // Doktor bilgilerini yükle (eğer hasta kayıtlı ise)
      if (user.doctorId) {
        // Doktor bilgilerini AuthService'den almak gerekir, şimdilik sadece hasta datasını gösterelim
      }
    } catch (error) {
      console.error('Hasta verileri yüklenemedi:', error);
      Alert.alert('Hata', 'Hasta verileri yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, isDarkMode && styles.darkContainer]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={[styles.loadingText, isDarkMode && styles.darkSubtitle]}>
            Profil bilgileri yükleniyor...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* User Info Section */}
        <View style={[styles.section, isDarkMode && styles.darkSection]}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
            👤 Kişisel Bilgiler
          </Text>
          
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, isDarkMode && styles.darkSubtitle]}>
              Ad Soyad:
            </Text>
            <Text style={[styles.infoValue, isDarkMode && styles.darkText]}>
              {user.firstName} {user.lastName}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, isDarkMode && styles.darkSubtitle]}>
              Email:
            </Text>
            <Text style={[styles.infoValue, isDarkMode && styles.darkText]}>
              {user.email}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, isDarkMode && styles.darkSubtitle]}>
              Kullanıcı Tipi:
            </Text>
            <Text style={[styles.infoValue, isDarkMode && styles.darkText]}>
              👤 Hasta
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, isDarkMode && styles.darkSubtitle]}>
              Üyelik Tarihi:
            </Text>
            <Text style={[styles.infoValue, isDarkMode && styles.darkText]}>
              {new Date(user.createdAt).toLocaleDateString('tr-TR')}
            </Text>
          </View>
        </View>

        {/* Patient Data Section */}
        {patientData ? (
          <View style={[styles.section, isDarkMode && styles.darkSection]}>
            <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
              🏥 Hasta Bilgileri
            </Text>
            
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, isDarkMode && styles.darkSubtitle]}>
                Yaş:
              </Text>
              <Text style={[styles.infoValue, isDarkMode && styles.darkText]}>
                {patientData.age} yaşında
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, isDarkMode && styles.darkSubtitle]}>
                Cinsiyet:
              </Text>
              <Text style={[styles.infoValue, isDarkMode && styles.darkText]}>
                {patientData.gender === 'Erkek' ? '👨 Erkek' : '👩 Kadın'}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, isDarkMode && styles.darkSubtitle]}>
                Telefon:
              </Text>
              <Text style={[styles.infoValue, isDarkMode && styles.darkText]}>
                {patientData.phone}
              </Text>
            </View>

            {patientData.address && (
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, isDarkMode && styles.darkSubtitle]}>
                  Adres:
                </Text>
                <Text style={[styles.infoValue, isDarkMode && styles.darkText]}>
                  {patientData.address}
                </Text>
              </View>
            )}

            {patientData.emergencyContact && (
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, isDarkMode && styles.darkSubtitle]}>
                  Acil Durum İletişim:
                </Text>
                <Text style={[styles.infoValue, isDarkMode && styles.darkText]}>
                  {patientData.emergencyContact}
                </Text>
              </View>
            )}

            {/* Health Info */}
            {(patientData.medicalHistory || patientData.allergies || patientData.currentMedications) && (
              <>
                <Text style={[styles.subSectionTitle, isDarkMode && styles.darkText]}>
                  Sağlık Bilgileri
                </Text>

                {patientData.medicalHistory && (
                  <View style={styles.infoRow}>
                    <Text style={[styles.infoLabel, isDarkMode && styles.darkSubtitle]}>
                      Tıbbi Geçmiş:
                    </Text>
                    <Text style={[styles.infoValue, isDarkMode && styles.darkText]}>
                      {patientData.medicalHistory}
                    </Text>
                  </View>
                )}

                {patientData.allergies && (
                  <View style={styles.infoRow}>
                    <Text style={[styles.infoLabel, isDarkMode && styles.darkSubtitle]}>
                      Alerjiler:
                    </Text>
                    <Text style={[styles.infoValue, isDarkMode && styles.darkText]}>
                      {patientData.allergies}
                    </Text>
                  </View>
                )}

                {patientData.currentMedications && (
                  <View style={styles.infoRow}>
                    <Text style={[styles.infoLabel, isDarkMode && styles.darkSubtitle]}>
                      Mevcut İlaçlar:
                    </Text>
                    <Text style={[styles.infoValue, isDarkMode && styles.darkText]}>
                      {patientData.currentMedications}
                    </Text>
                  </View>
                )}
              </>
            )}

            <View style={styles.updateInfo}>
              <Text style={[styles.updateText, isDarkMode && styles.darkSubtitle]}>
                Son güncelleme: {new Date(patientData.updatedAt).toLocaleDateString('tr-TR')}
              </Text>
            </View>
          </View>
        ) : (
          <View style={[styles.section, isDarkMode && styles.darkSection]}>
            <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
              🏥 Hasta Bilgileri
            </Text>
            <Text style={[styles.noDataText, isDarkMode && styles.darkSubtitle]}>
              Henüz hasta kaydınız oluşturulmamış. Doktorunuz tarafından hasta kaydınızın oluşturulması bekleniyor.
            </Text>
          </View>
        )}

        {/* Quick Actions */}
        <View style={[styles.section, isDarkMode && styles.darkSection]}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
            ⚡ Hızlı İşlemler
          </Text>
          
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>
              📅 Randevularım
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.actionButton, styles.actionButtonSecondary]}>
            <Text style={[styles.actionButtonText, styles.actionButtonTextSecondary]}>
              📊 Ölçümlerim (Yakında)
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.actionButton, styles.actionButtonSecondary]}>
            <Text style={[styles.actionButtonText, styles.actionButtonTextSecondary]}>
              🥗 Diyet Planlarım (Yakında)
            </Text>
          </TouchableOpacity>
        </View>

        {/* Doctor Info */}
        {user.doctorId && (
          <View style={[styles.section, isDarkMode && styles.darkSection]}>
            <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
              👨‍⚕️ Doktorum
            </Text>
            <Text style={[styles.noDataText, isDarkMode && styles.darkSubtitle]}>
              Doktor bilgileri yükleniyor...
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
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  darkSection: {
    backgroundColor: '#2d2d2d',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 16,
  },
  subSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginTop: 12,
    marginBottom: 8,
  },
  infoRow: {
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6c757d',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#212529',
    fontWeight: '400',
  },
  darkText: {
    color: '#ffffff',
  },
  darkSubtitle: {
    color: '#adb5bd',
  },
  updateInfo: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  updateText: {
    fontSize: 12,
    color: '#6c757d',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  noDataText: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    fontStyle: 'italic',
    padding: 20,
  },
  actionButton: {
    backgroundColor: '#007bff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    alignItems: 'center',
  },
  actionButtonSecondary: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  actionButtonTextSecondary: {
    color: '#6c757d',
  },
});

export default PatientProfileScreen;