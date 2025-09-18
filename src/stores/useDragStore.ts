import { create } from 'zustand';

interface DragState {
  draggedAppointmentId: number | null;
  startDrag: (id: number) => void;
  endDrag: () => void;
}

export const useDragStore = create<DragState>((set) => ({
  draggedAppointmentId: null,
  startDrag: (id: number) => set({ draggedAppointmentId: id }),
  endDrag: () => set({ draggedAppointmentId: null }),
}));
