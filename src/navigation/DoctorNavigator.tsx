import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useColorScheme, Alert, ScrollView, SafeAreaView } from 'react-native';
import { commonStyles } from '../styles/commonStyles';
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
    <SafeAreaView style={[commonStyles.safeArea, isDarkMode && commonStyles.darkSafeArea]}>
      {/* Header */}
      <View style={[commonStyles.headerRow, isDarkMode && styles.darkHeader]}>
        <View style={styles.userInfo}>
          <Text style={[commonStyles.caption, isDarkMode && commonStyles.darkSubtitle]}>
            Hoş geldiniz,
          </Text>
          <Text style={[commonStyles.title, isDarkMode && commonStyles.darkText]}>
            Dr. {user.firstName} {user.lastName}
          </Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={commonStyles.buttonDanger}>
          <Text style={commonStyles.buttonText}>🚪 Çıkış</Text>
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
          <View style={[commonStyles.container, isDarkMode && commonStyles.darkContainer]}>
            <View style={commonStyles.header}>
              <Text style={[commonStyles.titleLarge, isDarkMode && commonStyles.darkText]}>
                📊 Ölçüm Takibi
              </Text>
              <Text style={[commonStyles.subtitle, isDarkMode && commonStyles.darkSubtitle]}>
                Hasta seçin veya yeni ölçüm ekleyin
              </Text>
            </View>
            
            <TouchableOpacity 
              style={commonStyles.buttonSuccess}
              onPress={handleAddMeasurementFromList}
            >
              <Text style={commonStyles.buttonText}>➕ Yeni Ölçüm Ekle</Text>
            </TouchableOpacity>

            <ScrollView style={commonStyles.listContainer}>
              {patients.map((patient) => (
                <TouchableOpacity
                  key={patient.id}
                  style={[commonStyles.card, isDarkMode && styles.darkCard]}
                  onPress={() => handleViewMeasurements(patient)}
                >
                  <Text style={[commonStyles.title, isDarkMode && commonStyles.darkText]}>
                    {patient.firstName} {patient.lastName}
                  </Text>
                  <Text style={[commonStyles.caption, isDarkMode && commonStyles.darkSubtitle]}>
                    👤 {patient.age} yaşında • {patient.gender}
                  </Text>
                  <Text style={[styles.viewMeasurementsText, isDarkMode && commonStyles.darkSubtitle]}>
                    📊 Ölçümleri Görüntüle
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        ) : (
          <View style={[commonStyles.container, isDarkMode && commonStyles.darkContainer]}>
            <View style={commonStyles.header}>
              <Text style={[commonStyles.titleLarge, isDarkMode && commonStyles.darkText]}>
                🥗 Diyet Takibi
              </Text>
              <Text style={[commonStyles.subtitle, isDarkMode && commonStyles.darkSubtitle]}>
                Hasta seçin veya yeni diyet planı ekleyin
              </Text>
            </View>
            
            <TouchableOpacity 
              style={[commonStyles.buttonPrimary, { backgroundColor: '#fd7e14' }]}
              onPress={handleAddDietPlanFromList}
            >
              <Text style={commonStyles.buttonText}>➕ Yeni Diyet Planı Ekle</Text>
            </TouchableOpacity>

            <ScrollView style={commonStyles.listContainer}>
              {patients.map((patient) => (
                <TouchableOpacity
                  key={patient.id}
                  style={[commonStyles.card, isDarkMode && styles.darkCard]}
                  onPress={() => handleViewDietPlans(patient)}
                >
                  <Text style={[commonStyles.title, isDarkMode && commonStyles.darkText]}>
                    {patient.firstName} {patient.lastName}
                  </Text>
                  <Text style={[commonStyles.caption, isDarkMode && commonStyles.darkSubtitle]}>
                    👤 {patient.age} yaşında • {patient.gender}
                  </Text>
                  <Text style={[styles.viewMeasurementsText, { color: '#fd7e14' }, isDarkMode && commonStyles.darkSubtitle]}>
                    🥗 Diyet Planlarını Görüntüle
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      {/* Bottom Tab Bar */}
      <View style={[commonStyles.tabContainer, { flexDirection: 'row', backgroundColor: '#ffffff', borderTopWidth: 1, borderTopColor: '#e5e7eb', paddingBottom: 20, paddingTop: 10 }, isDarkMode && styles.darkTabBar]}>
        <TouchableOpacity
          style={[
            commonStyles.tabButton,
            currentTab === 'dashboard' && commonStyles.tabButtonActive,
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
            commonStyles.tabButtonText,
            currentTab === 'dashboard' && commonStyles.tabButtonTextActive,
          ]}>
            Dashboard
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            commonStyles.tabButton,
            currentTab === 'patients' && commonStyles.tabButtonActive,
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
            commonStyles.tabButtonText,
            currentTab === 'patients' && commonStyles.tabButtonTextActive,
          ]}>
            Hastalar
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            commonStyles.tabButton,
            currentTab === 'appointments' && commonStyles.tabButtonActive,
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
            commonStyles.tabButtonText,
            currentTab === 'appointments' && commonStyles.tabButtonTextActive,
          ]}>
            Randevular
          </Text>
        </TouchableOpacity>


        <TouchableOpacity
          style={[
            commonStyles.tabButton,
            currentTab === 'measurements' && commonStyles.tabButtonActive,
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
            commonStyles.tabButtonText,
            currentTab === 'measurements' && commonStyles.tabButtonTextActive,
          ]}>
            Ölçümler
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            commonStyles.tabButton,
            currentTab === 'diets' && commonStyles.tabButtonActive,
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
            commonStyles.tabButtonText,
            currentTab === 'diets' && commonStyles.tabButtonTextActive,
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
  content: {
    flex: 1,
  },
  
  darkTabBar: {
    backgroundColor: '#262626',
    borderTopColor: '#404040',
  },
  
  tabIcon: {
    fontSize: 20,
    marginBottom: 4,
    opacity: 0.7,
  },
  
  activeTabText: {
    color: '#6366f1',
    fontWeight: '600',
  },
  
  viewMeasurementsText: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 4,
  },
  
  darkCard: {
    backgroundColor: '#262626',
  },
  
  darkHeader: {
    backgroundColor: '#262626',
    borderBottomColor: '#404040',
  },
});


export default DoctorNavigator;