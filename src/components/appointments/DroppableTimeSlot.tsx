import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface DroppableTimeSlotProps {
  id: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  title?: string;
}

export function DroppableTimeSlot({ 
  id, 
  children, 
  className, 
  onClick, 
  disabled,
  title 
}: DroppableTimeSlotProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
    disabled,
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        className,
        isOver && !disabled && "bg-blue-100 border-blue-300"
      )}
      onClick={onClick}
      title={title}
    >
      {children}
    </div>
  );
}
