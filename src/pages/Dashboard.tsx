
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, DollarSign, TrendingUp, User, Scissors } from "lucide-react";
import { RevenueChart } from "@/components/reports/RevenueChart";
import { useSalonStore } from "@/stores/useSalonStore";
import { useInvoiceStore } from "@/stores/useInvoiceStore";
import { subDays, format } from "date-fns";
import { vi } from "date-fns/locale";
import { useLanguage } from "@/contexts/LanguageContext";

const Dashboard = () => {
  const { customers, employees, appointments } = useSalonStore();
  const { invoices } = useInvoiceStore();
  const { t } = useLanguage();

  // Calculate revenue for the last 30 days
  const thirtyDaysAgo = subDays(new Date(), 30);
  const recentInvoices = invoices.filter(invoice => {
    const invoiceDate = new Date(invoice.createdAt);
    return invoiceDate >= thirtyDaysAgo && invoice.status === 'paid';
  });
  const totalRevenue = recentInvoices.reduce((sum, invoice) => sum + invoice.total, 0);

  // Get today's appointments
  const today = format(new Date(), 'yyyy-MM-dd');
  const todayAppointments = appointments.filter(apt => 
    format(new Date(apt.date), 'yyyy-MM-dd') === today
  );

  const stats = [
    {
      title: t('dashboard.total_customers'),
      value: customers.length.toString(),
      icon: Users,
      change: "+12%",
      changeType: "positive" as const,
    },
    {
      title: t('dashboard.today_appointments'),
      value: todayAppointments.length.toString(),
      icon: Calendar,
      change: "+8%", 
      changeType: "positive" as const,
    },
    {
      title: t('dashboard.revenue_30_days'),
      value: new Intl.NumberFormat('vi-VN').format(totalRevenue) + 'đ',
      icon: DollarSign,
      change: "+23%",
      changeType: "positive" as const,
    },
    {
      title: t('dashboard.employees'),
      value: employees.length.toString(),
      icon: User,
      change: "0%",
      changeType: "neutral" as const,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">{t('dashboard.title')}</h1>
          <p className="text-gray-600 mt-1">
            {t('dashboard.subtitle')}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
              <p className="text-xs text-gray-500 mt-1">
                <span className={
                  stat.changeType === 'positive' ? 'text-green-600' : 
                  stat.changeType === 'neutral' ? 'text-gray-500' : 'text-red-600'
                }>
                  {stat.change}
                </span>
                {' '}{t('dashboard.vs_last_month')}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Revenue Chart */}
      <RevenueChart 
        period="day" 
        startDate={thirtyDaysAgo} 
        endDate={new Date()} 
      />

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>{t('dashboard.recent_appointments')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {appointments.slice(0, 5).map((appointment) => (
                <div key={appointment.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{appointment.customer}</p>
                    <p className="text-sm text-gray-600">{appointment.service}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-800">
                      {format(new Date(appointment.date), 'HH:mm')}
                    </p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(appointment.date), 'dd/MM', { locale: vi })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>{t('dashboard.quick_stats')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">{t('dashboard.most_popular_service')}</span>
                <span className="font-medium">Sơn gel</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">{t('dashboard.average_time')}</span>
                <span className="font-medium">90 phút</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">{t('dashboard.returning_customers')}</span>
                <span className="font-medium">78%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">{t('dashboard.average_rating')}</span>
                <span className="font-medium">4.8/5</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
