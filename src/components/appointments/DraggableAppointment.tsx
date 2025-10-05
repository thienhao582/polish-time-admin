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

  const dragStyle: React.CSSProperties = {
    ...style,
    transform: transform ? CSS.Translate.toString(transform) : undefined,
    opacity: isDragging ? 0.5 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      className={cn(
        className, 
        isDragging && "z-50 opacity-50",
        "cursor-grab active:cursor-grabbing"
      )}
      style={dragStyle}
      {...attributes}
      {...listeners}
      onClick={(e) => {
        e.stopPropagation();
        if (onClick) {
          onClick(e);
        }
      }}
    >
      {children}
    </div>
  );
});

DraggableAppointment.displayName = "DraggableAppointment";
