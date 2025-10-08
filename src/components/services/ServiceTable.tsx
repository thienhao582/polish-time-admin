
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Clock, Edit, Trash2, Power, PowerOff } from "lucide-react";
import { Service } from "@/stores/useSalonStore";

interface ServiceTableProps {
  services: Service[];
  onEdit: (service: Service) => void;
  onDelete: (service: Service) => void;
  onToggleStatus: (service: Service) => void;
}

export const ServiceTable = ({ services, onEdit, onDelete, onToggleStatus }: ServiceTableProps) => {
  const getStatusColor = (status: string) => {
    return status === 'active' 
      ? "bg-green-100 text-green-800" 
      : "bg-gray-100 text-gray-800";
  };

  const formatPrice = (price: number) => {
    return '$' + price.toFixed(2);
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Tên dịch vụ</TableHead>
          <TableHead>Danh mục</TableHead>
          <TableHead>Thời gian</TableHead>
          <TableHead>Giá tiền</TableHead>
          <TableHead>Trạng thái</TableHead>
          <TableHead>Mô tả</TableHead>
          <TableHead>Thao tác</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {services.map((service) => (
          <TableRow key={service.id}>
            <TableCell className="font-medium">{service.name}</TableCell>
            <TableCell>
              <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                {service.category}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4 text-gray-400" />
                <span>{service.duration} phút</span>
              </div>
            </TableCell>
            <TableCell className="font-medium text-green-600">
              {formatPrice(service.price)}
            </TableCell>
            <TableCell>
              <Badge className={getStatusColor(service.status)}>
                {service.status === 'active' ? 'Đang áp dụng' : 'Ngừng áp dụng'}
              </Badge>
            </TableCell>
            <TableCell className="max-w-xs truncate">
              {service.description}
            </TableCell>
            <TableCell>
              <div className="flex space-x-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => onToggleStatus(service)}
                  className={service.status === 'active' ? 'text-orange-600' : 'text-green-600'}
                >
                  {service.status === 'active' ? 
                    <PowerOff className="w-4 h-4" /> : 
                    <Power className="w-4 h-4" />
                  }
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => onEdit(service)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-red-600"
                  onClick={() => onDelete(service)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
