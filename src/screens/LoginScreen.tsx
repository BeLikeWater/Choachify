import React, { useState } from 'react';
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
  Pressable,
} from 'react-native';
import { AuthService } from '../services/authService';
import { LoginData, User } from '../types';
import { commonStyles } from '../styles/commonStyles';

interface LoginScreenProps {
  onLoginSuccess: (user: User) => void;
  onNavigateToRegister: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginSuccess,
  onNavigateToRegister,
}) => {
  const isDarkMode = useColorScheme() === 'dark';
  const [formData, setFormData] = useState<LoginData>({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!formData.email.trim() || !formData.password.trim()) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun');
      return;
    }

    try {
      setLoading(true);
      const user = await AuthService.login(formData);
      onLoginSuccess(user);
    } catch (error: any) {
      Alert.alert('Giriş Hatası', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[commonStyles.safeArea, isDarkMode && commonStyles.darkSafeArea]}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={commonStyles.scrollContent}>
          <View style={styles.content}>
            {/* Logo/Title */}
            <View style={styles.header}>
              <Text style={[commonStyles.titleLarge, isDarkMode && commonStyles.darkText]}>
                🏥 Coachify
              </Text>
              <Text style={[commonStyles.subtitle, isDarkMode && commonStyles.darkSubtitle]}>
                Sağlık Takip Sistemi
              </Text>
            </View>

            {/* Login Form */}
            <View style={commonStyles.form}>
              <View style={commonStyles.inputGroup}>
                <Text style={[commonStyles.label, isDarkMode && commonStyles.darkText]}>
                  Email
                </Text>
                <TextInput
                  style={[
                    commonStyles.input, 
                    isDarkMode && commonStyles.darkInput,
                    focusedInput === 'email' && commonStyles.inputFocused
                  ]}
                  value={formData.email}
                  onChangeText={(text) => setFormData({...formData, email: text.trim()})}
                  onFocus={() => setFocusedInput('email')}
                  onBlur={() => setFocusedInput(null)}
                  placeholder="ornek@email.com"
                  placeholderTextColor={isDarkMode ? '#9ca3af' : '#6b7280'}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  editable={!loading}
                />
              </View>

              <View style={commonStyles.inputGroup}>
                <Text style={[commonStyles.label, isDarkMode && commonStyles.darkText]}>
                  Şifre
                </Text>
                <TextInput
                  style={[
                    commonStyles.input, 
                    isDarkMode && commonStyles.darkInput,
                    focusedInput === 'password' && commonStyles.inputFocused
                  ]}
                  value={formData.password}
                  onChangeText={(text) => setFormData({...formData, password: text})}
                  onFocus={() => setFocusedInput('password')}
                  onBlur={() => setFocusedInput(null)}
                  placeholder="Şifrenizi girin"
                  placeholderTextColor={isDarkMode ? '#9ca3af' : '#6b7280'}
                  secureTextEntry
                  autoComplete="password"
                  editable={!loading}
                />
              </View>

              {/* Login Button */}
              <TouchableOpacity
                style={[commonStyles.buttonPrimary, loading && styles.buttonDisabled]}
                onPress={handleLogin}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={commonStyles.buttonText}>Giriş Yap</Text>
                )}
              </TouchableOpacity>

              {/* Register Link */}
              <View style={styles.registerContainer}>
                <Text style={[commonStyles.subtitle, isDarkMode && commonStyles.darkSubtitle]}>
                  Hesabınız yok mu?
                </Text>
                <TouchableOpacity 
                  onPress={onNavigateToRegister}
                  disabled={loading}
                  style={styles.registerButton}
                >
                  <Text style={[styles.registerLink, loading && styles.registerLinkDisabled]}>
                    Kayıt Ol
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Demo Accounts */}
            <View style={styles.demoContainer}>
              <Text style={styles.demoTitle}>
                Demo Hesaplar:
              </Text>
              <Text style={styles.demoText}>
                Doktor: doktor@test.com / 123456
              </Text>
              <Text style={styles.demoText}>
                Hasta: hasta@test.com / 123456
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
    minHeight: 500,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
    alignItems: 'center',
  },
  registerButton: {
    marginLeft: 4,
  },
  registerLink: {
    fontSize: 16,
    color: '#6366f1',
    fontWeight: '500',
  },
  registerLinkDisabled: {
    color: '#a3a3a3',
  },
  demoContainer: {
    backgroundColor: '#f0f9ff',
    borderRadius: 16,
    padding: 16,
    marginTop: 20,
  },
  demoTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6366f1',
    marginBottom: 8,
  },
  demoText: {
    fontSize: 14,
    color: '#6366f1',
    marginBottom: 4,
  },
  buttonDisabled: {
    backgroundColor: '#a3a3a3',
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
});