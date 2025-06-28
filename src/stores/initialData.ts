
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

export const initialEmployees: Employee[] = [
  {
    id: "1",
    name: "Mai Nguyễn",
    phone: "0901234567",
    role: "thợ chính",
    status: "đang làm",
    assignedServices: ["1", "3"],
    specialties: ["Gel Polish", "Nail Art", "Extension"],
    startDate: "2024-01-15",
  },
  {
    id: "2", 
    name: "Linh Trần",
    phone: "0987654321",
    role: "thợ chính",
    status: "đang làm",
    assignedServices: ["2", "4"],
    specialties: ["Manicure", "Pedicure", "Basic Care"],
    startDate: "2024-02-01",
  },
  {
    id: "3",
    name: "Hương Lê",
    phone: "0912345678", 
    role: "phụ tá",
    status: "đang làm",
    assignedServices: ["1", "3"],
    specialties: ["Extension", "Nail Art", "Design"],
    startDate: "2024-03-10",
  },
];

export const initialCustomers: Customer[] = [
  { id: "1", name: "Nguyễn Thị Lan", phone: "0901234567", email: "lan.nguyen@email.com" },
  { id: "2", name: "Trần Minh Anh", phone: "0987654321", email: "anh.tran@email.com" },
  { id: "3", name: "Lê Thị Hoa", phone: "0912345678", email: "hoa.le@email.com" },
];

export const initialAppointments: Appointment[] = [
  {
    id: 1,
    date: "2024-06-27",
    time: "09:00",
    customer: "Nguyễn Thị Lan",
    phone: "0901234567",
    service: "Gel Polish + Nail Art",
    duration: "90 phút",
    price: "450.000đ",
    status: "confirmed",
    staff: "Mai",
    customerId: "1",
    serviceId: "1",
    staffId: "1",
  },
  {
    id: 2,
    date: "2024-06-27",
    time: "10:30",
    customer: "Trần Minh Anh",
    phone: "0987654321",
    service: "Manicure + Pedicure",
    duration: "120 phút",
    price: "380.000đ",
    status: "pending",
    staff: "Linh",
    customerId: "2",
    serviceId: "2",
    staffId: "2",
  },
  {
    id: 3,
    date: "2024-06-27",
    time: "14:00",
    customer: "Lê Thị Hoa",
    phone: "0912345678",
    service: "Nail Extension",
    duration: "150 phút",
    price: "650.000đ",
    status: "completed",
    staff: "Mai",
    customerId: "3",
    serviceId: "3",
    staffId: "1",
  },
];

export const initialEnhancedCustomers: CustomerEnhanced[] = [
  {
    id: "1",
    name: "Nguyễn Thị Lan",
    phone: "0901234567",
    email: "lan.nguyen@email.com",
    birthday: "1990-05-15",
    points: 540,
    memberLevel: "VIP",
    totalSpent: 5400000,
    visitCount: 12,
    lastVisit: "2024-06-25",
    joinDate: "2023-01-15",
    visitHistory: [
      {
        id: "v1",
        date: "2024-06-25",
        services: ["Gel Polish + Nail Art"],
        amount: 450000,
        pointsEarned: 45
      },
      {
        id: "v2", 
        date: "2024-06-10",
        services: ["Manicure + Pedicure"],
        amount: 380000,
        pointsEarned: 38
      }
    ]
  },
  {
    id: "2",
    name: "Trần Minh Anh",
    phone: "0987654321", 
    email: "anh.tran@email.com",
    birthday: "1985-08-20",
    points: 320,
    memberLevel: "Thành viên",
    totalSpent: 3200000,
    visitCount: 8,
    lastVisit: "2024-06-20",
    joinDate: "2023-03-10",
    visitHistory: [
      {
        id: "v3",
        date: "2024-06-20",
        services: ["Basic Manicure"],
        amount: 200000,
        pointsEarned: 20
      }
    ]
  },
  {
    id: "3",
    name: "Lê Thị Hoa",
    phone: "0912345678",
    email: "hoa.le@email.com", 
    birthday: "1992-12-03",
    points: 780,
    memberLevel: "VIP",
    totalSpent: 7800000,
    visitCount: 15,
    lastVisit: "2024-06-27",
    joinDate: "2022-11-20",
    visitHistory: [
      {
        id: "v4",
        date: "2024-06-27",
        services: ["Nail Extension"],
        amount: 650000,
        pointsEarned: 65
      }
    ]
  },
  {
    id: "4",
    name: "Phạm Thị Thu",
    phone: "0923456789",
    email: "thu.pham@email.com",
    points: 120,
    memberLevel: "Mới",
    totalSpent: 1200000,
    visitCount: 3,
    lastVisit: "2024-06-15",
    joinDate: "2024-05-01",
    visitHistory: [
      {
        id: "v5",
        date: "2024-06-15",
        services: ["Basic Manicure"],
        amount: 200000,
        pointsEarned: 20
      }
    ]
  }
];
