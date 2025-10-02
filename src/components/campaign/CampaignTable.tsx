import { Campaign, CampaignStatus } from "@/stores/types/campaign";
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
import { Edit, Power, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface CampaignTableProps {
  campaigns: Campaign[];
  onEdit: (campaign: Campaign) => void;
  onToggleStatus: (id: string) => void;
  onDelete: (id: string) => void;
  getStatus: (campaign: Campaign) => CampaignStatus;
}

export function CampaignTable({
  campaigns,
  onEdit,
  onToggleStatus,
  onDelete,
  getStatus,
}: CampaignTableProps) {
  const getStatusBadge = (status: CampaignStatus, isActive: boolean) => {
    if (!isActive) {
      return <Badge variant="secondary">Tạm dừng</Badge>;
    }

    switch (status) {
      case 'upcoming':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Sắp diễn ra</Badge>;
      case 'active':
        return <Badge variant="default" className="bg-green-50 text-green-700 border-green-200">Đang diễn ra</Badge>;
      case 'expired':
        return <Badge variant="secondary">Đã kết thúc</Badge>;
      default:
        return null;
    }
  };

  const formatDiscount = (type: 'percentage' | 'fixed', value: number) => {
    if (type === 'percentage') {
      return `${value}%`;
    }
    return `${value.toLocaleString('vi-VN')}₫`;
  };

  if (campaigns.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg bg-muted/30">
        <p className="text-muted-foreground">Chưa có campaign nào</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tên Campaign</TableHead>
            <TableHead>Thời gian</TableHead>
            <TableHead>Loại giảm giá</TableHead>
            <TableHead>Giá trị giảm</TableHead>
            <TableHead>Dịch vụ áp dụng</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead className="text-right">Hành động</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {campaigns.map((campaign) => {
            const status = getStatus(campaign);
            const isExpired = status === 'expired';
            
            return (
              <TableRow key={campaign.id} className={isExpired ? 'opacity-60' : ''}>
                <TableCell className="font-medium">{campaign.name}</TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div>{format(new Date(campaign.startDate), 'dd/MM/yyyy HH:mm', { locale: vi })}</div>
                    <div className="text-muted-foreground">
                      đến {format(new Date(campaign.endDate), 'dd/MM/yyyy HH:mm', { locale: vi })}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {campaign.discountType === 'percentage' ? 'Phần trăm' : 'Cố định'}
                  </Badge>
                </TableCell>
                <TableCell className="font-semibold">
                  {formatDiscount(campaign.discountType, campaign.discountValue)}
                </TableCell>
                <TableCell>
                  <span className="text-sm">{campaign.applicableServices.length} dịch vụ</span>
                </TableCell>
                <TableCell>{getStatusBadge(status, campaign.isActive)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(campaign)}
                      disabled={isExpired}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onToggleStatus(campaign.id)}
                      disabled={isExpired}
                    >
                      <Power className={`h-4 w-4 ${campaign.isActive ? 'text-green-600' : 'text-muted-foreground'}`} />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Xóa campaign?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Bạn có chắc chắn muốn xóa campaign "{campaign.name}"? Hành động này không thể hoàn tác.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Hủy</AlertDialogCancel>
                          <AlertDialogAction onClick={() => onDelete(campaign.id)}>
                            Xóa
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
