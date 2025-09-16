
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface InvoiceItem {
  id: string;
  serviceId: string;
  serviceName: string;
  price: number;
  duration: number;
  employeeId: string;
  employeeName: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  total: number;
  status: 'paid' | 'unpaid' | 'cancelled';
  paymentMethod?: 'cash' | 'card' | 'transfer';
  notes?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

interface InvoiceState {
  invoices: Invoice[];
  nextInvoiceId: number;
  
  // Actions
  addInvoice: (invoice: Omit<Invoice, 'id' | 'invoiceNumber' | 'createdAt' | 'updatedAt'>) => Invoice;
  updateInvoice: (id: string, invoice: Partial<Invoice>) => void;
  deleteInvoice: (id: string) => void;
  updateInvoiceStatus: (id: string, status: Invoice['status']) => void;
  
  // Utility functions
  generateInvoiceNumber: () => string;
  getTotalRevenue: (startDate?: string, endDate?: string) => number;
  getInvoicesByDateRange: (startDate: string, endDate: string) => Invoice[];
  getInvoicesByCustomer: (customerId: string) => Invoice[];
}

const initialInvoices: Invoice[] = [
  {
    id: "1",
    invoiceNumber: "INV-2024-001",
    customerId: "1",
    customerName: "Nguyễn Thị Lan",
    customerPhone: "0901234567",
    items: [
      {
        id: "1",
        serviceId: "1",
        serviceName: "Gel Polish + Nail Art",
        price: 450000,
        duration: 90,
        employeeId: "1",
        employeeName: "Mai Nguyễn"
      }
    ],
    subtotal: 450000,
    discount: 0,
    total: 450000,
    status: "paid",
    paymentMethod: "cash",
    createdAt: "2024-06-25T10:00:00Z",
    updatedAt: "2024-06-25T10:00:00Z"
  },
  {
    id: "2",
    invoiceNumber: "INV-2024-002",
    customerId: "2",
    customerName: "Trần Minh Anh",
    customerPhone: "0987654321",
    items: [
      {
        id: "2",
        serviceId: "2",
        serviceName: "Manicure + Pedicure",
        price: 380000,
        duration: 120,
        employeeId: "2",
        employeeName: "Linh Trần"
      }
    ],
    subtotal: 380000,
    discount: 20000,
    total: 360000,
    status: "unpaid",
    createdAt: "2024-06-26T14:30:00Z",
    updatedAt: "2024-06-26T14:30:00Z"
  },
  {
    id: "3",
    invoiceNumber: "INV-2024-003",
    customerId: "3",
    customerName: "Lê Hoài An",
    customerPhone: "0912345678",
    items: [
      {
        id: "3",
        serviceId: "3",
        serviceName: "French Manicure",
        price: 200000,
        duration: 60,
        employeeId: "1",
        employeeName: "Mai Nguyễn"
      },
      {
        id: "4",
        serviceId: "4",
        serviceName: "Pedicure cơ bản",
        price: 150000,
        duration: 45,
        employeeId: "3",
        employeeName: "Hoa Phạm"
      }
    ],
    subtotal: 350000,
    discount: 0,
    total: 350000,
    status: "paid",
    paymentMethod: "card",
    createdAt: "2024-06-27T09:15:00Z",
    updatedAt: "2024-06-27T09:15:00Z"
  },
  {
    id: "4",
    invoiceNumber: "INV-2024-004",
    customerId: "4",
    customerName: "Phạm Thị Hương",
    customerPhone: "0923456789",
    items: [
      {
        id: "5",
        serviceId: "5",
        serviceName: "Nail Extension + Design",
        price: 600000,
        duration: 150,
        employeeId: "2",
        employeeName: "Linh Trần"
      },
      {
        id: "6",
        serviceId: "6",
        serviceName: "Hand Care Treatment",
        price: 120000,
        duration: 30,
        employeeId: "2",
        employeeName: "Linh Trần"
      }
    ],
    subtotal: 720000,
    discount: 50000,
    total: 670000,
    status: "paid",
    paymentMethod: "transfer",
    notes: "Khách VIP - giảm giá đặc biệt",
    createdAt: "2024-06-28T16:20:00Z",
    updatedAt: "2024-06-28T16:20:00Z"
  },
  {
    id: "5",
    invoiceNumber: "INV-2024-005",
    customerId: "5",
    customerName: "Vũ Minh Châu",
    customerPhone: "0934567890",
    items: [
      {
        id: "7",
        serviceId: "7",
        serviceName: "Gel Polish",
        price: 180000,
        duration: 45,
        employeeId: "4",
        employeeName: "Thu Nguyễn"
      }
    ],
    subtotal: 180000,
    discount: 0,
    total: 180000,
    status: "paid",
    paymentMethod: "cash",
    createdAt: "2024-06-29T11:30:00Z",
    updatedAt: "2024-06-29T11:30:00Z"
  },
  {
    id: "6",
    invoiceNumber: "INV-2024-006",
    customerId: "1",
    customerName: "Nguyễn Thị Lan",
    customerPhone: "0901234567",
    items: [
      {
        id: "8",
        serviceId: "8",
        serviceName: "Nail Art Premium",
        price: 300000,
        duration: 90,
        employeeId: "1",
        employeeName: "Mai Nguyễn"
      },
      {
        id: "9",
        serviceId: "9",
        serviceName: "Cuticle Care",
        price: 80000,
        duration: 20,
        employeeId: "3",
        employeeName: "Hoa Phạm"
      }
    ],
    subtotal: 380000,
    discount: 30000,
    total: 350000,
    status: "paid",
    paymentMethod: "card",
    notes: "Khách quen - ưu đãi thành viên",
    createdAt: "2024-07-01T13:45:00Z",
    updatedAt: "2024-07-01T13:45:00Z"
  },
  {
    id: "7",
    invoiceNumber: "INV-2024-007",
    customerId: "6",
    customerName: "Đỗ Thị Mai",
    customerPhone: "0945678901",
    items: [
      {
        id: "10",
        serviceId: "10",
        serviceName: "Spa Pedicure",
        price: 250000,
        duration: 75,
        employeeId: "2",
        employeeName: "Linh Trần"
      },
      {
        id: "11",
        serviceId: "11",
        serviceName: "Foot Massage",
        price: 100000,
        duration: 30,
        employeeId: "4",
        employeeName: "Thu Nguyễn"
      }
    ],
    subtotal: 350000,
    discount: 0,
    total: 350000,
    status: "unpaid",
    createdAt: "2024-07-02T15:00:00Z",
    updatedAt: "2024-07-02T15:00:00Z"
  },
  {
    id: "8",
    invoiceNumber: "INV-2024-008",
    customerId: "7",
    customerName: "Bùi Thị Lan Anh",
    customerPhone: "0956789012",
    items: [
      {
        id: "12",
        serviceId: "12",
        serviceName: "Acrylic Nails",
        price: 500000,
        duration: 120,
        employeeId: "1",
        employeeName: "Mai Nguyễn"
      }
    ],
    subtotal: 500000,
    discount: 0,
    total: 500000,
    status: "paid",
    paymentMethod: "cash",
    createdAt: "2024-07-03T10:30:00Z",
    updatedAt: "2024-07-03T10:30:00Z"
  },
  {
    id: "9",
    invoiceNumber: "INV-2024-009",
    customerId: "8",
    customerName: "Ngô Thị Hạnh",
    customerPhone: "0967890123",
    items: [
      {
        id: "13",
        serviceId: "1",
        serviceName: "Gel Polish + Nail Art",
        price: 450000,
        duration: 90,
        employeeId: "3",
        employeeName: "Hoa Phạm"
      },
      {
        id: "14",
        serviceId: "2",
        serviceName: "Manicure + Pedicure",
        price: 380000,
        duration: 120,
        employeeId: "2",
        employeeName: "Linh Trần"
      },
      {
        id: "15",
        serviceId: "13",
        serviceName: "Nail Strengthening Treatment",
        price: 150000,
        duration: 30,
        employeeId: "4",
        employeeName: "Thu Nguyễn"
      }
    ],
    subtotal: 980000,
    discount: 100000,
    total: 880000,
    status: "paid",
    paymentMethod: "transfer",
    notes: "Combo đặc biệt - 3 dịch vụ",
    createdAt: "2024-07-04T14:15:00Z",
    updatedAt: "2024-07-04T14:15:00Z"
  },
  {
    id: "10",
    invoiceNumber: "INV-2024-010",
    customerId: "2",
    customerName: "Trần Minh Anh",
    customerPhone: "0987654321",
    items: [
      {
        id: "16",
        serviceId: "14",
        serviceName: "Nail Repair",
        price: 120000,
        duration: 40,
        employeeId: "1",
        employeeName: "Mai Nguyễn"
      }
    ],
    subtotal: 120000,
    discount: 0,
    total: 120000,
    status: "cancelled",
    notes: "Khách hủy do bận việc đột xuất",
    createdAt: "2024-07-05T08:00:00Z",
    updatedAt: "2024-07-05T08:30:00Z"
  }
];

export const useInvoiceStore = create<InvoiceState>()(
  persist(
    (set, get) => ({
      invoices: [...initialInvoices],
      nextInvoiceId: 11,
      
      addInvoice: (invoiceData) => {
        const state = get();
        const now = new Date().toISOString();
        const invoiceNumber = state.generateInvoiceNumber();
        
        const newInvoice: Invoice = {
          ...invoiceData,
          id: state.nextInvoiceId.toString(),
          invoiceNumber,
          createdAt: now,
          updatedAt: now
        };
        
        set((state) => ({
          invoices: [...state.invoices, newInvoice],
          nextInvoiceId: state.nextInvoiceId + 1
        }));
        
        return newInvoice;
      },
      
      updateInvoice: (id, invoiceData) => set((state) => ({
        invoices: state.invoices.map(invoice =>
          invoice.id === id
            ? { ...invoice, ...invoiceData, updatedAt: new Date().toISOString() }
            : invoice
        )
      })),
      
      deleteInvoice: (id) => set((state) => ({
        invoices: state.invoices.filter(invoice => invoice.id !== id)
      })),
      
      updateInvoiceStatus: (id, status) => set((state) => ({
        invoices: state.invoices.map(invoice =>
          invoice.id === id
            ? { ...invoice, status, updatedAt: new Date().toISOString() }
            : invoice
        )
      })),
      
      generateInvoiceNumber: () => {
        const state = get();
        const year = new Date().getFullYear();
        const nextNumber = state.nextInvoiceId.toString().padStart(3, '0');
        return `INV-${year}-${nextNumber}`;
      },
      
      getTotalRevenue: (startDate, endDate) => {
        const state = get();
        let filteredInvoices = state.invoices.filter(invoice => invoice.status === 'paid');
        
        if (startDate) {
          filteredInvoices = filteredInvoices.filter(invoice => invoice.createdAt >= startDate);
        }
        if (endDate) {
          filteredInvoices = filteredInvoices.filter(invoice => invoice.createdAt <= endDate);
        }
        
        return filteredInvoices.reduce((total, invoice) => total + invoice.total, 0);
      },
      
      getInvoicesByDateRange: (startDate, endDate) => {
        const state = get();
        return state.invoices.filter(invoice => 
          invoice.createdAt >= startDate && invoice.createdAt <= endDate
        ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      },
      
      getInvoicesByCustomer: (customerId) => {
        const state = get();
        return state.invoices.filter(invoice => invoice.customerId === customerId)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
    }),
    {
      name: 'invoice-storage',
    }
  )
);
