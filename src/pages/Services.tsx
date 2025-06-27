
import { useState } from "react";
import { Scissors, Plus, Search, Clock, DollarSign, Eye, Edit, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const Services = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const services = [
    {
      id: 1,
      name: "Basic Manicure",
      category: "Manicure",
      duration: "45 phút",
      price: "200.000đ",
      description: "Cắt móng, dũa móng, đẩy lõi",
      popularity: "Cao",
    },
    {
      id: 2,
      name: "Gel Polish",
      category: "Sơn gel",
      duration: "60 phút",
      price: "300.000đ",
      description: "Sơn gel bền màu, không bong tróc",
      popularity: "Rất cao",
    },
    {
      id: 3,
      name: "Nail Art",
      category: "Nail Art",
      duration: "90 phút",
      price: "450.000đ",
      description: "Vẽ họa tiết, trang trí móng tay",
      popularity: "Cao",
    },
    {
      id: 4,
      name: "Pedicure Deluxe",
      category: "Pedicure",
      duration: "75 phút",
      price: "350.000đ",
      description: "Chăm sóc móng chân toàn diện",
      popularity: "Trung bình",
    },
    {
      id: 5,
      name: "Nail Extension",
      category: "Nối móng",
      duration: "120 phút",
      price: "600.000đ",
      description: "Nối móng acrylic hoặc gel",
      popularity: "Cao",
    },
    {
      id: 6,
      name: "Spa Manicure",
      category: "Spa",
      duration: "90 phút",
      price: "400.000đ",
      description: "Manicure kết hợp spa thư giãn",
      popularity: "Trung bình",
    },
  ];

  const categories = ["Tất cả", "Manicure", "Pedicure", "Sơn gel", "Nail Art", "Nối móng", "Spa"];

  const filteredServices = services.filter(
    (service) =>
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPopularityColor = (popularity: string) => {
    switch (popularity) {
      case "Rất cao":
        return "bg-red-100 text-red-800";
      case "Cao":
        return "bg-orange-100 text-orange-800";
      case "Trung bình":
        return "bg-yellow-100 text-yellow-800";
      case "Thấp":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Quản lý Dịch Vụ</h1>
          <p className="text-gray-600 mt-1">Quản lý danh mục và giá dịch vụ</p>
        </div>
        <Button className="bg-pink-600 hover:bg-pink-700">
          <Plus className="w-4 h-4 mr-2" />
          Thêm dịch vụ
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tổng dịch vụ</p>
                <p className="text-2xl font-bold text-gray-800">15</p>
              </div>
              <Scissors className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Dịch vụ phổ biến</p>
                <p className="text-2xl font-bold text-pink-600">Gel Polish</p>
              </div>
              <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
                <Scissors className="w-5 h-5 text-pink-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Giá trung bình</p>
                <p className="text-2xl font-bold text-green-600">380K</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Thời gian TB</p>
                <p className="text-2xl font-bold text-blue-600">75p</p>
              </div>
              <Clock className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Categories */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Tìm kiếm dịch vụ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant="outline"
                  size="sm"
                  className="text-sm"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Services Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách dịch vụ</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên dịch vụ</TableHead>
                <TableHead>Danh mục</TableHead>
                <TableHead>Thời gian</TableHead>
                <TableHead>Giá tiền</TableHead>
                <TableHead>Độ phổ biến</TableHead>
                <TableHead>Mô tả</TableHead>
                <TableHead>Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredServices.map((service) => (
                <TableRow key={service.id}>
                  <TableCell className="font-medium">{service.name}</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                      {service.category}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span>{service.duration}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-green-600">
                    {service.price}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPopularityColor(service.popularity)}`}>
                      {service.popularity}
                    </span>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {service.description}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Services;
