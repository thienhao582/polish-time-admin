
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface PointsSettings {
  pointsPerAmount: number; // điểm per 1000 VND
  minimumAmount: number;   // số tiền tối thiểu để tích điểm
}

interface SettingsState {
  pointsSettings: PointsSettings;
  updatePointsSettings: (settings: Partial<PointsSettings>) => void;
  resetToDefaults: () => void;
}

const defaultPointsSettings: PointsSettings = {
  pointsPerAmount: 1, // 1 điểm per 1000 VND
  minimumAmount: 50000, // tối thiểu 50k mới tích điểm
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      pointsSettings: { ...defaultPointsSettings },
      
      updatePointsSettings: (settings) => set((state) => ({
        pointsSettings: { ...state.pointsSettings, ...settings }
      })),
      
      resetToDefaults: () => set({
        pointsSettings: { ...defaultPointsSettings }
      }),
    }),
    {
      name: 'settings-storage',
      partialize: (state) => ({
        pointsSettings: state.pointsSettings,
      }),
    }
  )
);
