// Auth Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  userType: 'doktor' | 'hasta';
  createdAt: string;
  updatedAt: string;
  // Doktor specific fields
  specialization?: string;
  licenseNumber?: string;
  // Hasta specific fields
  doctorId?: string; // Hangi doktora bağlı
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  userType: 'doktor' | 'hasta';
  specialization?: string;
  licenseNumber?: string;
  doctorId?: string;
}

export interface Patient {
  id: string;
  // Kimlik Bilgileri
  firstName: string;
  lastName: string;
  age: number;
  gender: 'Erkek' | 'Kadın';
  
  // İletişim Bilgileri
  phone: string;
  email: string;
  address?: string;
  emergencyContact?: string;
  
  // Sağlık Bilgileri
  medicalHistory?: string;
  allergies?: string;
  currentMedications?: string;
  
  // Sistem
  createdAt: string;
  updatedAt: string;
  
  // Eski alanlar (geriye uyumluluk için opsiyonel)
  birthDate?: string;
  height?: number; // cm
  weight?: number; // kg
  bmi?: number;
  bloodValues?: {
    glucose?: number;
    cholesterol?: number;
    hemoglobin?: number;
    lastUpdated?: string;
  };
  lifestyle?: {
    sleepHours: number;
    exerciseFrequency: 'none' | 'rarely' | 'sometimes' | 'often' | 'daily';
    stressLevel: 1 | 2 | 3 | 4 | 5; // 1: düşük, 5: yüksek
  };
}

export interface DashboardData {
  totalPatients: number;
  activePatients: number;
  appointmentsToday: number;
  appointmentsWeek: number;
  weightLossAverage: number;
  successRate: number;
}

export interface ChartData {
  labels: string[];
  datasets: {
    data: number[];
    color?: (opacity: number) => string;
  }[];
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string; // Cache için hasta adı
  patientEmail: string; // Hasta email'i
  doctorId: string;
  doctorName: string; // Cache için doktor adı
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  duration: number; // dakika
  status: 'pending' | 'scheduled' | 'completed' | 'cancelled' | 'rejected' | 'no-show';
  type: 'consultation' | 'follow-up' | 'check-up' | 'emergency' | 'other';
  notes?: string;
  rejectionReason?: string; // Doktor reddetme sebebi
  createdAt: string;
  updatedAt: string;
}

// Randevu talep etmek için interface
export interface AppointmentRequest {
  doctorId: string;
  title: string;
  description?: string;
  date: string;
  time: string;
  duration: number;
  type: 'consultation' | 'follow-up' | 'check-up' | 'emergency' | 'other';
}

export interface Measurement {
  id: string;
  patientId: string;
  patientName: string; // Cache için hasta adı
  weight: number; // kg
  waterIntake: number; // ml (günlük)
  exerciseDuration: number; // dakika (günlük)
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  notes?: string;
  bmi?: number; // Otomatik hesaplanacak
  createdAt: string;
  updatedAt: string;
}

export interface DietMeal {
  name: string; // Yemek adı
  items: string[]; // Besin maddeleri listesi
  notes?: string; // Özel notlar
}

export interface DietPlan {
  id: string;
  patientId: string;
  patientName: string; // Cache için hasta adı
  date: string; // YYYY-MM-DD (hangi gün için)
  title: string; // Plan başlığı
  
  // Öğünler
  breakfast: DietMeal; // Kahvaltı
  snack1: DietMeal; // Ara Öğün 1
  lunch: DietMeal; // Öğle Yemeği
  snack2: DietMeal; // Ara Öğün 2
  dinner: DietMeal; // Akşam Yemeği
  nightSnack?: DietMeal; // Gece Öğünü (opsiyonel)
  
  // Genel bilgiler
  waterTarget: number; // Günlük su hedefi (ml)
  exerciseRecommendation?: string; // Egzersiz önerisi
  supplements?: string[]; // Günlük takviyeler
  generalNotes?: string; // Genel notlar
  
  // Sistem bilgileri
  createdBy: string; // Diyetisyen/Doktor adı
  createdAt: string;
  updatedAt: string;
}