import { create } from 'zustand';

interface DragState {
  draggedAppointmentId: number | null;
  isDragEnabled: boolean;
  startDrag: (id: number) => void;
  endDrag: () => void;
  setDragEnabled: (enabled: boolean) => void;
}

export const useDragStore = create<DragState>((set) => ({
  draggedAppointmentId: null,
  isDragEnabled: false,
  startDrag: (id: number) => set({ draggedAppointmentId: id }),
  endDrag: () => set({ draggedAppointmentId: null }),
  setDragEnabled: (enabled: boolean) => set({ isDragEnabled: enabled }),
}));
