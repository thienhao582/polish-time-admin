import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import { ReactNode, memo } from "react";

interface DroppableTimeSlotProps {
  id: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  title?: string;
}

export const DroppableTimeSlot = memo(function DroppableTimeSlot({ 
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
        isOver && !disabled && "bg-primary/10 border-primary"
      )}
      onClick={onClick}
      title={title}
    >
      {children}
    </div>
  );
});
