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
import { AuthService } from '../services/authService';
import { RegisterData, User } from '../types';

interface RegisterScreenProps {
  onRegisterSuccess: (user: User) => void;
  onNavigateToLogin: () => void;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({
  onRegisterSuccess,
  onNavigateToLogin,
}) => {
  const isDarkMode = useColorScheme() === 'dark';
  const [formData, setFormData] = useState<RegisterData>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    userType: 'hasta',
    specialization: '',
    licenseNumber: '',
    doctorId: '',
  });
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState<User[]>([]);
  const [showDoctorSelection, setShowDoctorSelection] = useState(false);

  // Doktor listesini yükle
  useEffect(() => {
    loadDoctors();
  }, []);

  // Hasta seçildiğinde doktor listesini göster
  useEffect(() => {
    if (formData.userType === 'hasta') {
      setShowDoctorSelection(true);
    } else {
      setShowDoctorSelection(false);
      setFormData(prev => ({ ...prev, doctorId: '' }));
    }
  }, [formData.userType]);

  const loadDoctors = async () => {
    try {
      const doctorList = await AuthService.getDoctors();
      setDoctors(doctorList);
    } catch (error) {
      console.error('Doktor listesi yüklenemedi:', error);
    }
  };

  const handleRegister = async () => {
    // Validation
    if (!formData.email.trim() || !formData.password.trim() || 
        !formData.firstName.trim() || !formData.lastName.trim()) {
      Alert.alert('Hata', 'Lütfen zorunlu alanları doldurun');
      return;
    }

    if (formData.userType === 'doktor' && (!formData.specialization?.trim() || !formData.licenseNumber?.trim())) {
      Alert.alert('Hata', 'Doktor için uzmanlık alanı ve ruhsat numarası zorunludur');
      return;
    }

    if (formData.userType === 'hasta' && !formData.doctorId) {
      Alert.alert('Hata', 'Hasta için doktor seçimi zorunludur');
      return;
    }

    if (formData.password.length < 6) {
      Alert.alert('Hata', 'Şifre en az 6 karakter olmalıdır');
      return;
    }

    try {
      setLoading(true);
      const user = await AuthService.register(formData);
      onRegisterSuccess(user);
    } catch (error: any) {
      Alert.alert('Kayıt Hatası', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.darkContainer]}>
      <KeyboardAvoidingView 
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, isDarkMode && styles.darkText]}>
              📝 Kayıt Ol
            </Text>
            <Text style={[styles.subtitle, isDarkMode && styles.darkSubtitle]}>
              Yeni hesap oluşturun
            </Text>
          </View>

          {/* Register Form */}
          <View style={styles.form}>
            {/* Basic Info */}
            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={[styles.label, isDarkMode && styles.darkText]}>
                  Ad *
                </Text>
                <TextInput
                  style={[styles.input, isDarkMode && styles.darkInput]}
                  value={formData.firstName}
                  onChangeText={(text) => setFormData({...formData, firstName: text})}
                  placeholder="Adınız"
                  placeholderTextColor={isDarkMode ? '#999' : '#666'}
                  editable={!loading}
                />
              </View>
              
              <View style={styles.halfInput}>
                <Text style={[styles.label, isDarkMode && styles.darkText]}>
                  Soyad *
                </Text>
                <TextInput
                  style={[styles.input, isDarkMode && styles.darkInput]}
                  value={formData.lastName}
                  onChangeText={(text) => setFormData({...formData, lastName: text})}
                  placeholder="Soyadınız"
                  placeholderTextColor={isDarkMode ? '#999' : '#666'}
                  editable={!loading}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, isDarkMode && styles.darkText]}>
                Email *
              </Text>
              <TextInput
                style={[styles.input, isDarkMode && styles.darkInput]}
                value={formData.email}
                onChangeText={(text) => setFormData({...formData, email: text.trim()})}
                placeholder="ornek@email.com"
                placeholderTextColor={isDarkMode ? '#999' : '#666'}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                editable={!loading}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, isDarkMode && styles.darkText]}>
                Şifre *
              </Text>
              <TextInput
                style={[styles.input, isDarkMode && styles.darkInput]}
                value={formData.password}
                onChangeText={(text) => setFormData({...formData, password: text})}
                placeholder="En az 6 karakter"
                placeholderTextColor={isDarkMode ? '#999' : '#666'}
                secureTextEntry
                editable={!loading}
              />
            </View>

            {/* User Type Selection */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, isDarkMode && styles.darkText]}>
                Kullanıcı Tipi *
              </Text>
              <View style={styles.userTypeContainer}>
                <TouchableOpacity
                  style={[
                    styles.userTypeButton,
                    formData.userType === 'doktor' && styles.userTypeButtonActive,
                    isDarkMode && styles.darkUserTypeButton,
                    formData.userType === 'doktor' && isDarkMode && styles.darkUserTypeButtonActive,
                  ]}
                  onPress={() => setFormData({...formData, userType: 'doktor'})}
                  disabled={loading}
                >
                  <Text style={[
                    styles.userTypeButtonText,
                    formData.userType === 'doktor' && styles.userTypeButtonTextActive,
                    isDarkMode && styles.darkText,
                  ]}>
                    👨‍⚕️ Doktor
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.userTypeButton,
                    formData.userType === 'hasta' && styles.userTypeButtonActive,
                    isDarkMode && styles.darkUserTypeButton,
                    formData.userType === 'hasta' && isDarkMode && styles.darkUserTypeButtonActive,
                  ]}
                  onPress={() => setFormData({...formData, userType: 'hasta'})}
                  disabled={loading}
                >
                  <Text style={[
                    styles.userTypeButtonText,
                    formData.userType === 'hasta' && styles.userTypeButtonTextActive,
                    isDarkMode && styles.darkText,
                  ]}>
                    👤 Hasta
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Doctor Specific Fields */}
            {formData.userType === 'doktor' && (
              <>
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, isDarkMode && styles.darkText]}>
                    Uzmanlık Alanı *
                  </Text>
                  <TextInput
                    style={[styles.input, isDarkMode && styles.darkInput]}
                    value={formData.specialization}
                    onChangeText={(text) => setFormData({...formData, specialization: text})}
                    placeholder="Diyetisyen, Beslenme Uzmanı vb."
                    placeholderTextColor={isDarkMode ? '#999' : '#666'}
                    editable={!loading}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.label, isDarkMode && styles.darkText]}>
                    Ruhsat Numarası *
                  </Text>
                  <TextInput
                    style={[styles.input, isDarkMode && styles.darkInput]}
                    value={formData.licenseNumber}
                    onChangeText={(text) => setFormData({...formData, licenseNumber: text})}
                    placeholder="Mesleki ruhsat numaranız"
                    placeholderTextColor={isDarkMode ? '#999' : '#666'}
                    editable={!loading}
                  />
                </View>
              </>
            )}

            {/* Patient Doctor Selection */}
            {showDoctorSelection && doctors.length > 0 && (
              <View style={styles.inputGroup}>
                <Text style={[styles.label, isDarkMode && styles.darkText]}>
                  Doktor Seçimi *
                </Text>
                <ScrollView style={styles.doctorList} nestedScrollEnabled>
                  {doctors.map((doctor) => (
                    <TouchableOpacity
                      key={doctor.id}
                      style={[
                        styles.doctorItem,
                        formData.doctorId === doctor.id && styles.doctorItemSelected,
                        isDarkMode && styles.darkDoctorItem,
                        formData.doctorId === doctor.id && isDarkMode && styles.darkDoctorItemSelected,
                      ]}
                      onPress={() => setFormData({...formData, doctorId: doctor.id})}
                      disabled={loading}
                    >
                      <Text style={[
                        styles.doctorName,
                        formData.doctorId === doctor.id && styles.doctorNameSelected,
                        isDarkMode && styles.darkText,
                      ]}>
                        👨‍⚕️ Dr. {doctor.firstName} {doctor.lastName}
                      </Text>
                      {doctor.specialization && (
                        <Text style={[
                          styles.doctorSpecialization,
                          isDarkMode && styles.darkSubtitle,
                        ]}>
                          {doctor.specialization}
                        </Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Register Button */}
            <TouchableOpacity
              style={[styles.registerButton, loading && styles.registerButtonDisabled]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.registerButtonText}>Kayıt Ol</Text>
              )}
            </TouchableOpacity>

            {/* Login Link */}
            <View style={styles.loginContainer}>
              <Text style={[styles.loginText, isDarkMode && styles.darkSubtitle]}>
                Zaten hesabınız var mı?{' '}
              </Text>
              <TouchableOpacity 
                onPress={onNavigateToLogin}
                disabled={loading}
              >
                <Text style={[styles.loginLink, loading && styles.loginLinkDisabled]}>
                  Giriş Yap
                </Text>
              </TouchableOpacity>
            </View>
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
  content: {
    flex: 1,
    paddingVertical: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
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
    textAlign: 'center',
  },
  darkText: {
    color: '#ffffff',
  },
  darkSubtitle: {
    color: '#adb5bd',
  },
  form: {
    marginBottom: 20,
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
  userTypeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  userTypeButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  darkUserTypeButton: {
    backgroundColor: '#2d2d2d',
    borderColor: '#444',
  },
  userTypeButtonActive: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  darkUserTypeButtonActive: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  userTypeButtonText: {
    fontSize: 16,
    color: '#212529',
    fontWeight: '500',
  },
  userTypeButtonTextActive: {
    color: '#fff',
  },
  doctorList: {
    maxHeight: 200,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  doctorItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  darkDoctorItem: {
    backgroundColor: '#2d2d2d',
    borderBottomColor: '#444',
  },
  doctorItemSelected: {
    backgroundColor: '#e3f2fd',
  },
  darkDoctorItemSelected: {
    backgroundColor: '#1565c0',
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 4,
  },
  doctorNameSelected: {
    color: '#1976d2',
  },
  doctorSpecialization: {
    fontSize: 14,
    color: '#6c757d',
  },
  registerButton: {
    backgroundColor: '#28a745',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  registerButtonDisabled: {
    backgroundColor: '#999',
  },
  registerButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  loginText: {
    fontSize: 16,
    color: '#6c757d',
  },
  loginLink: {
    fontSize: 16,
    color: '#007bff',
    fontWeight: '600',
  },
  loginLinkDisabled: {
    color: '#999',
  },
});