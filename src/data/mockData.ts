import { Patient, DashboardData, ChartData } from '../types';

export const mockPatients: Patient[] = [
  {
    id: '1',
    firstName: 'Ayşe',
    lastName: 'Demir',
    birthDate: '1990-05-15',
    gender: 'female',
    phone: '+90 555 123 4567',
    email: 'ayse.demir@email.com',
    height: 165,
    weight: 68,
    bmi: 25.0,
    bloodValues: {
      glucose: 95,
      cholesterol: 180,
      hemoglobin: 13.2,
      lastUpdated: '2024-01-15',
    },
    allergies: ['Fıstık', 'Deniz ürünleri'],
    medicalHistory: ['Tip 2 diyabet'],
    medications: ['Metformin 500mg'],
    lifestyle: {
      sleepHours: 7,
      exerciseFrequency: 'sometimes',
      stressLevel: 3,
    },
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: '2',
    firstName: 'Mehmet',
    lastName: 'Yılmaz',
    birthDate: '1985-12-20',
    gender: 'male',
    phone: '+90 555 987 6543',
    email: 'mehmet.yilmaz@email.com',
    height: 178,
    weight: 85,
    bmi: 26.8,
    bloodValues: {
      glucose: 110,
      cholesterol: 220,
      hemoglobin: 14.5,
      lastUpdated: '2024-01-10',
    },
    allergies: [],
    medicalHistory: ['Hipertansiyon'],
    medications: ['Lisinopril 10mg'],
    lifestyle: {
      sleepHours: 6,
      exerciseFrequency: 'rarely',
      stressLevel: 4,
    },
    createdAt: '2024-01-05',
    updatedAt: '2024-01-10',
  },
  {
    id: '3',
    firstName: 'Zeynep',
    lastName: 'Kaya',
    birthDate: '1992-08-30',
    gender: 'female',
    phone: '+90 555 246 8135',
    email: 'zeynep.kaya@email.com',
    height: 160,
    weight: 55,
    bmi: 21.5,
    bloodValues: {
      glucose: 88,
      cholesterol: 160,
      hemoglobin: 12.8,
      lastUpdated: '2024-01-20',
    },
    allergies: ['Gluten'],
    medicalHistory: ['Çölyak hastalığı'],
    medications: [],
    lifestyle: {
      sleepHours: 8,
      exerciseFrequency: 'often',
      stressLevel: 2,
    },
    createdAt: '2024-01-10',
    updatedAt: '2024-01-20',
  },
  {
    id: '4',
    firstName: 'Can',
    lastName: 'Özkan',
    birthDate: '1988-03-12',
    gender: 'male',
    phone: '+90 555 369 1472',
    email: 'can.ozkan@email.com',
    height: 175,
    weight: 92,
    bmi: 30.0,
    bloodValues: {
      glucose: 125,
      cholesterol: 240,
      hemoglobin: 15.1,
      lastUpdated: '2024-01-18',
    },
    allergies: ['Süt'],
    medicalHistory: ['Obezite', 'Uyku apnesi'],
    medications: ['Orlistat 120mg'],
    lifestyle: {
      sleepHours: 5,
      exerciseFrequency: 'none',
      stressLevel: 5,
    },
    createdAt: '2024-01-08',
    updatedAt: '2024-01-18',
  },
];

export const mockDashboardData: DashboardData = {
  totalPatients: 42,
  activePatients: 38,
  appointmentsToday: 8,
  appointmentsWeek: 25,
  weightLossAverage: 4.2,
  successRate: 87,
};

export const mockWeightLossChart: ChartData = {
  labels: ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz'],
  datasets: [
    {
      data: [3.2, 4.1, 3.8, 5.2, 4.5, 4.8],
      color: (opacity = 1) => `rgba(46, 125, 50, ${opacity})`,
    },
  ],
};

export const mockPatientProgressChart: ChartData = {
  labels: ['Hafta 1', 'Hafta 2', 'Hafta 3', 'Hafta 4', 'Hafta 5', 'Hafta 6'],
  datasets: [
    {
      data: [15, 22, 18, 25, 30, 28],
      color: (opacity = 1) => `rgba(25, 118, 210, ${opacity})`,
    },
  ],
};