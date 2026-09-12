import React, { useState, useEffect } from 'react';
import {
  AppState,
  Property,
  Tenant,
  Contract,
  Invoice,
  Payment,
  Expense,
  Issue,
  PropertyDocument,
  LandlordSettings,
} from './types';
import {
  loadStoredState,
  saveStoredState,
  exportStateAsJson,
} from './utils/storage';
import { initialData } from './data/initialData';

// Components
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { PropertiesView } from './components/PropertiesView';
import { TenantsView } from './components/TenantsView';
import { ContractsView } from './components/ContractsView';
import { InvoicesView } from './components/InvoicesView';
import { PaymentsView } from './components/PaymentsView';
import { ExpensesView } from './components/ExpensesView';
import { IssuesView } from './components/IssuesView';
import { DocumentsView } from './components/DocumentsView';
import { ReportsView } from './components/ReportsView';
import { SettingsView } from './components/SettingsView';
import { InvoicePrintModal } from './components/InvoicePrintModal';

export default function App() {
  const [state, setState] = useState<AppState>(() => loadStoredState());
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('all');
  const [printInvoiceId, setPrintInvoiceId] = useState<string | null>(null);

  // Auto-persist state changes
  useEffect(() => {
    saveStoredState(state);
  }, [state]);

  // Quick backup handler
  const handleQuickBackup = () => {
    exportStateAsJson(state);
  };

  // Property handlers
  const handleSaveProperty = (prop: Property) => {
    setState((prev) => {
      const exists = prev.properties.some((p) => p.id === prop.id);
      const updated = exists
        ? prev.properties.map((p) => (p.id === prop.id ? prop : p))
        : [...prev.properties, prop];
      return { ...prev, properties: updated };
    });
  };

  const handleDeleteProperty = (id: string) => {
    setState((prev) => ({
      ...prev,
      properties: prev.properties.filter((p) => p.id !== id),
    }));
    if (selectedPropertyId === id) {
      setSelectedPropertyId('all');
    }
  };

  // Tenant handlers
  const handleSaveTenant = (ten: Tenant) => {
    setState((prev) => {
      const exists = prev.tenants.some((t) => t.id === ten.id);
      const updated = exists
        ? prev.tenants.map((t) => (t.id === ten.id ? ten : t))
        : [...prev.tenants, ten];
      return { ...prev, tenants: updated };
    });
  };

  const handleDeleteTenant = (id: string) => {
    setState((prev) => ({
      ...prev,
      tenants: prev.tenants.filter((t) => t.id !== id),
    }));
  };

  // Contract handlers
  const handleSaveContract = (cont: Contract) => {
    setState((prev) => {
      const exists = prev.contracts.some((c) => c.id === cont.id);
      const updated = exists
        ? prev.contracts.map((c) => (c.id === cont.id ? cont : c))
        : [...prev.contracts, cont];

      // If active contract, also ensure the property's status is set to 'alquilado'
      const updatedProperties = prev.properties.map((p) => {
        if (p.id === cont.propertyId) {
          return {
            ...p,
            status: cont.status === 'activo' ? ('alquilado' as const) : p.status,
            currentRent: cont.monthlyRent,
          };
        }
        return p;
      });

      return { ...prev, contracts: updated, properties: updatedProperties };
    });
  };

  const handleDeleteContract = (id: string) => {
    setState((prev) => ({
      ...prev,
      contracts: prev.contracts.filter((c) => c.id !== id),
    }));
  };

  // Invoice handlers
  const handleSaveInvoice = (inv: Invoice) => {
    setState((prev) => {
      const exists = prev.invoices.some((i) => i.id === inv.id);
      const updatedInvoices = exists
        ? prev.invoices.map((i) => (i.id === inv.id ? inv : i))
        : [inv, ...prev.invoices];

      // Update next sequence number
      const updatedSettings = { ...prev.settings };
      if (!exists) {
        if (inv.type === 'factura') {
          updatedSettings.nextInvoiceSeq = (prev.settings.nextInvoiceSeq || 1) + 1;
        } else {
          updatedSettings.nextReceiptSeq = (prev.settings.nextReceiptSeq || 1) + 1;
        }
      }

      return {
        ...prev,
        invoices: updatedInvoices,
        settings: updatedSettings,
      };
    });
  };

  const handleDeleteInvoice = (id: string) => {
    setState((prev) => ({
      ...prev,
      invoices: prev.invoices.filter((i) => i.id !== id),
    }));
  };

  const handleMarkAsPaid = (invoiceId: string) => {
    setState((prev) => {
      const target = prev.invoices.find((i) => i.id === invoiceId);
      if (!target) return prev;

      const updatedInvoices = prev.invoices.map((inv) =>
        inv.id === invoiceId
          ? { ...inv, status: 'cobrado' as const, paidAmount: inv.totalAmount }
          : inv
      );

      // Automatically register a payment entry
      const newPayment: Payment = {
        id: 'pay-' + Date.now(),
        invoiceId: target.id,
        propertyId: target.propertyId,
        tenantId: target.tenantId,
        date: new Date().toISOString().split('T')[0],
        amount: target.totalAmount,
        paymentMethod: target.paymentMethod,
        status: 'cobrado',
        reference: `REC-${target.number}`,
        notes: `Liquidación directa de ${target.type} ${target.number}`,
      };

      return {
        ...prev,
        invoices: updatedInvoices,
        payments: [newPayment, ...prev.payments],
      };
    });
  };

  // Mass generate receipts for active contracts
  const handleMassGenerateReceipts = () => {
    const today = new Date();
    const currentMonthYear = today.toLocaleString('es-ES', {
      month: 'long',
      year: 'numeric',
    });
    const issueDateStr = today.toISOString().split('T')[0];
    const dueDate = new Date(today);
    dueDate.setDate(today.getDate() + 5);
    const dueDateStr = dueDate.toISOString().split('T')[0];

    let createdCount = 0;
    const newInvoices: Invoice[] = [];
    let curReceiptSeq = state.settings.nextReceiptSeq || 1;
    let curInvoiceSeq = state.settings.nextInvoiceSeq || 1;

    state.contracts
      .filter((c) => c.status === 'activo')
      .forEach((contract) => {
        const prop = state.properties.find((p) => p.id === contract.propertyId);
        if (!prop) return;

        // Check if invoice already issued this month for this contract
        const alreadyIssued = state.invoices.some((inv) => {
          return (
            inv.contractId === contract.id &&
            inv.issueDate.startsWith(issueDateStr.substring(0, 7))
          );
        });

        if (alreadyIssued) return;

        const isCommercial = prop.type === 'local' || prop.type === 'oficina';
        const type = isCommercial ? 'factura' : 'recibo';
        const num = isCommercial
          ? `${state.settings.invoicePrefix}${String(curInvoiceSeq).padStart(3, '0')}`
          : `${state.settings.receiptPrefix}${String(curReceiptSeq).padStart(3, '0')}`;

        if (isCommercial) curInvoiceSeq++;
        else curReceiptSeq++;

        const base = contract.monthlyRent;
        const vatP = isCommercial ? 21 : 0;
        const retP = isCommercial ? 19 : 0;
        const vatAmount = (base * vatP) / 100;
        const retAmount = (base * retP) / 100;
        const total = base + vatAmount - retAmount;

        newInvoices.push({
          id: 'inv-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
          number: num,
          type: type as 'recibo' | 'factura',
          propertyId: prop.id,
          tenantId: contract.tenantId,
          contractId: contract.id,
          issueDate: issueDateStr,
          dueDate: dueDateStr,
          concept: `Renta de arrendamiento - Mes de ${currentMonthYear}`,
          baseAmount: base,
          vatPercent: vatP,
          vatAmount: vatAmount,
          retentionPercent: retP,
          retentionAmount: retAmount,
          totalAmount: total,
          status: 'pendiente',
          paidAmount: 0,
          paymentMethod: isCommercial ? 'domiciliacion' : 'transferencia',
          notes: isCommercial
            ? 'Factura sujeta a IVA y retención IRPF.'
            : 'Recibo de alquiler vivienda exento de IVA según Art. 20 Ley 37/1992.',
        });

        createdCount++;
      });

    if (createdCount > 0) {
      setState((prev) => ({
        ...prev,
        invoices: [...newInvoices, ...prev.invoices],
        settings: {
          ...prev.settings,
          nextReceiptSeq: curReceiptSeq,
          nextInvoiceSeq: curInvoiceSeq,
        },
      }));
      alert(`¡Se han generado ${createdCount} recibos/facturas correspondientes a este mes con éxito!`);
      setActiveTab('invoices');
    } else {
      alert('Todos los contratos activos ya tienen sus recibos/facturas emitidos para este mes.');
    }
  };

  // Payment handlers
  const handleSavePayment = (pay: Payment) => {
    setState((prev) => ({
      ...prev,
      payments: [pay, ...prev.payments],
    }));
  };

  const handleDeletePayment = (id: string) => {
    setState((prev) => ({
      ...prev,
      payments: prev.payments.filter((p) => p.id !== id),
    }));
  };

  // Expense handlers
  const handleSaveExpense = (exp: Expense) => {
    setState((prev) => ({
      ...prev,
      expenses: [exp, ...prev.expenses],
    }));
  };

  const handleDeleteExpense = (id: string) => {
    setState((prev) => ({
      ...prev,
      expenses: prev.expenses.filter((e) => e.id !== id),
    }));
  };

  // Issue handlers
  const handleSaveIssue = (issue: Issue) => {
    setState((prev) => {
      const exists = prev.issues.some((i) => i.id === issue.id);
      const updated = exists
        ? prev.issues.map((i) => (i.id === issue.id ? issue : i))
        : [issue, ...prev.issues];
      return { ...prev, issues: updated };
    });
  };

  const handleDeleteIssue = (id: string) => {
    setState((prev) => ({
      ...prev,
      issues: prev.issues.filter((i) => i.id !== id),
    }));
  };

  // Document handlers
  const handleSaveDocument = (doc: PropertyDocument) => {
    setState((prev) => ({
      ...prev,
      documents: [doc, ...prev.documents],
    }));
  };

  const handleDeleteDocument = (id: string) => {
    setState((prev) => ({
      ...prev,
      documents: prev.documents.filter((d) => d.id !== id),
    }));
  };

  // Settings & Demo handlers
  const handleSaveSettings = (newSettings: LandlordSettings) => {
    setState((prev) => ({
      ...prev,
      settings: newSettings,
    }));
  };

  const handleRestoreState = (restored: AppState) => {
    setState(restored);
  };

  const handleResetToDemo = () => {
    setState(initialData);
  };

  // Modal print target
  const activePrintInvoice = state.invoices.find((i) => i.id === printInvoiceId) || null;
  const activePrintProperty = activePrintInvoice
    ? state.properties.find((p) => p.id === activePrintInvoice.propertyId)
    : undefined;
  const activePrintTenant = activePrintInvoice
    ? state.tenants.find((t) => t.id === activePrintInvoice.tenantId)
    : undefined;

  // Notification counts
  const pendingInvoicesCount = state.invoices.filter(
    (i) => i.status === 'pendiente' || i.status === 'vencido'
  ).length;
  const openIssuesCount = state.issues.filter(
    (i) => i.status === 'abierta' || i.status === 'en_gestion'
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Navigation Header Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        properties={state.properties}
        selectedPropertyId={selectedPropertyId}
        setSelectedPropertyId={setSelectedPropertyId}
        onQuickBackup={handleQuickBackup}
        pendingInvoicesCount={pendingInvoicesCount}
        openIssuesCount={openIssuesCount}
      />

      {/* Main Content View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            state={state}
            selectedPropertyId={selectedPropertyId}
            setActiveTab={setActiveTab}
            onOpenGenerateInvoices={handleMassGenerateReceipts}
            onOpenNewExpense={() => setActiveTab('expenses')}
            onOpenNewIssue={() => setActiveTab('issues')}
            onSelectInvoiceForPrint={(invId) => setPrintInvoiceId(invId)}
          />
        )}

        {activeTab === 'properties' && (
          <PropertiesView
            properties={
              selectedPropertyId === 'all'
                ? state.properties
                : state.properties.filter((p) => p.id === selectedPropertyId)
            }
            tenants={state.tenants}
            contracts={state.contracts}
            onSaveProperty={handleSaveProperty}
            onDeleteProperty={handleDeleteProperty}
            onSelectPropertyFilter={(id) => {
              setSelectedPropertyId(id);
              setActiveTab('dashboard');
            }}
          />
        )}

        {activeTab === 'tenants' && (
          <TenantsView
            tenants={state.tenants}
            properties={state.properties}
            contracts={state.contracts}
            onSaveTenant={handleSaveTenant}
            onDeleteTenant={handleDeleteTenant}
          />
        )}

        {activeTab === 'contracts' && (
          <ContractsView
            contracts={
              selectedPropertyId === 'all'
                ? state.contracts
                : state.contracts.filter((c) => c.propertyId === selectedPropertyId)
            }
            properties={state.properties}
            tenants={state.tenants}
            onSaveContract={handleSaveContract}
            onDeleteContract={handleDeleteContract}
          />
        )}

        {activeTab === 'invoices' && (
          <InvoicesView
            invoices={
              selectedPropertyId === 'all'
                ? state.invoices
                : state.invoices.filter((i) => i.propertyId === selectedPropertyId)
            }
            properties={state.properties}
            tenants={state.tenants}
            contracts={state.contracts}
            settings={state.settings}
            onSaveInvoice={handleSaveInvoice}
            onDeleteInvoice={handleDeleteInvoice}
            onMarkAsPaid={handleMarkAsPaid}
            onOpenPrintModal={(inv) => setPrintInvoiceId(inv.id)}
            onMassGenerateReceipts={handleMassGenerateReceipts}
          />
        )}

        {activeTab === 'payments' && (
          <PaymentsView
            payments={
              selectedPropertyId === 'all'
                ? state.payments
                : state.payments.filter((p) => p.propertyId === selectedPropertyId)
            }
            properties={state.properties}
            tenants={state.tenants}
            onSavePayment={handleSavePayment}
            onDeletePayment={handleDeletePayment}
          />
        )}

        {activeTab === 'expenses' && (
          <ExpensesView
            expenses={
              selectedPropertyId === 'all'
                ? state.expenses
                : state.expenses.filter((e) => e.propertyId === selectedPropertyId)
            }
            properties={state.properties}
            onSaveExpense={handleSaveExpense}
            onDeleteExpense={handleDeleteExpense}
          />
        )}

        {activeTab === 'issues' && (
          <IssuesView
            issues={
              selectedPropertyId === 'all'
                ? state.issues
                : state.issues.filter((i) => i.propertyId === selectedPropertyId)
            }
            properties={state.properties}
            onSaveIssue={handleSaveIssue}
            onDeleteIssue={handleDeleteIssue}
          />
        )}

        {activeTab === 'documents' && (
          <DocumentsView
            documents={
              selectedPropertyId === 'all'
                ? state.documents
                : state.documents.filter((d) => d.propertyId === selectedPropertyId)
            }
            properties={state.properties}
            onSaveDocument={handleSaveDocument}
            onDeleteDocument={handleDeleteDocument}
          />
        )}

        {activeTab === 'reports' && (
          <ReportsView state={state} />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            settings={state.settings}
            onSaveSettings={handleSaveSettings}
            fullState={state}
            onRestoreState={handleRestoreState}
            onResetToDemo={handleResetToDemo}
          />
        )}
      </main>

      {/* Official Receipt / Invoice Print Modal */}
      {printInvoiceId && (
        <InvoicePrintModal
          invoice={activePrintInvoice}
          property={activePrintProperty}
          tenant={activePrintTenant}
          settings={state.settings}
          onClose={() => setPrintInvoiceId(null)}
        />
      )}

      {/* Footer */}
      <footer className="mt-auto py-4 border-t border-slate-200/80 bg-white text-center text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-[#0b4f8a]">ANSAMA</span>
            <span>· Sistema Privado de Gestión de Inmuebles</span>
          </div>
          <div className="flex items-center space-x-4 text-[11px]">
            <span>Cartera: {state.properties.length} inmuebles</span>
            <span>·</span>
            <span>Inquilinos: {state.tenants.length}</span>
            <span>·</span>
            <button
              onClick={handleQuickBackup}
              className="text-[#0b4f8a] hover:underline font-semibold"
            >
              Exportar Copia de Seguridad JSON
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
