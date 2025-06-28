
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
  }
];

export const useInvoiceStore = create<InvoiceState>()(
  persist(
    (set, get) => ({
      invoices: [...initialInvoices],
      nextInvoiceId: 3,
      
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
