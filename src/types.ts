export type PropertyType = 'vivienda' | 'local' | 'garaje' | 'oficina' | 'trastero' | 'nave';
export type PropertyStatus = 'alquilado' | 'disponible' | 'en_reforma' | 'reservado';

export interface Property {
  id: string;
  name: string;
  address: string;
  postalCode: string;
  city: string;
  province: string;
  cadastralRef: string;
  type: PropertyType;
  surfaceM2: number;
  rooms?: number;
  bathrooms?: number;
  status: PropertyStatus;
  currentRent: number;
  notes?: string;
  createdAt: string;
}

export interface Tenant {
  id: string;
  name: string;
  dniNie: string;
  phone: string;
  email: string;
  iban?: string;
  emergencyContact?: string;
  notes?: string;
  createdAt: string;
}

export type ContractStatus = 'activo' | 'finalizado' | 'proximo_vencimiento' | 'cancelado';

export interface Contract {
  id: string;
  propertyId: string;
  tenantId: string;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  deposit: number; // Fianza legal
  additionalDeposit?: number; // Garantía adicional
  paymentDay: number; // Día 1-5 de cada mes
  ipcUpdateMonth?: string; // Mes de actualización IPC
  status: ContractStatus;
  notes?: string;
}

export type InvoiceType = 'recibo' | 'factura';
export type PaymentStatus = 'cobrado' | 'pendiente' | 'vencido' | 'parcial';
export type PaymentMethod = 'transferencia' | 'domiciliacion' | 'bizum' | 'efectivo' | 'tarjeta';

export interface Invoice {
  id: string;
  number: string; // ej: REC-2025-001 o FAC-2025-001
  type: InvoiceType;
  propertyId: string;
  tenantId: string;
  contractId?: string;
  issueDate: string;
  dueDate: string;
  concept: string;
  baseAmount: number;
  vatPercent: number;
  vatAmount: number;
  retentionPercent: number;
  retentionAmount: number;
  totalAmount: number;
  status: PaymentStatus;
  paidAmount: number;
  paymentMethod: PaymentMethod;
  notes?: string;
}

export interface Payment {
  id: string;
  invoiceId?: string;
  propertyId: string;
  tenantId: string;
  date: string;
  amount: number;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  reference?: string;
  notes?: string;
}

export type ExpenseCategory = 
  | 'comunidad' 
  | 'ibi' 
  | 'seguro' 
  | 'suministros' 
  | 'mantenimiento' 
  | 'basuras' 
  | 'administracion' 
  | 'hipoteca' 
  | 'otros';

export interface Expense {
  id: string;
  propertyId: string;
  category: ExpenseCategory;
  concept: string;
  date: string;
  amount: number;
  supplier?: string;
  invoiceNumber?: string;
  isDeductible: boolean;
  notes?: string;
}

export type IssuePriority = 'baja' | 'media' | 'alta' | 'urgente';
export type IssueStatus = 'abierta' | 'en_gestion' | 'resuelta' | 'cancelada';

export interface Issue {
  id: string;
  propertyId: string;
  title: string;
  description: string;
  priority: IssuePriority;
  status: IssueStatus;
  reportedDate: string;
  resolvedDate?: string;
  estimatedCost?: number;
  actualCost?: number;
  assignedTo?: string;
  notes?: string;
}

export type DocumentCategory = 
  | 'contrato' 
  | 'escritura' 
  | 'seguro' 
  | 'ibi' 
  | 'certificado_energetico' 
  | 'factura' 
  | 'cedula' 
  | 'otros';

export interface PropertyDocument {
  id: string;
  propertyId: string;
  title: string;
  category: DocumentCategory;
  date: string;
  fileName?: string;
  fileSize?: string;
  fileUrl?: string; // Data URL or mock path
  notes?: string;
}

export interface LandlordSettings {
  landlordName: string;
  landlordNif: string;
  landlordAddress: string;
  landlordCity: string;
  landlordPostalCode: string;
  landlordPhone: string;
  landlordEmail: string;
  landlordIban: string;
  defaultVat: number; // 0 para viviendas, 21 para locales
  defaultRetention: number; // 19 para locales/oficinas
  invoicePrefix: string;
  receiptPrefix: string;
  nextInvoiceSeq: number;
  nextReceiptSeq: number;
}

export interface AppState {
  properties: Property[];
  tenants: Tenant[];
  contracts: Contract[];
  invoices: Invoice[];
  payments: Payment[];
  expenses: Expense[];
  issues: Issue[];
  documents: PropertyDocument[];
  settings: LandlordSettings;
}
