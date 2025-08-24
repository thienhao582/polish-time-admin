import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CheckInItem {
  id: string;
  customerNumber: string;
  customerName: string;
  status: string;
  checkInTime: string;
  date: string; // YYYY-MM-DD format
  tags: string[];
  services?: string[];
  phone?: string;
  waitTime?: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

interface CheckInState {
  checkIns: CheckInItem[];
  addCheckIn: (checkIn: Omit<CheckInItem, 'id' | 'created_at' | 'updated_at'>) => void;
  updateCheckIn: (id: string, updates: Partial<CheckInItem>) => void;
  deleteCheckIn: (id: string) => void;
  getCheckInsByDate: (date: string) => CheckInItem[];
  initializeWithDemoData: () => void;
}

const initialCheckIns: CheckInItem[] = [
  {
    id: "1",
    customerNumber: "3760",
    customerName: "Misteri Crowder",
    status: "waiting",
    checkInTime: "10:23 AM",
    date: new Date().toISOString().split('T')[0],
    tags: ["NEW"],
    services: ["Haircut", "Wash"],
    phone: "0123456789",
    waitTime: 15,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "2", 
    customerNumber: "3141",
    customerName: "Sophie",
    status: "waiting",
    checkInTime: "09:08 AM",
    date: new Date().toISOString().split('T')[0],
    tags: ["VIP"],
    services: ["Color", "Style"],
    phone: "0987654321",
    waitTime: 45,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "3",
    customerNumber: "2895",
    customerName: "John Doe",
    status: "waiting",
    checkInTime: "11:15 AM",
    date: new Date().toISOString().split('T')[0],
    tags: ["REGULAR"],
    services: ["Trim"],
    phone: "0555123456",
    waitTime: 5,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "4",
    customerNumber: "2701",
    customerName: "Maria Garcia",
    status: "waiting",
    checkInTime: "11:30 AM",
    date: new Date().toISOString().split('T')[0],
    tags: ["NEW"],
    services: ["Manicure", "Pedicure"],
    phone: "0444987654",
    waitTime: 20,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const useCheckInStore = create<CheckInState>()(
  persist(
    (set, get) => ({
      checkIns: [],
      
      addCheckIn: (checkIn) => {
        const newCheckIn: CheckInItem = {
          ...checkIn,
          id: `checkin-${Date.now()}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        set((state) => ({
          checkIns: [...state.checkIns, newCheckIn]
        }));
      },
      
      updateCheckIn: (id, updates) => {
        set((state) => ({
          checkIns: state.checkIns.map(checkIn =>
            checkIn.id === id 
              ? { ...checkIn, ...updates, updated_at: new Date().toISOString() }
              : checkIn
          )
        }));
      },
      
      deleteCheckIn: (id) => {
        set((state) => ({
          checkIns: state.checkIns.filter(checkIn => checkIn.id !== id)
        }));
      },
      
      getCheckInsByDate: (date) => {
        const { checkIns } = get();
        return checkIns.filter(checkIn => checkIn.date === date);
      },
      
      initializeWithDemoData: () => {
        set({ checkIns: initialCheckIns });
      }
    }),
    {
      name: 'checkin-storage',
    }
  )
);