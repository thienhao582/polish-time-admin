// IndexedDB service for demo mode
const DB_NAME = 'SalonManagementDemo';
const DB_VERSION = 1;

interface DBStores {
  users: { id: string; email: string; full_name: string; role: string; is_active: boolean; pin: string; };
  services: { id: string; name: string; price: number; duration: number; category: string; description?: string; is_active: boolean; };
  customers: { id: string; name: string; phone: string; email?: string; address?: string; };
  employees: { id: string; full_name: string; email: string; phone: string; role: string; is_active: boolean; };
  appointments: { id: string; customer_id: string; service_id: string; employee_id: string; appointment_date: string; start_time: string; end_time: string; status: string; notes?: string; total_price: number; };
  checkins: { id: string; customerNumber: string; customerName: string; status: string; checkInTime: string; date: string; tags: string[]; services?: string[]; phone?: string; waitTime?: number; notes?: string; created_at?: string; updated_at?: string; };
}

class IndexedDBService {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create stores
        if (!db.objectStoreNames.contains('users')) {
          db.createObjectStore('users', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('services')) {
          db.createObjectStore('services', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('customers')) {
          db.createObjectStore('customers', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('employees')) {
          db.createObjectStore('employees', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('appointments')) {
          db.createObjectStore('appointments', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('checkins')) {
          db.createObjectStore('checkins', { keyPath: 'id' });
        }
      };
    });
  }

  async initDemoData(): Promise<void> {
    if (!this.db) await this.init();

    // Initialize with demo data
    const demoUser = {
      id: 'demo-user-1',
      email: 'admin@example.com',
      full_name: 'Demo Admin',
      role: 'owner',
      is_active: true,
      pin: '1234'
    };

    const demoServices = [
      { id: 'service-1', name: 'Nail Art', price: 500000, duration: 60, category: 'Nail', description: 'Professional nail art service', is_active: true },
      { id: 'service-2', name: 'Manicure', price: 300000, duration: 45, category: 'Nail', description: 'Basic manicure service', is_active: true },
    ];

    const demoCustomers = [
      { id: 'customer-1', name: 'Nguyễn Thị A', phone: '0123456789', email: 'customer1@example.com' },
      { id: 'customer-2', name: 'Trần Thị B', phone: '0987654321', email: 'customer2@example.com' },
    ];

    const demoEmployees = [
      { id: 'employee-1', full_name: 'Nguyễn Văn C', email: 'employee1@example.com', phone: '0111222333', role: 'employee', is_active: true },
    ];

    await this.insertData('users', [demoUser]);
    await this.insertData('services', demoServices);
    await this.insertData('customers', demoCustomers);
    await this.insertData('employees', demoEmployees);
  }

  async insertData<T extends keyof DBStores>(storeName: T, data: DBStores[T][]): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);

      data.forEach(item => store.put(item));

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  async getData<T extends keyof DBStores>(storeName: T): Promise<DBStores[T][]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async addData<T extends keyof DBStores>(storeName: T, data: DBStores[T]): Promise<DBStores[T]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.add(data);

      request.onsuccess = () => resolve(data);
      request.onerror = () => reject(request.error);
    });
  }

  async updateData<T extends keyof DBStores>(storeName: T, id: string, updates: Partial<DBStores[T]>): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const existingData = getRequest.result;
        if (existingData) {
          const updatedData = { ...existingData, ...updates };
          const putRequest = store.put(updatedData);
          putRequest.onsuccess = () => resolve();
          putRequest.onerror = () => reject(putRequest.error);
        } else {
          reject(new Error('Data not found'));
        }
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async deleteData<T extends keyof DBStores>(storeName: T, id: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clearStore<T extends keyof DBStores>(storeName: T): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

export const indexedDBService = new IndexedDBService();