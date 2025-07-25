
import { ArrowLeft, Star, Calendar, Phone, Mail, Gift, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CustomerEnhanced } from "@/stores/useSalonStore";
import { formatCurrency } from "@/lib/currencyUtils";

interface CustomerDetailsProps {
  customer: CustomerEnhanced;
  onBack: () => void;
}

export const CustomerDetails = ({ customer, onBack }: CustomerDetailsProps) => {
  const getMemberLevelColor = (level: string) => {
    switch (level) {
      case "VVIP":
        return "bg-purple-100 text-purple-800";
      case "VIP":
        return "bg-yellow-100 text-yellow-800";
      case "Thành viên":
        return "bg-blue-100 text-blue-800";
      case "Mới":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getNextLevelPoints = (currentLevel: string) => {
    switch (currentLevel) {
      case "Mới":
        return 100;
      case "Thành viên":
        return 500;
      case "VIP":
        return 1000;
      default:
        return null;
    }
  };

  const nextLevelPoints = getNextLevelPoints(customer.memberLevel);
  const pointsToNext = nextLevelPoints ? nextLevelPoints - customer.points : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          onClick={onBack}
          className="p-2"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-800">{customer.name}</h1>
          <p className="text-gray-600 mt-1">Thông tin chi tiết khách hàng</p>
        </div>
      </div>

      {/* Customer Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Avatar className="w-16 h-16">
                <AvatarFallback className="bg-pink-100 text-pink-600 text-xl">
                  {customer.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">{customer.name}</h3>
                <Badge className={getMemberLevelColor(customer.memberLevel)}>
                  {customer.memberLevel}
                </Badge>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>Tham gia: {new Date(customer.joinDate).toLocaleDateString('vi-VN')}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-gray-400" />
                <span>{customer.phone}</span>
              </div>
              {customer.email && (
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span>{customer.email}</span>
                </div>
              )}
              {customer.birthday && (
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>Sinh nhật: {new Date(customer.birthday).toLocaleDateString('vi-VN')}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Điểm tích lũy</span>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="text-xl font-bold text-yellow-600">{customer.points}</span>
                </div>
              </div>
              {nextLevelPoints && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Đến cấp độ tiếp theo</span>
                    <span>{pointsToNext} điểm</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-500 h-2 rounded-full" 
                      style={{ width: `${(customer.points / nextLevelPoints) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tổng chi tiêu</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(customer.totalSpent)}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Số lần đến</p>
                <p className="text-2xl font-bold text-blue-600">{customer.visitCount}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Lần cuối đến</p>
                <p className="text-lg font-bold text-purple-600">
                  {customer.lastVisit ? new Date(customer.lastVisit).toLocaleDateString('vi-VN') : 'Chưa có'}
                </p>
              </div>
              <Gift className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Visit History */}
      <Card>
        <CardHeader>
          <CardTitle>Lịch sử đến tiệm</CardTitle>
        </CardHeader>
        <CardContent>
          {customer.visitHistory.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ngày</TableHead>
                  <TableHead>Dịch vụ</TableHead>
                  <TableHead>Số tiền</TableHead>
                  <TableHead>Điểm tích lũy</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customer.visitHistory.map((visit) => (
                  <TableRow key={visit.id}>
                    <TableCell>
                      {new Date(visit.date).toLocaleDateString('vi-VN')}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {visit.services.map((service, index) => (
                          <div key={index} className="text-sm">
                            {service}
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-green-600">
                      {formatCurrency(visit.amount)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span className="text-yellow-600">+{visit.pointsEarned}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Chưa có lịch sử đến tiệm</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
