
import { Calendar, Users, Scissors, DollarSign, TrendingUp, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Dashboard = () => {
  const stats = [
    {
      title: "Lịch hẹn hôm nay",
      value: "12",
      icon: Calendar,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Tổng khách hàng",
      value: "248",
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Dịch vụ",
      value: "15",
      icon: Scissors,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Doanh thu tháng",
      value: "45.2M",
      icon: DollarSign,
      color: "text-pink-600",
      bgColor: "bg-pink-50",
    },
  ];

  const upcomingAppointments = [
    {
      id: 1,
      customer: "Nguyễn Thị Lan",
      service: "Gel Polish + Art",
      time: "09:00",
      status: "confirmed",
    },
    {
      id: 2,
      customer: "Trần Minh Anh",
      service: "Manicure + Pedicure",
      time: "10:30",
      status: "pending",
    },
    {
      id: 3,
      customer: "Lê Thị Hoa",
      service: "Nail Extension",
      time: "14:00",
      status: "confirmed",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600 mt-1">Tổng quan hoạt động salon</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Appointments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-pink-600" />
              <span>Lịch hẹn sắp tới</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-800">
                      {appointment.customer}
                    </p>
                    <p className="text-sm text-gray-600">{appointment.service}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-pink-600">{appointment.time}</p>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        appointment.status === "confirmed"
                          ? "bg-green-100 text-green-600"
                          : "bg-yellow-100 text-yellow-600"
                      }`}
                    >
                      {appointment.status === "confirmed" ? "Xác nhận" : "Chờ xác nhận"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <span>Thống kê nhanh</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="text-blue-800">Lịch hẹn tuần này</span>
                <span className="font-bold text-blue-600">87</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="text-green-800">Khách hàng mới</span>
                <span className="font-bold text-green-600">23</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                <span className="text-purple-800">Dịch vụ phổ biến</span>
                <span className="font-bold text-purple-600">Gel Polish</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-pink-50 rounded-lg">
                <span className="text-pink-800">Tỷ lệ hoàn thành</span>
                <span className="font-bold text-pink-600">96%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
