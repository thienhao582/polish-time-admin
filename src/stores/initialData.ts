
import { Service, Employee, CustomerEnhanced } from './types';
import { Customer, Appointment } from '@/utils/dataStore';

export const initialServices: Service[] = [
  { 
    id: "1", 
    name: "Gel Polish + Nail Art", 
    description: "Sơn gel bền màu kết hợp với nail art tùy chỉnh theo yêu cầu",
    category: "Nail Art",
    duration: 90, 
    price: 450000,
    status: "active",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
  { 
    id: "2", 
    name: "Manicure + Pedicure", 
    description: "Chăm sóc móng tay và móng chân hoàn chỉnh bao gồm cắt, dũa, massage",
    category: "Manicure",
    duration: 120, 
    price: 380000,
    status: "active",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
  { 
    id: "3", 
    name: "Nail Extension", 
    description: "Nối móng acrylic hoặc gel với độ dài và hình dáng theo yêu cầu",
    category: "Nối móng",
    duration: 150, 
    price: 650000,
    status: "active",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
  { 
    id: "4", 
    name: "Basic Manicure", 
    description: "Cắt móng, dũa móng, đẩy lõi móng cơ bản",
    category: "Manicure",
    duration: 60, 
    price: 200000,
    status: "active",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
  { 
    id: "5", 
    name: "French Manicure", 
    description: "Sơn móng kiểu Pháp cổ điển với đầu móng trắng",
    category: "Manicure",
    duration: 75, 
    price: 280000,
    status: "inactive",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
];

// Generate 50 employees with Vietnamese names
const vietnameseFirstNames = [
  "Mai", "Linh", "Hương", "Thu", "Lan", "Anh", "Hoa", "Trang", "Ngọc", "Phương",
  "Minh", "Thảo", "Dung", "Thanh", "Nga", "Vân", "Hồng", "Yến", "Diệu", "Kim",
  "Hoài", "Xuân", "An", "Bích", "Cúc", "Đào", "Giang", "Hiền", "Khánh", "Lam",
  "My", "Nhung", "Oanh", "Phúc", "Quỳnh", "Thúy", "Uyên", "Vy", "Xuân", "Yến"
];

const vietnameseLastNames = [
  "Nguyễn", "Trần", "Lê", "Phạm", "Huỳnh", "Hoàng", "Phan", "Vũ", "Võ", "Đặng",
  "Bùi", "Đỗ", "Hồ", "Ngô", "Dương", "Lý", "Đinh", "Đào", "Cao", "Trần"
];

const roles = ["thợ"]; // Only technicians do services
const specialtiesList = [
  ["Gel Polish", "Nail Art"],
  ["Manicure", "Pedicure"],
  ["Extension", "Acrylic"],
  ["Basic Care", "French"],
  ["Design", "Crystal"],
  ["Massage", "Spa"],
  ["Color Mixing", "Art Design"],
  ["Repair", "Treatment"]
];

export const initialEmployees: Employee[] = Array.from({ length: 50 }, (_, index) => {
  const firstName = vietnameseFirstNames[Math.floor(Math.random() * vietnameseFirstNames.length)];
  const lastName = vietnameseLastNames[Math.floor(Math.random() * vietnameseLastNames.length)];
  
  // Everyone is a technician
  const role = "thợ";
  
  // Generate assigned services (2-4 services per employee)
  const serviceCount = Math.floor(Math.random() * 3) + 2; // 2-4 services
  const assignedServices = Array.from({ length: serviceCount }, () => 
    (Math.floor(Math.random() * 5) + 1).toString()
  ).filter((value, index, self) => self.indexOf(value) === index);
  
  // Generate specialties
  const specialtySet = specialtiesList[Math.floor(Math.random() * specialtiesList.length)];
  const extraSpecialties = Math.random() > 0.5 ? 
    specialtiesList[Math.floor(Math.random() * specialtiesList.length)] : [];
  const specialties = [...new Set([...specialtySet, ...extraSpecialties])];
  
  return {
    id: (index + 1).toString(),
    name: `${lastName} ${firstName}`,
    phone: `090${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
    role: role as Employee['role'],
    status: "đang làm",
    assignedServices,
    specialties,
    startDate: `2024-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
  };
});

// Generate 100 customers
const customerFirstNames = [
  "Lan", "Anh", "Hoa", "Thu", "Mai", "Linh", "Hương", "Trang", "Ngọc", "Phương",
  "Minh", "Thảo", "Dung", "Thanh", "Nga", "Vân", "Hồng", "Yến", "Diệu", "Kim",
  "Hoài", "Xuân", "An", "Bích", "Cúc", "Đào", "Giang", "Hiền", "Khánh", "Lam"
];

export const initialCustomers: Customer[] = Array.from({ length: 100 }, (_, index) => {
  const firstName = customerFirstNames[Math.floor(Math.random() * customerFirstNames.length)];
  const lastName = vietnameseLastNames[Math.floor(Math.random() * vietnameseLastNames.length)];
  
  return {
    id: (index + 1).toString(),
    name: `${lastName} Thị ${firstName}`,
    phone: `091${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`,
  };
});

// Generate appointments for last month, current month, and next month
const serviceNames = [
  "Gel Polish + Nail Art",
  "Manicure + Pedicure", 
  "Nail Extension",
  "Basic Manicure",
  "French Manicure"
];

const servicePrices = [450000, 380000, 650000, 200000, 280000];
const serviceDurations = [90, 120, 150, 60, 75];

const generateAppointmentsForMonth = (year: number, month: number, startId: number) => {
  const appointments: Appointment[] = [];
  const daysInMonth = new Date(year, month, 0).getDate();
  let currentId = startId;
  
  // Target ~100 appointments per month (3-4 per day)
  const targetAppointments = 100;
  let appointmentsCreated = 0;
  
  // Distribute appointments across days (3-4 per day)
  for (let day = 1; day <= daysInMonth && appointmentsCreated < targetAppointments; day++) {
    const appointmentsPerDay = 3 + Math.floor(Math.random() * 2); // 3-4 appointments per day
    
    for (let i = 0; i < appointmentsPerDay && appointmentsCreated < targetAppointments; i++) {
      const serviceIndex = Math.floor(Math.random() * serviceNames.length);
      const customerIndex = Math.floor(Math.random() * 100) + 1;
      
      // Find employees who can do this service (only technicians)
      const availableEmployees = initialEmployees.filter(emp => 
        emp.role === "thợ" && emp.assignedServices.includes((serviceIndex + 1).toString())
      );
      const employee = availableEmployees.length > 0 
        ? availableEmployees[Math.floor(Math.random() * availableEmployees.length)]
        : initialEmployees.filter(emp => emp.role === "thợ")[Math.floor(Math.random() * initialEmployees.filter(emp => emp.role === "thợ").length)];
      
      // Spread appointments throughout the day (8:00 - 18:00)
      const baseHour = 8 + Math.floor((i / appointmentsPerDay) * 10); // Distribute across 10 hours
      const randomOffset = Math.floor(Math.random() * 120); // Random 0-120 minutes
      const totalMinutes = baseHour * 60 + randomOffset;
      const hour = Math.min(18, Math.floor(totalMinutes / 60));
      const minute = totalMinutes % 60;
      
      const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
      
      // Get customer from our generated data
      const customer = initialCustomers[customerIndex - 1];
      
      // Determine status based on month
      let status: string;
      const currentDate = new Date();
      const appointmentDate = new Date(year, month - 1, day);
      
      if (appointmentDate < currentDate) {
        status = "completed";
      } else if (appointmentDate.getTime() - currentDate.getTime() < 24 * 60 * 60 * 1000) {
        // Today's appointments
        status = Math.random() > 0.7 ? "completed" : "confirmed";
      } else {
        status = Math.random() > 0.9 ? "cancelled" : "confirmed";
      }
      
      // Create staff salary data
      const staffSalaryData = [{
        staffId: employee.id,
        staffName: employee.name,
        serviceId: (serviceIndex + 1).toString(),
        serviceName: serviceNames[serviceIndex],
        commissionRate: 0.3,
        fixedAmount: 0,
        servicePrice: servicePrices[serviceIndex]
      }];
      
      appointments.push({
        id: currentId++,
        date,
        time,
        customer: customer.name,
        phone: customer.phone,
        service: serviceNames[serviceIndex],
        duration: `${serviceDurations[serviceIndex]} phút`,
        price: `${servicePrices[serviceIndex].toLocaleString()}đ`,
        status,
        staff: employee.name,
        customerId: customerIndex.toString(),
        serviceId: (serviceIndex + 1).toString(),
        staffId: employee.id,
        notes: Math.random() < 0.2 ? "Khách hàng VIP" : undefined,
        staffSalaryData
      });
      
      appointmentsCreated++;
    }
  }
  
  return appointments;
};

const currentDate = new Date();
const currentYear = currentDate.getFullYear();
const currentMonth = currentDate.getMonth() + 1;

// Generate appointments for 6 months: 3 months ago to 3 months from now
const generateAppointmentsForRange = () => {
  const appointments: Appointment[] = [];
  let appointmentId = 1;
  
  // Generate for 6 months: -3 to +3 from current month
  for (let monthOffset = -3; monthOffset <= 3; monthOffset++) {
    const targetDate = new Date(currentYear, currentMonth - 1 + monthOffset, 1);
    const targetYear = targetDate.getFullYear();
    const targetMonth = targetDate.getMonth() + 1;
    
    const monthAppointments = generateAppointmentsForMonth(targetYear, targetMonth, appointmentId);
    appointments.push(...monthAppointments);
    appointmentId += monthAppointments.length;
  }
  
  return appointments;
};

// Generate additional appointments for August 6th, 2025 to test scrolling
const generateAug6TestData = () => {
  const appointments: Appointment[] = [];
  let appointmentId = 5000; // Start with high ID to avoid conflicts
  
  // Create "Anyone" appointments (no specific staff assigned)
  const anyoneAppointments = [
    { time: "09:00", service: "Basic Manicure", duration: 60, price: 200000, customer: "Nguyễn Thi Lan" },
    { time: "11:00", service: "French Manicure", duration: 75, price: 280000, customer: "Trần Thi Mai" },
    { time: "14:00", service: "Gel Polish + Nail Art", duration: 90, price: 450000, customer: "Lê Thi Hoa" },
    { time: "16:30", service: "Basic Manicure", duration: 60, price: 200000, customer: "Phạm Thi Thu" },
  ];

  // Create appointments for 15 employees to test horizontal scrolling
  const employeeAppointments = [
    // Lý Dung - 3 appointments
    { staff: "Lý Dung", time: "08:00", service: "French Manicure", duration: 75, price: 280000, customer: "Huỳnh Thi Anh" },
    { staff: "Lý Dung", time: "11:00", service: "Basic Manicure", duration: 60, price: 200000, customer: "Lý Thi Hồng" },
    { staff: "Lý Dung", time: "14:30", service: "Gel Polish + Nail Art", duration: 90, price: 450000, customer: "Ngô Thi Hiền" },
    
    // Võ Hoa - 2 appointments  
    { staff: "Võ Hoa", time: "09:30", service: "Manicure + Pedicure", duration: 120, price: 380000, customer: "Đinh Thi Vy" },
    { staff: "Võ Hoa", time: "15:00", service: "Nail Extension", duration: 150, price: 650000, customer: "Bùi Thi Thanh" },
    
    // Phạm Nhung - 3 appointments
    { staff: "Phạm Nhung", time: "08:30", service: "Basic Manicure", duration: 60, price: 200000, customer: "Hồ Thi Yến" },
    { staff: "Phạm Nhung", time: "13:30", service: "French Manicure", duration: 75, price: 280000, customer: "Dương Thi Diệu" },
    { staff: "Phạm Nhung", time: "16:00", service: "Gel Polish + Nail Art", duration: 90, price: 450000, customer: "Phan Thi Kim" },
    
    // Nguyễn Thúy - 2 appointments
    { staff: "Nguyễn Thúy", time: "10:00", service: "Manicure + Pedicure", duration: 120, price: 380000, customer: "Võ Thi Hoài" },
    { staff: "Nguyễn Thúy", time: "14:00", service: "Basic Manicure", duration: 60, price: 200000, customer: "Đặng Thi Xuân" },
    
    // Cao Phương - 3 appointments
    { staff: "Cao Phương", time: "09:00", service: "Nail Extension", duration: 150, price: 650000, customer: "Lê Thi An" },
    { staff: "Cao Phương", time: "12:00", service: "French Manicure", duration: 75, price: 280000, customer: "Trần Thi Bích" },
    { staff: "Cao Phương", time: "16:30", service: "Basic Manicure", duration: 60, price: 200000, customer: "Phạm Thi Cúc" },
    
    // Đỗ Hoa - 2 appointments
    { staff: "Đỗ Hoa", time: "11:30", service: "Gel Polish + Nail Art", duration: 90, price: 450000, customer: "Huỳnh Thi Đào" },
    { staff: "Đỗ Hoa", time: "15:30", service: "Manicure + Pedicure", duration: 120, price: 380000, customer: "Hoàng Thi Giang" },
    
    // Nguyễn Trang - 3 appointments
    { staff: "Nguyễn Trang", time: "10:30", service: "French Manicure", duration: 75, price: 280000, customer: "Phan Thi Hiền" },
    { staff: "Nguyễn Trang", time: "13:00", service: "Basic Manicure", duration: 60, price: 200000, customer: "Vũ Thi Khánh" },
    { staff: "Nguyễn Trang", time: "17:00", service: "Nail Extension", duration: 150, price: 650000, customer: "Võ Thi Lam" },
    
    // Đào Bích - 2 appointments
    { staff: "Đào Bích", time: "12:00", service: "Gel Polish + Nail Art", duration: 90, price: 450000, customer: "Bùi Thi My" },
    { staff: "Đào Bích", time: "17:30", service: "Basic Manicure", duration: 60, price: 200000, customer: "Đỗ Thi Nhung" },
    
    // Huỳnh Thi Anh - 2 appointments
    { staff: "Huỳnh Thi Anh", time: "09:00", service: "Manicure + Pedicure", duration: 120, price: 380000, customer: "Hồ Thi Oanh" },
    { staff: "Huỳnh Thi Anh", time: "16:00", service: "French Manicure", duration: 75, price: 280000, customer: "Lý Thi Phúc" },
    
    // Vũ Thị Nga - 3 appointments
    { staff: "Vũ Thị Nga", time: "08:00", service: "Basic Manicure", duration: 60, price: 200000, customer: "Đinh Thi Quỳnh" },
    { staff: "Vũ Thị Nga", time: "12:30", service: "Nail Extension", duration: 150, price: 650000, customer: "Bùi Thi Thúy" },
    { staff: "Vũ Thị Nga", time: "17:00", service: "Gel Polish + Nail Art", duration: 90, price: 450000, customer: "Đặng Thi Uyên" },
    
    // Mai Linh - 2 appointments
    { staff: "Mai Linh", time: "10:00", service: "French Manicure", duration: 75, price: 280000, customer: "Hoàng Thi Vy" },
    { staff: "Mai Linh", time: "14:30", service: "Basic Manicure", duration: 60, price: 200000, customer: "Phan Thi Xuân" },
    
    // Trần Hương - 3 appointments
    { staff: "Trần Hương", time: "08:30", service: "Manicure + Pedicure", duration: 120, price: 380000, customer: "Võ Thi Yến" },
    { staff: "Trần Hương", time: "13:30", service: "Nail Extension", duration: 150, price: 650000, customer: "Vũ Thi Kim" },
    { staff: "Trần Hương", time: "16:30", service: "Basic Manicure", duration: 60, price: 200000, customer: "Đỗ Thi Hoài" },
    
    // Lê Thu - 2 appointments
    { staff: "Lê Thu", time: "11:00", service: "Gel Polish + Nail Art", duration: 90, price: 450000, customer: "Hồ Thi Xuân" },
    { staff: "Lê Thu", time: "15:00", service: "French Manicure", duration: 75, price: 280000, customer: "Lý Thi An" },
    
    // Phạm Lan - 2 appointments  
    { staff: "Phạm Lan", time: "09:30", service: "Basic Manicure", duration: 60, price: 200000, customer: "Trần Thi Bích" },
    { staff: "Phạm Lan", time: "14:00", service: "Manicure + Pedicure", duration: 120, price: 380000, customer: "Cao Thi Cúc" },
    
    // Huỳnh Anh - 3 appointments
    { staff: "Huỳnh Anh", time: "10:30", service: "Nail Extension", duration: 150, price: 650000, customer: "Phạm Thi Đào" },
    { staff: "Huỳnh Anh", time: "13:00", service: "French Manicure", duration: 75, price: 280000, customer: "Huỳnh Thi Giang" },
    { staff: "Huỳnh Anh", time: "16:00", service: "Basic Manicure", duration: 60, price: 200000, customer: "Hoàng Thi Hiền" },
  ];
  
  // Add "Anyone" appointments (no staff assigned)
  anyoneAppointments.forEach((aptData, index) => {
    const customerIndex = Math.floor(Math.random() * 100);
    const customer = initialCustomers[customerIndex];
    
    appointments.push({
      id: appointmentId + index,
      date: "2025-08-06",
      time: aptData.time,
      customer: aptData.customer,
      phone: customer.phone,
      service: aptData.service,
      duration: `${aptData.duration} phút`,
      price: `${aptData.price.toLocaleString()}đ`,
      status: Math.random() < 0.1 ? "cancelled" : Math.random() < 0.2 ? "completed" : "confirmed",
      staff: "", // Explicitly empty string for "Anyone" column
      customerId: customerIndex.toString(),
      serviceId: "1",
      staffId: "",
      notes: "Không yêu cầu nhân viên cụ thể",
      staffSalaryData: []
    });
  });
  
  appointmentId += anyoneAppointments.length;
  
  // Add employee appointments
  employeeAppointments.forEach((aptData, index) => {
    const customerIndex = Math.floor(Math.random() * 100);
    const customer = initialCustomers[customerIndex];
    
    appointments.push({
      id: appointmentId + index,
      date: "2025-08-06",
      time: aptData.time,
      customer: aptData.customer,
      phone: customer.phone,
      service: aptData.service,
      duration: `${aptData.duration} phút`,
      price: `${aptData.price.toLocaleString()}đ`,
      status: Math.random() < 0.1 ? "cancelled" : Math.random() < 0.2 ? "completed" : "confirmed",
      staff: aptData.staff,
      customerId: customerIndex.toString(),
      serviceId: "1",
      staffId: `emp${index + 1}`,
      notes: Math.random() < 0.2 ? "Khách hàng VIP" : undefined,
      staffSalaryData: [{
        staffId: `emp${index + 1}`,
        staffName: aptData.staff,
        serviceId: "1",
        serviceName: aptData.service,
        commissionRate: 0.3,
        fixedAmount: 0,
        servicePrice: aptData.price
      }]
    });
  });
  
  console.log("Generated Aug 6 test data:", appointments.length, "appointments for", 
    [...new Set(employeeAppointments.map(a => a.staff))].length, "employees + Anyone column");
  return appointments;
};

const baseAppointments = generateAppointmentsForRange();
const aug6TestData = generateAug6TestData();

export const initialAppointments: Appointment[] = [...baseAppointments, ...aug6TestData];

// Generate enhanced customers with more realistic data
export const initialEnhancedCustomers: CustomerEnhanced[] = Array.from({ length: 100 }, (_, index) => {
  const customer = initialCustomers[index];
  const visitCount = Math.floor(Math.random() * 20) + 1; // 1-20 visits
  const totalSpent = visitCount * (Math.floor(Math.random() * 500000) + 200000); // 200k-700k per visit
  const points = Math.floor(totalSpent / 10000); // 1 point per 10k spent
  
  // Calculate member level based on points
  let memberLevel: CustomerEnhanced['memberLevel'] = 'Mới';
  if (points >= 1000) memberLevel = 'VVIP';
  else if (points >= 500) memberLevel = 'VIP';
  else if (points >= 200) memberLevel = 'Thành viên';
  
  // Generate random birthday
  const birthYear = 1980 + Math.floor(Math.random() * 30); // 1980-2009
  const birthMonth = Math.floor(Math.random() * 12) + 1;
  const birthDay = Math.floor(Math.random() * 28) + 1;
  const birthday = `${birthYear}-${String(birthMonth).padStart(2, '0')}-${String(birthDay).padStart(2, '0')}`;
  
  // Generate join date
  const joinYear = 2022 + Math.floor(Math.random() * 3); // 2022-2024
  const joinMonth = Math.floor(Math.random() * 12) + 1;
  const joinDay = Math.floor(Math.random() * 28) + 1;
  const joinDate = `${joinYear}-${String(joinMonth).padStart(2, '0')}-${String(joinDay).padStart(2, '0')}`;
  
  // Generate last visit (within last 60 days)
  const lastVisitDate = new Date();
  lastVisitDate.setDate(lastVisitDate.getDate() - Math.floor(Math.random() * 60));
  const lastVisit = lastVisitDate.toISOString().split('T')[0];
  
  // Generate visit history (last 5 visits)
  const visitHistory = Array.from({ length: Math.min(visitCount, 5) }, (_, visitIndex) => {
    const visitDate = new Date();
    visitDate.setDate(visitDate.getDate() - (visitIndex * 15 + Math.floor(Math.random() * 10)));
    
    const serviceIndex = Math.floor(Math.random() * serviceNames.length);
    const amount = servicePrices[serviceIndex];
    
    return {
      id: `v${index}_${visitIndex}`,
      date: visitDate.toISOString().split('T')[0],
      services: [serviceNames[serviceIndex]],
      amount,
      pointsEarned: Math.floor(amount / 10000)
    };
  });
  
  return {
    id: (index + 1).toString(),
    name: customer.name,
    phone: customer.phone,
    email: customer.email,
    birthday: Math.random() > 0.3 ? birthday : undefined, // 70% have birthday
    points,
    memberLevel,
    totalSpent,
    visitCount,
    lastVisit,
    joinDate,
    visitHistory
  };
});
