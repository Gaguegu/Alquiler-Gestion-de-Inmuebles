import React from 'react';
import { Invoice, Property, Tenant, LandlordSettings } from '../types';
import { formatCurrency, formatDate } from '../utils/storage';
import { Printer, X, Download, Building, CheckCircle, Clock } from 'lucide-react';

interface InvoicePrintModalProps {
  invoice: Invoice | null;
  property: Property | undefined;
  tenant: Tenant | undefined;
  settings: LandlordSettings;
  onClose: () => void;
}

export const InvoicePrintModal: React.FC<InvoicePrintModalProps> = ({
  invoice,
  property,
  tenant,
  settings,
  onClose,
}) => {
  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const isReceipt = invoice.type === 'recibo';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header Toolbar */}
        <div className="px-6 py-4 bg-slate-800 text-white flex items-center justify-between no-print">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold">
              {isReceipt ? 'R' : 'F'}
            </div>
            <div>
              <h3 className="font-semibold text-slate-100">
                {isReceipt ? 'Recibo de Alquiler' : 'Factura de Arrendamiento'} · {invoice.number}
              </h3>
              <p className="text-xs text-slate-400">Vista previa de impresión y documento oficial</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              id="print-invoice-btn"
              className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-sm font-medium rounded-lg flex items-center space-x-1.5 transition-colors shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / PDF</span>
            </button>
            <button
              onClick={onClose}
              id="close-print-modal-btn"
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-8 md:p-12 overflow-y-auto flex-1 bg-white text-slate-900 print:p-0" id="printable-invoice-area">
          {/* Document Header */}
          <div className="flex flex-col md:flex-row justify-between items-start pb-8 border-b border-slate-200 gap-6">
            <div>
              <div className="flex items-center space-x-2 text-[#0b4f8a] mb-2">
                <Building className="w-7 h-7" />
                <span className="text-2xl font-black tracking-tight">ANSAMA</span>
              </div>
              <p className="font-semibold text-slate-800">{settings.landlordName}</p>
              <p className="text-sm text-slate-600">NIF/CIF: {settings.landlordNif}</p>
              <p className="text-sm text-slate-600">{settings.landlordAddress}</p>
              <p className="text-sm text-slate-600">{settings.landlordPostalCode} {settings.landlordCity}</p>
              <p className="text-sm text-slate-600">Email: {settings.landlordEmail}</p>
            </div>

            <div className="text-left md:text-right">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 ${
                isReceipt ? 'bg-sky-100 text-sky-800' : 'bg-indigo-100 text-indigo-800'
              }`}>
                {isReceipt ? 'RECIBO DE ALQUILER' : 'FACTURA COMERCIAL'}
              </span>
              <p className="text-xl font-bold text-slate-900 tracking-tight">{invoice.number}</p>
              <p className="text-sm text-slate-600 mt-1">Fecha de emisión: <span className="font-medium text-slate-800">{formatDate(invoice.issueDate)}</span></p>
              <p className="text-sm text-slate-600">Fecha vencimiento: <span className="font-medium text-slate-800">{formatDate(invoice.dueDate)}</span></p>
              <div className="mt-2 flex md:justify-end">
                {invoice.status === 'cobrado' ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                    <CheckCircle className="w-3.5 h-3.5 mr-1" /> Cobrado
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                    <Clock className="w-3.5 h-3.5 mr-1" /> Pendiente de Cobro
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Arrendatario y Finca */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8 p-5 bg-slate-50 rounded-xl border border-slate-200/80">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">ARRENDATARIO / CLIENTE</p>
              <p className="font-semibold text-slate-900 text-base">{tenant?.name || 'Inquilino no especificado'}</p>
              <p className="text-sm text-slate-600">NIF/NIE/CIF: <span className="font-medium text-slate-800">{tenant?.dniNie || '-'}</span></p>
              {tenant?.phone && <p className="text-sm text-slate-600">Tel: {tenant.phone}</p>}
              {tenant?.email && <p className="text-sm text-slate-600">Email: {tenant.email}</p>}
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">INMUEBLE ARRENDADO</p>
              <p className="font-semibold text-slate-900 text-base">{property?.name || 'Inmueble'}</p>
              <p className="text-sm text-slate-600">{property?.address || '-'}</p>
              <p className="text-sm text-slate-600">{property?.postalCode} {property?.city} ({property?.province})</p>
              {property?.cadastralRef && (
                <p className="text-xs text-slate-500 mt-1">Ref. Catastral: {property.cadastralRef}</p>
              )}
            </div>
          </div>

          {/* Concepto y Tabla */}
          <div className="overflow-x-auto my-6">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-200 text-xs font-semibold uppercase text-slate-500">
                  <th className="py-3 px-2">Descripción / Concepto</th>
                  <th className="py-3 px-2 text-right">Base Imponible</th>
                  {invoice.vatPercent > 0 && <th className="py-3 px-2 text-right">IVA ({invoice.vatPercent}%)</th>}
                  {invoice.retentionPercent > 0 && <th className="py-3 px-2 text-right">Ret. IRPF ({invoice.retentionPercent}%)</th>}
                  <th className="py-3 px-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                <tr>
                  <td className="py-4 px-2 font-medium text-slate-800">
                    {invoice.concept}
                    {invoice.notes && <p className="text-xs text-slate-500 mt-1">{invoice.notes}</p>}
                  </td>
                  <td className="py-4 px-2 text-right font-medium text-slate-900">{formatCurrency(invoice.baseAmount)}</td>
                  {invoice.vatPercent > 0 && (
                    <td className="py-4 px-2 text-right text-slate-700">+{formatCurrency(invoice.vatAmount)}</td>
                  )}
                  {invoice.retentionPercent > 0 && (
                    <td className="py-4 px-2 text-right text-rose-600">-{formatCurrency(invoice.retentionAmount)}</td>
                  )}
                  <td className="py-4 px-2 text-right font-bold text-slate-900">{formatCurrency(invoice.totalAmount)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Totales y Liquidación */}
          <div className="flex flex-col md:flex-row justify-between items-start pt-6 border-t border-slate-200 gap-6">
            <div className="text-xs text-slate-500 max-w-sm">
              <p className="font-semibold text-slate-700 mb-1">Forma de pago:</p>
              <p className="capitalize text-slate-600 mb-2">{invoice.paymentMethod}</p>
              {settings.landlordIban && (
                <div className="p-3 bg-slate-100/80 rounded-lg border border-slate-200">
                  <p className="font-semibold text-slate-700 text-xs">Cuenta de abono (IBAN):</p>
                  <p className="font-mono text-xs text-slate-800 font-bold mt-0.5 tracking-wide">{settings.landlordIban}</p>
                </div>
              )}
              {isReceipt && invoice.vatPercent === 0 && (
                <p className="mt-3 text-[11px] text-slate-400 italic">
                  Operación exenta de IVA según lo establecido en el Art. 20.Uno.23º de la Ley 37/1992 del Impuesto sobre el Valor Añadido.
                </p>
              )}
            </div>

            <div className="w-full md:w-64 space-y-2 text-sm">
              <div className="flex justify-between py-1 text-slate-600">
                <span>Base Imponible:</span>
                <span className="font-medium text-slate-800">{formatCurrency(invoice.baseAmount)}</span>
              </div>
              {invoice.vatPercent > 0 && (
                <div className="flex justify-between py-1 text-slate-600">
                  <span>IVA ({invoice.vatPercent}%):</span>
                  <span className="font-medium text-slate-800">+{formatCurrency(invoice.vatAmount)}</span>
                </div>
              )}
              {invoice.retentionPercent > 0 && (
                <div className="flex justify-between py-1 text-rose-600">
                  <span>Retención IRPF ({invoice.retentionPercent}%):</span>
                  <span className="font-medium">-{formatCurrency(invoice.retentionAmount)}</span>
                </div>
              )}
              <div className="flex justify-between py-3 border-t-2 border-slate-800 text-base font-bold text-slate-900">
                <span>LÍQUIDO TOTAL:</span>
                <span className="text-lg text-[#0b4f8a]">{formatCurrency(invoice.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Footer Firma */}
          <div className="mt-12 pt-8 border-t border-slate-200 grid grid-cols-2 gap-8 text-center text-xs text-slate-500">
            <div>
              <p className="font-medium text-slate-700 mb-12">Por el Arrendador:</p>
              <p className="border-t border-slate-300 pt-2">{settings.landlordName}</p>
            </div>
            <div>
              <p className="font-medium text-slate-700 mb-12">Recibí (Arrendatario):</p>
              <p className="border-t border-slate-300 pt-2">{tenant?.name || 'El Inquilino'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
