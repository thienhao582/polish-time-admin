
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Service } from "@/stores/useSalonStore";

interface ServiceAssignmentSectionProps {
  services: Service[];
  assignedServices: string[];
  onServiceToggle: (serviceId: string, checked: boolean) => void;
}

export function ServiceAssignmentSection({ services, assignedServices, onServiceToggle }: ServiceAssignmentSectionProps) {
  return (
    <Card className="border-gray-200">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg text-gray-800">Dịch vụ được phân công</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {services.map((service) => (
            <div key={service.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
              <Checkbox
                id={`service-${service.id}`}
                checked={assignedServices.includes(service.id)}
                onCheckedChange={(checked) => onServiceToggle(service.id, checked as boolean)}
                className="data-[state=checked]:bg-pink-600 data-[state=checked]:border-pink-600"
              />
              <label htmlFor={`service-${service.id}`} className="text-sm font-medium text-gray-700 cursor-pointer">
                {service.name}
              </label>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
