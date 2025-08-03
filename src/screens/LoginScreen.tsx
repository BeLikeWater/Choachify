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
} from 'react-native';
import { AuthService } from '../services/authService';
import { LoginData, User } from '../types';

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
    <SafeAreaView style={[styles.container, isDarkMode && styles.darkContainer]}>
      <KeyboardAvoidingView 
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          {/* Logo/Title */}
          <View style={styles.header}>
            <Text style={[styles.title, isDarkMode && styles.darkText]}>
              🏥 Coachify
            </Text>
            <Text style={[styles.subtitle, isDarkMode && styles.darkSubtitle]}>
              Sağlık Takip Sistemi
            </Text>
          </View>

          {/* Login Form */}
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, isDarkMode && styles.darkText]}>
                Email
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
                Şifre
              </Text>
              <TextInput
                style={[styles.input, isDarkMode && styles.darkInput]}
                value={formData.password}
                onChangeText={(text) => setFormData({...formData, password: text})}
                placeholder="Şifrenizi girin"
                placeholderTextColor={isDarkMode ? '#999' : '#666'}
                secureTextEntry
                autoComplete="password"
                editable={!loading}
              />
            </View>

            {/* Login Button */}
            <TouchableOpacity
              style={[styles.loginButton, loading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.loginButtonText}>Giriş Yap</Text>
              )}
            </TouchableOpacity>

            {/* Register Link */}
            <View style={styles.registerContainer}>
              <Text style={[styles.registerText, isDarkMode && styles.darkSubtitle]}>
                Hesabınız yok mu?{' '}
              </Text>
              <TouchableOpacity 
                onPress={onNavigateToRegister}
                disabled={loading}
              >
                <Text style={[styles.registerLink, loading && styles.registerLinkDisabled]}>
                  Kayıt Ol
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Demo Accounts */}
          <View style={styles.demoContainer}>
            <Text style={[styles.demoTitle, isDarkMode && styles.darkSubtitle]}>
              Demo Hesaplar:
            </Text>
            <Text style={[styles.demoText, isDarkMode && styles.darkSubtitle]}>
              Doktor: doktor@test.com / 123456
            </Text>
            <Text style={[styles.demoText, isDarkMode && styles.darkSubtitle]}>
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
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    minHeight: 500,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
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
    marginBottom: 40,
  },
  inputGroup: {
    marginBottom: 20,
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
  loginButton: {
    backgroundColor: '#007bff',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  loginButtonDisabled: {
    backgroundColor: '#999',
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  registerText: {
    fontSize: 16,
    color: '#6c757d',
  },
  registerLink: {
    fontSize: 16,
    color: '#007bff',
    fontWeight: '600',
  },
  registerLinkDisabled: {
    color: '#999',
  },
  demoContainer: {
    backgroundColor: '#e3f2fd',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
  },
  demoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1976d2',
    marginBottom: 8,
  },
  demoText: {
    fontSize: 13,
    color: '#1976d2',
    marginBottom: 4,
  },
});