import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useColorScheme, Alert, SafeAreaView } from 'react-native';
import { User } from '../types';
import { AuthService } from '../services/authService';
import PatientProfileScreen from '../screens/PatientProfileScreen';
import PatientAppointmentsScreen from '../screens/PatientAppointmentsScreen';
import PatientDietsScreen from '../screens/PatientDietsScreen';

interface PatientNavigatorProps {
  user: User;
  onLogout: () => void;
}

const PatientNavigator: React.FC<PatientNavigatorProps> = ({ user, onLogout }) => {
  const isDarkMode = useColorScheme() === 'dark';
  const [currentTab, setCurrentTab] = useState<'profile' | 'appointments' | 'diets' | 'measurements'>('profile');

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
          <Text style={[styles.welcomeText, isDarkMode && styles.darkText]}>
            Hoş geldiniz,
          </Text>
          <Text style={[styles.userName, isDarkMode && styles.darkText]}>
            {user.firstName} {user.lastName}
          </Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutButtonText}>🚪 Çıkış</Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      <View style={styles.content}>
        {currentTab === 'profile' ? (
          <PatientProfileScreen user={user} />
        ) : currentTab === 'appointments' ? (
          <PatientAppointmentsScreen user={user} />
        ) : currentTab === 'diets' ? (
          <PatientDietsScreen user={user} />
        ) : (
          <View style={styles.comingSoon}>
            <Text style={[styles.comingSoonText, isDarkMode && styles.darkText]}>
              📊 Ölçümler
            </Text>
            <Text style={[styles.comingSoonSubtext, isDarkMode && styles.darkSubtitle]}>
              Bu özellik yakında eklenecek
            </Text>
          </View>
        )}
      </View>

      {/* Bottom Tab Bar */}
      <View style={[styles.tabBar, isDarkMode && styles.darkTabBar]}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            currentTab === 'profile' && styles.activeTab,
            currentTab === 'profile' && isDarkMode && styles.darkActiveTab,
          ]}
          onPress={() => setCurrentTab('profile')}
        >
          <Text style={[
            styles.tabIcon,
            currentTab === 'profile' && styles.activeTabText,
          ]}>
            👤
          </Text>
          <Text style={[
            styles.tabLabel,
            isDarkMode && styles.darkTabLabel,
            currentTab === 'profile' && styles.activeTabText,
          ]}>
            Profil
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
      </View>
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
  content: {
    flex: 1,
  },
  comingSoon: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  comingSoonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 8,
  },
  comingSoonSubtext: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
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
});

export default PatientNavigator;