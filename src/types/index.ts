export interface Patient {
  id: string;
  // Kimlik Bilgileri
  firstName: string;
  lastName: string;
  birthDate: string;
  gender: 'male' | 'female' | 'other';
  
  // İletişim Bilgileri
  phone: string;
  email: string;
  
  // Fiziksel Bilgiler
  height: number; // cm
  weight: number; // kg
  bmi: number;
  
  // Kan Değerleri
  bloodValues: {
    glucose?: number;
    cholesterol?: number;
    hemoglobin?: number;
    lastUpdated?: string;
  };
  
  // Sağlık Geçmişi
  allergies: string[];
  medicalHistory: string[];
  medications: string[];
  
  // Yaşam Tarzı
  lifestyle: {
    sleepHours: number;
    exerciseFrequency: 'none' | 'rarely' | 'sometimes' | 'often' | 'daily';
    stressLevel: 1 | 2 | 3 | 4 | 5; // 1: düşük, 5: yüksek
  };
  
  // Sistem
  createdAt: string;
  updatedAt: string;
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
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  duration: number; // dakika
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  type: 'consultation' | 'follow-up' | 'check-up' | 'emergency' | 'other';
  notes?: string;
  createdAt: string;
  updatedAt: string;
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