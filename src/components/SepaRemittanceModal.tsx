import React, { useState } from 'react';
import { Invoice, Tenant, Property, LandlordSettings } from '../types';
import { formatCurrency, formatDate, exportToCsv } from '../utils/storage';
import { generateSepaXml, downloadSepaXmlFile, sanitizeIban } from '../utils/sepa';
import {
  FileCode2,
  Download,
  CheckCircle2,
  X,
  AlertTriangle,
  Building,
  CreditCard,
  FileSpreadsheet,
  CheckSquare,
  Square,
  Sparkles
} from 'lucide-react';

interface SepaRemittanceModalProps {
  invoices: Invoice[];
  tenants: Tenant[];
  properties: Property[];
  settings: LandlordSettings;
  onClose: () => void;
  onMarkInvoicesAsPaid: (invoiceIds: string[]) => void;
}

export const SepaRemittanceModal: React.FC<SepaRemittanceModalProps> = ({
  invoices,
  tenants,
  properties,
  settings,
  onClose,
  onMarkInvoicesAsPaid,
}) => {
  // Candidate invoices: pending or overdue and typically marked for domiciliacion
  const directDebitInvoices = invoices.filter(
    (inv) => (inv.status === 'pendiente' || inv.status === 'vencido') && inv.paymentMethod === 'domiciliacion'
  );

  const [selectedIds, setSelectedIds] = useState<string[]>(
    directDebitInvoices.map((i) => i.id)
  );

  const [collectionDate, setCollectionDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3); // 3 days in advance standard
    return d.toISOString().split('T')[0];
  });

  const [processedDone, setProcessedDone] = useState(false);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === directDebitInvoices.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(directDebitInvoices.map((i) => i.id));
    }
  };

  // Filtered active list for remittance
  const activeRemittanceItems = directDebitInvoices
    .filter((inv) => selectedIds.includes(inv.id))
    .map((inv) => {
      const tenant = tenants.find((t) => t.id === inv.tenantId) || {
        id: 'unknown',
        name: 'Inquilino sin asignar',
        dniNie: 'Sin DNI',
        phone: '',
        email: '',
        iban: '',
        createdAt: '',
      };
      const property = properties.find((p) => p.id === inv.propertyId);
      return { invoice: inv, tenant, property };
    });

  const totalAmount = activeRemittanceItems.reduce(
    (sum, item) => sum + item.invoice.totalAmount,
    0
  );

  // Download XML
  const handleDownloadXml = () => {
    if (activeRemittanceItems.length === 0) return;

    const xmlString = generateSepaXml({
      messageId: `ANSAMA-${new Date().toISOString().replace(/[-:T.]/g, '').substring(0, 14)}`,
      creationDateTime: new Date().toISOString(),
      numberOfTransactions: activeRemittanceItems.length,
      totalAmount: totalAmount,
      collectionDate: collectionDate,
      creditorName: settings.landlordName || 'ANSAMA Inversiones Patrimoniales',
      creditorNif: settings.landlordNif || 'B-88741295',
      creditorIban: settings.landlordIban || 'ES7621000418450200051234',
      invoices: activeRemittanceItems,
    });

    const dateStr = new Date().toISOString().split('T')[0];
    downloadSepaXmlFile(`remesa_sepa_ansama_${dateStr}`, xmlString);
  };

  // Download CSV
  const handleDownloadCsv = () => {
    const rows = [
      ['Numero_Recibo', 'Inmueble', 'Inquilino', 'DNI_NIE', 'IBAN_Adeudo', 'Importe_EUR', 'Concepto', 'Fecha_Cargo'],
      ...activeRemittanceItems.map((item) => [
        item.invoice.number,
        item.property?.name || '',
        item.tenant.name,
        item.tenant.dniNie,
        item.tenant.iban || 'PENDIENTE_IBAN',
        item.invoice.totalAmount.toFixed(2),
        item.invoice.concept,
        collectionDate,
      ]),
    ];
    exportToCsv(`remesa_bancaria_${collectionDate}`, rows);
  };

  // Process and mark as paid
  const handleProcessRemittance = () => {
    if (selectedIds.length === 0) return;
    if (
      confirm(
        `¿Confirmas la liquidación de la remesa? Se marcarán ${selectedIds.length} recibos como COBRADOS por un total de ${formatCurrency(totalAmount)}.`
      )
    ) {
      onMarkInvoicesAsPaid(selectedIds);
      setProcessedDone(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <FileCode2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-base">
                Generador de Remesas Bancarias SEPA (Norma 19 / ISO 20022 XML)
              </h3>
              <p className="text-xs text-slate-400">
                Genera el fichero oficial pain.008.001.02 para subir directamente a tu banca electrónica
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs bg-slate-50/50">
          {/* Top Info Banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Presentador / Titular</span>
              <p className="font-bold text-slate-900 text-sm mt-0.5">{settings.landlordName}</p>
              <p className="text-slate-500 font-mono text-[11px]">NIF: {settings.landlordNif}</p>
            </div>

            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Cuenta de Abono (IBAN)</span>
              <p className="font-bold text-slate-900 font-mono text-xs mt-0.5 tracking-tight">
                {settings.landlordIban || 'No configurado en Ajustes'}
              </p>
              <p className="text-emerald-700 font-semibold text-[11px] mt-0.5">Esquema SEPA CORE / B2B</p>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                Fecha Ejecución de Cobro
              </label>
              <input
                type="date"
                value={collectionDate}
                onChange={(e) => setCollectionDate(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800"
              />
            </div>
          </div>

          {/* Metrics summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-gradient-to-r from-[#0b4f8a] to-[#1565c0] text-white p-5 rounded-2xl shadow-sm">
            <div>
              <p className="text-sky-200 text-[11px] uppercase font-semibold">Órdenes Seleccionadas</p>
              <p className="text-2xl font-bold mt-0.5">{selectedIds.length} recibos</p>
            </div>
            <div>
              <p className="text-sky-200 text-[11px] uppercase font-semibold">Inquilinos en Remesa</p>
              <p className="text-2xl font-bold mt-0.5">
                {new Set(activeRemittanceItems.map((i) => i.tenant.id)).size} pagadores
              </p>
            </div>
            <div className="bg-white/10 p-2.5 rounded-xl border border-white/20">
              <p className="text-emerald-300 text-[11px] uppercase font-bold">Total a Cobrar</p>
              <p className="text-2xl font-black text-white mt-0.5">{formatCurrency(totalAmount)}</p>
            </div>
          </div>

          {processedDone && (
            <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl flex items-center space-x-2 font-bold text-xs">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>¡Remesa liquidada con éxito! Todos los recibos seleccionados se han marcado como cobrados.</span>
            </div>
          )}

          {/* Invoices selection table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  className="flex items-center space-x-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900"
                >
                  {selectedIds.length === directDebitInvoices.length && directDebitInvoices.length > 0 ? (
                    <CheckSquare className="w-4 h-4 text-[#0b4f8a]" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-400" />
                  )}
                  <span>Seleccionar Todos ({directDebitInvoices.length})</span>
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleDownloadCsv}
                  disabled={selectedIds.length === 0}
                  className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl font-semibold text-xs flex items-center space-x-1.5 disabled:opacity-50"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>Descargar CSV</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadXml}
                  disabled={selectedIds.length === 0}
                  id="download-sepa-xml-btn"
                  className="px-3.5 py-1.5 bg-[#0b4f8a] hover:bg-[#093d6b] text-white rounded-xl font-bold text-xs flex items-center space-x-1.5 disabled:opacity-50 shadow-2xs"
                >
                  <Download className="w-4 h-4" />
                  <span>Descargar XML SEPA</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto max-h-[280px]">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 text-slate-500 font-semibold sticky top-0">
                  <tr>
                    <th className="py-2.5 px-4 w-8"></th>
                    <th className="py-2.5 px-4">Recibo / Concepto</th>
                    <th className="py-2.5 px-4">Inquilino / Deudor</th>
                    <th className="py-2.5 px-4">IBAN Domiciliado</th>
                    <th className="py-2.5 px-4 text-right">Importe</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {directDebitInvoices.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">
                        No hay facturas o recibos pendientes configurados con forma de pago 'domiciliacion'.
                      </td>
                    </tr>
                  ) : (
                    directDebitInvoices.map((inv) => {
                      const isSelected = selectedIds.includes(inv.id);
                      const ten = tenants.find((t) => t.id === inv.tenantId);
                      const prop = properties.find((p) => p.id === inv.propertyId);
                      const hasIban = Boolean(ten?.iban);

                      return (
                        <tr
                          key={inv.id}
                          onClick={() => toggleSelect(inv.id)}
                          className={`cursor-pointer transition-colors ${
                            isSelected ? 'bg-sky-50/60' : 'hover:bg-slate-50'
                          }`}
                        >
                          <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelect(inv.id)}
                              className="rounded-sm text-[#0b4f8a] focus:ring-sky-500"
                            />
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-bold text-slate-900">{inv.number}</span>
                            <span className="text-[11px] text-slate-500 block truncate max-w-[200px]">
                              {prop?.name} · {inv.concept}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-semibold text-slate-800">{ten?.name}</span>
                            <span className="text-[11px] text-slate-400 block">{ten?.dniNie}</span>
                          </td>
                          <td className="py-3 px-4">
                            {hasIban ? (
                              <span className="font-mono text-slate-800 font-semibold text-[11px]">
                                {ten?.iban}
                              </span>
                            ) : (
                              <span className="text-amber-600 font-bold text-[11px] flex items-center">
                                <AlertTriangle className="w-3.5 h-3.5 mr-1" /> Sin IBAN
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-slate-900 text-sm">
                            {formatCurrency(inv.totalAmount)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-white border-t border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-[11px] text-slate-500">
            Compatible con CaixaBank, Banco Santander, BBVA, Banco Sabadell, Bankinter, Kutxabank e ING.
          </p>
          <div className="flex items-center space-x-2.5 self-end">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl font-semibold text-xs"
            >
              Cancelar
            </button>
            <button
              onClick={handleProcessRemittance}
              disabled={selectedIds.length === 0}
              id="confirm-process-remittance-btn"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center space-x-1.5 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Marcar Recibos como Cobrados</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
