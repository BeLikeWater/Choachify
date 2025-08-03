import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, ActivityIndicator, StyleSheet, useColorScheme, Text } from 'react-native';
import { AuthService } from '../services/authService';
import { User, AuthState } from '../types';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import DoctorNavigator from './DoctorNavigator';
import PatientNavigator from './PatientNavigator';

const Stack = createStackNavigator();

const AppNavigator: React.FC = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    // Auth state değişikliklerini dinle
    const unsubscribe = AuthService.onAuthStateChanged((user) => {
      setAuthState({
        user,
        isAuthenticated: !!user,
        isLoading: false,
      });
    });

    return unsubscribe;
  }, []);

  const handleLoginSuccess = (user: User) => {
    setAuthState({
      user,
      isAuthenticated: true,
      isLoading: false,
    });
  };

  const handleRegisterSuccess = (user: User) => {
    setAuthState({
      user,
      isAuthenticated: true,
      isLoading: false,
    });
    setShowRegister(false);
  };

  const handleLogout = () => {
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  const handleNavigateToRegister = () => {
    setShowRegister(true);
  };

  const handleNavigateToLogin = () => {
    setShowRegister(false);
  };

  // Loading ekranı
  if (authState.isLoading) {
    return (
      <View style={[styles.loadingContainer, isDarkMode && styles.darkLoadingContainer]}>
        <Text style={[styles.loadingTitle, isDarkMode && styles.darkText]}>
          🏥 Coachify
        </Text>
        <ActivityIndicator size="large" color="#007bff" style={styles.loadingSpinner} />
        <Text style={[styles.loadingText, isDarkMode && styles.darkSubtitle]}>
          Yükleniyor...
        </Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {authState.isAuthenticated && authState.user ? (
          // Kullanıcı giriş yapmış
          authState.user.userType === 'doktor' ? (
            // Doktor arayüzü
            <Stack.Screen name="DoctorApp">
              {() => (
                <DoctorNavigator 
                  user={authState.user!} 
                  onLogout={handleLogout} 
                />
              )}
            </Stack.Screen>
          ) : (
            // Hasta arayüzü
            <Stack.Screen name="PatientApp">
              {() => (
                <PatientNavigator 
                  user={authState.user!} 
                  onLogout={handleLogout} 
                />
              )}
            </Stack.Screen>
          )
        ) : (
          // Kullanıcı giriş yapmamış
          <>
            {showRegister ? (
              <Stack.Screen name="Register">
                {() => (
                  <RegisterScreen
                    onRegisterSuccess={handleRegisterSuccess}
                    onNavigateToLogin={handleNavigateToLogin}
                  />
                )}
              </Stack.Screen>
            ) : (
              <Stack.Screen name="Login">
                {() => (
                  <LoginScreen
                    onLoginSuccess={handleLoginSuccess}
                    onNavigateToRegister={handleNavigateToRegister}
                  />
                )}
              </Stack.Screen>
            )}
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 40,
  },
  darkLoadingContainer: {
    backgroundColor: '#1a1a1a',
  },
  loadingTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 20,
  },
  loadingSpinner: {
    marginVertical: 20,
  },
  loadingText: {
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
});

export default AppNavigator;