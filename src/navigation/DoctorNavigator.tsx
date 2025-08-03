import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useColorScheme, Alert, ScrollView, SafeAreaView } from 'react-native';
import DashboardScreen from '../screens/DashboardScreen';
import PatientListScreen from '../screens/PatientListScreen';
import AddPatientScreen from '../screens/AddPatientScreen';
import AppointmentListScreen from '../screens/AppointmentListScreen';
import AddAppointmentScreen from '../screens/AddAppointmentScreen';
import AddMeasurementScreen from '../screens/AddMeasurementScreen';
import MeasurementDetailScreen from '../screens/MeasurementDetailScreen';
import AddDietPlanScreen from '../screens/AddDietPlanScreen';
import DietDetailScreen from '../screens/DietDetailScreen';
import DietPlanViewScreen from '../screens/DietPlanViewScreen';
import DoctorPendingApprovalsScreen from '../screens/DoctorPendingApprovalsScreen';
import { PatientDetailScreen } from '../screens/PatientDetailScreen';
import { Patient, Appointment, Measurement, DietPlan, User } from '../types';
import { PatientService } from '../services/patientService';
import { AuthService } from '../services/authService';
import { uploadMockDataToFirebase } from '../utils/uploadMockData';
import { mockPatients } from '../data/mockData';
import { testFirebaseConnection } from '../utils/testFirebase';
import { simpleFirebaseTest } from '../utils/simpleFirebaseTest';
import { debugFirebaseOperations } from '../utils/debugFirebase';
import { testInternetConnection, testFirebaseNetworkAccess } from '../utils/networkTest';

interface DoctorNavigatorProps {
  user: User;
  onLogout: () => void;
}

const DoctorNavigator: React.FC<DoctorNavigatorProps> = ({ user, onLogout }) => {
  const isDarkMode = useColorScheme() === 'dark';
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'patients' | 'appointments' | 'measurements' | 'diets'>('dashboard');
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [showAddAppointment, setShowAddAppointment] = useState(false);
  const [showAddMeasurement, setShowAddMeasurement] = useState(false);
  const [showMeasurementDetail, setShowMeasurementDetail] = useState(false);
  const [showAddDietPlan, setShowAddDietPlan] = useState(false);
  const [showDietDetail, setShowDietDetail] = useState(false);
  const [showDietPlanView, setShowDietPlanView] = useState(false);
  const [showPatientDetail, setShowPatientDetail] = useState(false);
  const [selectedPatientForAppointment, setSelectedPatientForAppointment] = useState<Patient | undefined>();
  const [selectedPatientForPatientDetail, setSelectedPatientForPatientDetail] = useState<Patient | undefined>();
  const [selectedPatientForMeasurement, setSelectedPatientForMeasurement] = useState<Patient | undefined>();
  const [selectedPatientForDetail, setSelectedPatientForDetail] = useState<Patient | undefined>();
  const [selectedPatientForDiet, setSelectedPatientForDiet] = useState<Patient | undefined>();
  const [selectedPatientForDietDetail, setSelectedPatientForDietDetail] = useState<Patient | undefined>();
  const [selectedDietPlan, setSelectedDietPlan] = useState<DietPlan | undefined>();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [dietPlans, setDietPlans] = useState<DietPlan[]>([]);
  const [loading, setLoading] = useState(true);

  // Firebase'den hastaları yükle
  const loadPatients = async () => {
    try {
      setLoading(true);
      const fetchedPatients = await PatientService.getAllPatients();
      setPatients(fetchedPatients);
    } catch (error) {
      console.error('Hastalar yüklenemedi:', error);
      Alert.alert('Hata', 'Hastalar yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  // Uygulama başladığında Firebase bağlantısını test et ve hastaları yükle
  useEffect(() => {
    const initializeApp = async () => {
      // Önce internet bağlantısını test et
      console.log('🌐 İnternet bağlantısı kontrol ediliyor...');
      const internetResult = await testInternetConnection();
      
      if (!internetResult) {
        Alert.alert('İnternet Hatası', 'İnternet bağlantısı yok. Lütfen bağlantınızı kontrol edin.');
        setLoading(false);
        return;
      }
      
      // Firebase network erişimini test et
      console.log('🔥 Firebase network erişimi test ediliyor...');
      const firebaseNetworkResult = await testFirebaseNetworkAccess();
      
      // Debug işlemlerini çalıştır
      console.log('🚀 Firebase debug işlemleri başlatılıyor...');
      const debugResult = await debugFirebaseOperations();
      
      if (debugResult) {
        console.log('✅ Firebase debug testleri başarılı');
        await loadPatients();
      } else {
        console.log('❌ Firebase debug testleri başarısız');
        Alert.alert(
          'Firebase Debug Hatası', 
          'Firebase temel işlemleri başarısız. Konsol loglarını kontrol edin.',
          [
            { text: 'Offline Devam Et', onPress: () => setLoading(false) },
            { text: 'Yeniden Dene', onPress: () => initializeApp() },
            { 
              text: 'Mock Veri Yükle', 
              onPress: () => {
                setPatients([...mockPatients.map(p => ({...p, id: Date.now().toString() + Math.random()}))]);
                setLoading(false);
              } 
            }
          ]
        );
      }
    };
    
    initializeApp();
  }, []);

  const handleAddPatient = async (patientData: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newPatient = await PatientService.addPatient(patientData);
      setPatients(prev => [newPatient, ...prev]);
      setShowAddPatient(false);
      setCurrentTab('patients');
      Alert.alert('Başarılı', 'Hasta başarıyla kaydedildi!');
    } catch (error) {
      console.error('Hasta eklenemedi:', error);
      Alert.alert('Hata', 'Hasta kaydedilirken bir hata oluştu.');
    }
  };

  const handlePatientPress = (patient: Patient) => {
    setSelectedPatientForPatientDetail(patient);
    setShowPatientDetail(true);
  };

  const handlePatientUpdated = (updatedPatient: Patient) => {
    setPatients(patients.map(p => p.id === updatedPatient.id ? updatedPatient : p));
  };

  const handleAddAppointmentFromPatient = (patient: Patient) => {
    setSelectedPatientForAppointment(patient);
    setShowAddAppointment(true);
  };

  const handleAddAppointmentFromList = () => {
    setSelectedPatientForAppointment(undefined);
    setShowAddAppointment(true);
  };

  const handleAppointmentSave = (appointment: Appointment) => {
    setShowAddAppointment(false);
    setSelectedPatientForAppointment(undefined);
    setCurrentTab('appointments');
    // Alert AddAppointmentScreen'de gösteriliyor, burada tekrar göstermiyoruz
  };

  const handleAppointmentPress = (appointment: Appointment) => {
    // Future: Navigate to appointment detail screen
    console.log('Appointment pressed:', appointment.title);
  };

  const handleViewMeasurements = (patient: Patient) => {
    setSelectedPatientForDetail(patient);
    setShowMeasurementDetail(true);
  };

  const handleAddMeasurementFromPatient = (patient: Patient) => {
    setSelectedPatientForMeasurement(patient);
    setShowAddMeasurement(true);
  };

  const handleAddMeasurementFromList = () => {
    setSelectedPatientForMeasurement(undefined);
    setShowAddMeasurement(true);
  };

  const handleMeasurementSave = (measurement: Measurement) => {
    setMeasurements(prev => [measurement, ...prev]);
    setShowAddMeasurement(false);
    setSelectedPatientForMeasurement(undefined);
    setCurrentTab('measurements');
    Alert.alert('Başarılı', 'Ölçüm başarıyla eklendi!');
  };

  const handleViewDietPlans = (patient: Patient) => {
    setSelectedPatientForDietDetail(patient);
    setShowDietDetail(true);
  };

  const handleAddDietPlanFromPatient = (patient: Patient) => {
    setSelectedPatientForDiet(patient);
    setShowAddDietPlan(true);
  };

  const handleAddDietPlanFromList = () => {
    setSelectedPatientForDiet(undefined);
    setShowAddDietPlan(true);
  };

  const handleDietPlanSave = (dietPlan: DietPlan) => {
    setDietPlans(prev => [dietPlan, ...prev]);
    setShowAddDietPlan(false);
    setSelectedPatientForDiet(undefined);
    setCurrentTab('diets');
    Alert.alert('Başarılı', 'Diyet planı başarıyla eklendi!');
  };

  const handleDietPlanPress = (dietPlan: DietPlan) => {
    console.log('Diet plan pressed:', dietPlan.title); // Debug log
    setSelectedDietPlan(dietPlan);
    setShowDietDetail(false); // Önce diet detail ekranını kapat
    // selectedPatientForDietDetail'i temizleme - hasta seçimini koru!
    setShowDietPlanView(true); // Sonra diet plan view'ı aç
  };

  // Mock verileri Firebase'e yükle (tek seferlik - geliştirme amaçlı)
  const handleUploadMockData = async () => {
    Alert.alert(
      'Mock Veriler',
      'Mock veriler Firebase\'e yüklensin mi? Bu işlem sadece bir kez yapılmalıdır.',
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Yükle', 
          onPress: async () => {
            try {
              await uploadMockDataToFirebase();
              await loadPatients(); // Listeyi yenile
              Alert.alert('Başarılı', 'Mock veriler başarıyla yüklendi!');
            } catch (error) {
              Alert.alert('Hata', 'Mock veriler yüklenirken hata oluştu.');
            }
          }
        }
      ]
    );
  };

  if (showAddPatient) {
    return (
      <AddPatientScreen
        onSave={handleAddPatient}
        onCancel={() => setShowAddPatient(false)}
      />
    );
  }

  if (showAddAppointment) {
    return (
      <AddAppointmentScreen
        patients={patients}
        selectedPatient={selectedPatientForAppointment}
        user={user}
        onSave={handleAppointmentSave}
        onCancel={() => {
          setShowAddAppointment(false);
          setSelectedPatientForAppointment(undefined);
        }}
      />
    );
  }

  if (showAddMeasurement) {
    return (
      <AddMeasurementScreen
        patients={patients}
        selectedPatient={selectedPatientForMeasurement}
        onSave={handleMeasurementSave}
        onCancel={() => {
          setShowAddMeasurement(false);
          setSelectedPatientForMeasurement(undefined);
        }}
      />
    );
  }

  if (showMeasurementDetail && selectedPatientForDetail) {
    return (
      <MeasurementDetailScreen
        patient={selectedPatientForDetail}
        onBack={() => {
          setShowMeasurementDetail(false);
          setSelectedPatientForDetail(undefined);
        }}
        onAddMeasurement={handleAddMeasurementFromPatient}
      />
    );
  }

  if (showAddDietPlan) {
    return (
      <AddDietPlanScreen
        patients={patients}
        selectedPatient={selectedPatientForDiet}
        onSave={handleDietPlanSave}
        onCancel={() => {
          setShowAddDietPlan(false);
          setSelectedPatientForDiet(undefined);
        }}
      />
    );
  }

  if (showDietDetail && selectedPatientForDietDetail) {
    return (
      <DietDetailScreen
        patient={selectedPatientForDietDetail}
        onBack={() => {
          setShowDietDetail(false);
          setSelectedPatientForDietDetail(undefined);
        }}
        onAddDietPlan={handleAddDietPlanFromPatient}
        onDietPlanPress={handleDietPlanPress}
      />
    );
  }

  if (showPatientDetail && selectedPatientForPatientDetail) {
    return (
      <PatientDetailScreen
        patient={selectedPatientForPatientDetail}
        onBack={() => setShowPatientDetail(false)}
        onPatientUpdated={handlePatientUpdated}
      />
    );
  }

  if (showDietPlanView && selectedDietPlan) {
    return (
      <DietPlanViewScreen
        dietPlan={selectedDietPlan}
        onBack={() => {
          console.log('Closing diet plan view, returning to diet detail'); // Debug log
          console.log('Current selectedPatientForDietDetail:', selectedPatientForDietDetail?.firstName); // Debug log
          setShowDietPlanView(false);
          setSelectedDietPlan(undefined);
          // selectedPatientForDietDetail zaten set edilmiş olmalı, sadece DietDetailScreen'ı aç
          setShowDietDetail(true); // Diet detail ekranına geri dön
        }}
      />
    );
  }

  const handleLogout = async () => {
    Alert.alert(
      'Çıkış Yap',
      'Hesabınızdan çıkmak istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Çıkış Yap',
          onPress: async () => {
            try {
              await AuthService.logout();
              onLogout();
            } catch (error) {
              Alert.alert('Hata', 'Çıkış yapılırken bir hata oluştu');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.darkContainer]}>
      {/* Header */}
      <View style={[styles.header, isDarkMode && styles.darkHeader]}>
        <View style={styles.userInfo}>
          <Text style={[styles.welcomeText, isDarkMode && styles.darkSubtitle]}>
            Hoş geldiniz,
          </Text>
          <Text style={[styles.userName, isDarkMode && styles.darkText]}>
            Dr. {user.firstName} {user.lastName}
          </Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutButtonText}>🚪 Çıkış</Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      <View style={styles.content}>
        {currentTab === 'dashboard' ? (
          <DashboardScreen />
        ) : currentTab === 'patients' ? (
          <PatientListScreen
            patients={patients}
            loading={loading}
            onPatientPress={handlePatientPress}
            onAddPatient={() => setShowAddPatient(true)}
            onUploadMockData={handleUploadMockData}
            onAddAppointment={handleAddAppointmentFromPatient}
            onViewMeasurements={handleViewMeasurements}
            onViewDietPlans={handleViewDietPlans}
          />
        ) : currentTab === 'appointments' ? (
          <AppointmentListScreen
            patients={patients}
            user={user}
            onAppointmentPress={handleAppointmentPress}
            onAddAppointment={handleAddAppointmentFromList}
          />
        ) : currentTab === 'measurements' ? (
          <View style={styles.measurementsTab}>
            <View style={styles.measurementsHeader}>
              <Text style={[styles.measurementsTitle, isDarkMode && styles.darkText]}>
                📊 Ölçüm Takibi
              </Text>
              <Text style={[styles.measurementsSubtitle, isDarkMode && styles.darkSubtitle]}>
                Hasta seçin veya yeni ölçüm ekleyin
              </Text>
            </View>
            
            <TouchableOpacity 
              style={styles.addMeasurementButton}
              onPress={handleAddMeasurementFromList}
            >
              <Text style={styles.addMeasurementButtonText}>➕ Yeni Ölçüm Ekle</Text>
            </TouchableOpacity>

            <ScrollView style={styles.patientGrid}>
              {patients.map((patient) => (
                <TouchableOpacity
                  key={patient.id}
                  style={[styles.patientMeasurementCard, isDarkMode && styles.darkCard]}
                  onPress={() => handleViewMeasurements(patient)}
                >
                  <Text style={[styles.patientMeasurementName, isDarkMode && styles.darkText]}>
                    {patient.firstName} {patient.lastName}
                  </Text>
                  <Text style={[styles.patientMeasurementInfo, isDarkMode && styles.darkSubtitle]}>
                    👤 {patient.age} yaşında • {patient.gender}
                  </Text>
                  <Text style={[styles.viewMeasurementsText, isDarkMode && styles.darkSubtitle]}>
                    📊 Ölçümleri Görüntüle
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        ) : (
          <View style={styles.measurementsTab}>
            <View style={styles.measurementsHeader}>
              <Text style={[styles.measurementsTitle, isDarkMode && styles.darkText]}>
                🥗 Diyet Takibi
              </Text>
              <Text style={[styles.measurementsSubtitle, isDarkMode && styles.darkSubtitle]}>
                Hasta seçin veya yeni diyet planı ekleyin
              </Text>
            </View>
            
            <TouchableOpacity 
              style={[styles.addMeasurementButton, { backgroundColor: '#fd7e14' }]}
              onPress={handleAddDietPlanFromList}
            >
              <Text style={styles.addMeasurementButtonText}>➕ Yeni Diyet Planı Ekle</Text>
            </TouchableOpacity>

            <ScrollView style={styles.patientGrid}>
              {patients.map((patient) => (
                <TouchableOpacity
                  key={patient.id}
                  style={[styles.patientMeasurementCard, isDarkMode && styles.darkCard]}
                  onPress={() => handleViewDietPlans(patient)}
                >
                  <Text style={[styles.patientMeasurementName, isDarkMode && styles.darkText]}>
                    {patient.firstName} {patient.lastName}
                  </Text>
                  <Text style={[styles.patientMeasurementInfo, isDarkMode && styles.darkSubtitle]}>
                    👤 {patient.age} yaşında • {patient.gender}
                  </Text>
                  <Text style={[styles.viewMeasurementsText, { color: '#fd7e14' }, isDarkMode && styles.darkSubtitle]}>
                    🥗 Diyet Planlarını Görüntüle
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      {/* Bottom Tab Bar */}
      <View style={[styles.tabBar, isDarkMode && styles.darkTabBar]}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            currentTab === 'dashboard' && styles.activeTab,
            currentTab === 'dashboard' && isDarkMode && styles.darkActiveTab,
          ]}
          onPress={() => setCurrentTab('dashboard')}
        >
          <Text style={[
            styles.tabIcon,
            currentTab === 'dashboard' && styles.activeTabText,
          ]}>
            📊
          </Text>
          <Text style={[
            styles.tabLabel,
            isDarkMode && styles.darkTabLabel,
            currentTab === 'dashboard' && styles.activeTabText,
          ]}>
            Dashboard
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabButton,
            currentTab === 'patients' && styles.activeTab,
            currentTab === 'patients' && isDarkMode && styles.darkActiveTab,
          ]}
          onPress={() => setCurrentTab('patients')}
        >
          <Text style={[
            styles.tabIcon,
            currentTab === 'patients' && styles.activeTabText,
          ]}>
            👥
          </Text>
          <Text style={[
            styles.tabLabel,
            isDarkMode && styles.darkTabLabel,
            currentTab === 'patients' && styles.activeTabText,
          ]}>
            Hastalar
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabButton,
            currentTab === 'appointments' && styles.activeTab,
            currentTab === 'appointments' && isDarkMode && styles.darkActiveTab,
          ]}
          onPress={() => setCurrentTab('appointments')}
        >
          <Text style={[
            styles.tabIcon,
            currentTab === 'appointments' && styles.activeTabText,
          ]}>
            📅
          </Text>
          <Text style={[
            styles.tabLabel,
            isDarkMode && styles.darkTabLabel,
            currentTab === 'appointments' && styles.activeTabText,
          ]}>
            Randevular
          </Text>
        </TouchableOpacity>


        <TouchableOpacity
          style={[
            styles.tabButton,
            currentTab === 'measurements' && styles.activeTab,
            currentTab === 'measurements' && isDarkMode && styles.darkActiveTab,
          ]}
          onPress={() => setCurrentTab('measurements')}
        >
          <Text style={[
            styles.tabIcon,
            currentTab === 'measurements' && styles.activeTabText,
          ]}>
            📊
          </Text>
          <Text style={[
            styles.tabLabel,
            isDarkMode && styles.darkTabLabel,
            currentTab === 'measurements' && styles.activeTabText,
          ]}>
            Ölçümler
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabButton,
            currentTab === 'diets' && styles.activeTab,
            currentTab === 'diets' && isDarkMode && styles.darkActiveTab,
          ]}
          onPress={() => setCurrentTab('diets')}
        >
          <Text style={[
            styles.tabIcon,
            currentTab === 'diets' && styles.activeTabText,
          ]}>
            🥗
          </Text>
          <Text style={[
            styles.tabLabel,
            isDarkMode && styles.darkTabLabel,
            currentTab === 'diets' && styles.activeTabText,
          ]}>
            Diyet
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

  const handleLogout = async () => {
    Alert.alert(
      'Çıkış Yap',
      'Hesabınızdan çıkmak istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Çıkış Yap',
          onPress: async () => {
            try {
              await AuthService.logout();
              onLogout();
            } catch (error) {
              Alert.alert('Hata', 'Çıkış yapılırken bir hata oluştu');
            }
          },
        },
      ]
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
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    paddingBottom: 20,
    paddingTop: 10,
  },
  darkTabBar: {
    backgroundColor: '#2d2d2d',
    borderTopColor: '#444',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 12,
    marginHorizontal: 8,
  },
  activeTab: {
    backgroundColor: '#e3f2fd',
  },
  darkActiveTab: {
    backgroundColor: '#1565c0',
  },
  tabIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  tabLabel: {
    fontSize: 12,
    color: '#6c757d',
    fontWeight: '500',
  },
  darkTabLabel: {
    color: '#adb5bd',
  },
  activeTabText: {
    color: '#1976d2',
    fontWeight: '600',
  },
  measurementsTab: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  measurementsHeader: {
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  measurementsTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 8,
  },
  measurementsSubtitle: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
  },
  addMeasurementButton: {
    backgroundColor: '#28a745',
    marginHorizontal: 20,
    marginVertical: 20,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  addMeasurementButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  patientGrid: {
    flex: 1,
    paddingHorizontal: 20,
  },
  patientMeasurementCard: {
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
  patientMeasurementName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 8,
  },
  patientMeasurementInfo: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 8,
  },
  viewMeasurementsText: {
    fontSize: 14,
    color: '#28a745',
    fontWeight: '600',
    textAlign: 'center',
  },
});

// Header styles ekleyelim
const headerStyles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  darkHeader: {
    backgroundColor: '#2d2d2d',
    borderBottomColor: '#444',
  },
  userInfo: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 14,
    color: '#6c757d',
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
  },
  darkText: {
    color: '#ffffff',
  },
  darkSubtitle: {
    color: '#adb5bd',
  },
  logoutButton: {
    backgroundColor: '#dc3545',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

// Ana styles'a header stilleri ekle
styles.header = headerStyles.header;
styles.darkHeader = headerStyles.darkHeader;
styles.userInfo = headerStyles.userInfo;
styles.welcomeText = headerStyles.welcomeText;
styles.userName = headerStyles.userName;
styles.darkText = headerStyles.darkText;
styles.darkSubtitle = headerStyles.darkSubtitle;
styles.logoutButton = headerStyles.logoutButton;
styles.logoutButtonText = headerStyles.logoutButtonText;

export default DoctorNavigator;