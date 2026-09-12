import { AppState } from '../types';
import { initialData } from '../data/initialData';

const STORAGE_KEY = 'ansama_property_management_v1';

export function loadStoredState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveStoredState(initialData);
      return initialData;
    }
    const parsed = JSON.parse(raw);
    // Ensure all critical root keys exist
    return {
      settings: parsed.settings || initialData.settings,
      properties: parsed.properties || [],
      tenants: parsed.tenants || [],
      contracts: parsed.contracts || [],
      invoices: parsed.invoices || [],
      payments: parsed.payments || [],
      expenses: parsed.expenses || [],
      issues: parsed.issues || [],
      documents: parsed.documents || [],
    };
  } catch (err) {
    console.error('Error loading state from localStorage:', err);
    return initialData;
  }
}

export function saveStoredState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Error saving state to localStorage:', err);
  }
}

export function exportStateAsJson(state: AppState): void {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
  const downloadAnchor = document.createElement('a');
  const dateStr = new Date().toISOString().split('T')[0];
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `ansama_backup_${dateStr}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function exportToCsv(filename: string, rows: (string | number)[][]): void {
  const csvContent = "data:text/csv;charset=utf-8," + 
    "\uFEFF" + // BOM for Excel UTF-8 support
    rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(";")).join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export function formatCurrency(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) return "0,00 €";
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateString: string | undefined | null): string {
  if (!dateString) return '-';
  try {
    const parts = dateString.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    const d = new Date(dateString);
    return d.toLocaleDateString('es-ES');
  } catch {
    return dateString;
  }
}
