
import { Button } from "@/components/ui/button";
import { Employee } from "@/stores/useSalonStore";

interface EmployeeFormActionsProps {
  employee?: Employee | null;
  onClose: () => void;
}

export function EmployeeFormActions({ employee, onClose }: EmployeeFormActionsProps) {
  return (
    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
      <Button type="button" variant="outline" onClick={onClose} className="px-6">
        Hủy
      </Button>
      <Button type="submit" className="bg-pink-600 hover:bg-pink-700 px-6">
        {employee ? "Cập nhật" : "Thêm nhân viên"}
      </Button>
    </div>
  );
}
