
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface PointsSettings {
  pointsPerAmount: number; // điểm per 1000 VND
  minimumAmount: number;   // số tiền tối thiểu để tích điểm
}

export interface AppointmentColors {
  anyone: string;           // màu cho lịch hẹn ở trạng thái "anyone"
  preAssigned: string;      // màu cho lịch hẹn được sắp xếp sẵn nhân viên
  reassigned: string;       // màu cho lịch hẹn được assign sau khi từ anyone
}

interface SettingsState {
  pointsSettings: PointsSettings;
  appointmentColors: AppointmentColors;
  updatePointsSettings: (settings: Partial<PointsSettings>) => void;
  updateAppointmentColors: (colors: Partial<AppointmentColors>) => void;
  resetToDefaults: () => void;
}

const defaultPointsSettings: PointsSettings = {
  pointsPerAmount: 1, // 1 điểm per 1000 VND
  minimumAmount: 50000, // tối thiểu 50k mới tích điểm
};

const defaultAppointmentColors: AppointmentColors = {
  anyone: 'bg-orange-100 border-orange-300 text-orange-800',        // màu cam cho anyone
  preAssigned: 'bg-blue-100 border-blue-300 text-blue-800',        // màu xanh dương cho pre-assigned  
  reassigned: 'bg-sky-100 border-sky-300 text-sky-800',            // màu xanh da trời cho reassigned
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      pointsSettings: { ...defaultPointsSettings },
      appointmentColors: { ...defaultAppointmentColors },
      
      updatePointsSettings: (settings) => set((state) => ({
        pointsSettings: { ...state.pointsSettings, ...settings }
      })),
      
      updateAppointmentColors: (colors) => set((state) => ({
        appointmentColors: { ...state.appointmentColors, ...colors }
      })),
      
      resetToDefaults: () => set({
        pointsSettings: { ...defaultPointsSettings },
        appointmentColors: { ...defaultAppointmentColors }
      }),
    }),
    {
      name: 'settings-storage',
      partialize: (state) => ({
        pointsSettings: state.pointsSettings,
        appointmentColors: state.appointmentColors,
      }),
    }
  )
);
