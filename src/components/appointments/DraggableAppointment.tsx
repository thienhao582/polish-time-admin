import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { memo } from "react";

interface DraggableAppointmentProps {
  id: number;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: (e: React.MouseEvent) => void;
}

export const DraggableAppointment = memo(({ 
  id, 
  children, 
  className, 
  style, 
  onClick 
}: DraggableAppointmentProps) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
  });

  const dragStyle = {
    ...style,
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
  };

  return (
    <div
      ref={setNodeRef}
      className={cn(className, isDragging && "z-50")}
      style={dragStyle}
      {...listeners}
      {...attributes}
      onClick={(e) => {
        // Only trigger click if not dragging
        if (!isDragging && onClick) {
          onClick(e);
        }
      }}
    >
      {children}
    </div>
  );
});

DraggableAppointment.displayName = "DraggableAppointment";
