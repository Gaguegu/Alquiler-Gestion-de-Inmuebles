import React, { useState, useEffect, useRef } from 'react';
import {
  AppState,
  Property,
  Tenant,
  Contract,
  Invoice,
  Issue,
  PropertyDocument,
} from '../types';
import { formatCurrency, formatDate } from '../utils/storage';
import {
  Search,
  X,
  Building2,
  Users,
  FileSpreadsheet,
  Receipt,
  AlertCircle,
  FolderOpen,
  ArrowRight,
  CornerDownLeft,
  Printer
} from 'lucide-react';

interface GlobalSearchModalProps {
  state: AppState;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: string, propertyFilterId?: string) => void;
  onSelectInvoicePrint?: (invoiceId: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  state,
  isOpen,
  onClose,
  onNavigate,
  onSelectInvoicePrint,
}) => {
  const { properties, tenants, contracts, invoices, issues, documents } = state;
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  // Search results
  const matchedProperties = q
    ? properties.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.address.toLowerCase().includes(q) ||
          p.city.toLowerCase().includes(q) ||
          (p.cadastralRef && p.cadastralRef.toLowerCase().includes(q))
      )
    : [];

  const matchedTenants = q
    ? tenants.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.dniNie.toLowerCase().includes(q) ||
          t.email.toLowerCase().includes(q) ||
          t.phone.toLowerCase().includes(q)
      )
    : [];

  const matchedInvoices = q
    ? invoices.filter(
        (inv) =>
          inv.number.toLowerCase().includes(q) ||
          inv.concept.toLowerCase().includes(q)
      )
    : [];

  const matchedContracts = q
    ? contracts.filter((c) => {
        const prop = properties.find((p) => p.id === c.propertyId);
        const ten = tenants.find((t) => t.id === c.tenantId);
        return (
          prop?.name.toLowerCase().includes(q) ||
          ten?.name.toLowerCase().includes(q)
        );
      })
    : [];

  const matchedIssues = q
    ? issues.filter(
        (iss) =>
          iss.title.toLowerCase().includes(q) ||
          iss.description.toLowerCase().includes(q) ||
          (iss.assignedTo && iss.assignedTo.toLowerCase().includes(q))
      )
    : [];

  const matchedDocuments = q
    ? documents.filter(
        (d) =>
          d.title.toLowerCase().includes(q) ||
          (d.fileName && d.fileName.toLowerCase().includes(q)) ||
          d.category.toLowerCase().includes(q)
      )
    : [];

  const totalResults =
    matchedProperties.length +
    matchedTenants.length +
    matchedInvoices.length +
    matchedContracts.length +
    matchedIssues.length +
    matchedDocuments.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/60 backdrop-blur-xs p-4 pt-16 sm:pt-24 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full flex flex-col overflow-hidden border border-slate-200">
        {/* Search Bar Input */}
        <div className="p-4 border-b border-slate-200 flex items-center space-x-3 bg-white">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Buscar inmuebles, inquilinos, facturas, contratos, incidencias... (Ctrl + K)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full text-sm font-medium text-slate-800 focus:outline-hidden"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs font-semibold text-slate-400 hover:text-slate-700 px-2 py-1 bg-slate-100 rounded-lg"
          >
            ESC
          </button>
        </div>

        {/* Results Body */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4 text-xs bg-slate-50/50">
          {!query ? (
            <div className="py-8 text-center text-slate-400 space-y-2">
              <p className="font-semibold text-slate-600">Empieza a escribir para buscar en toda la plataforma</p>
              <p className="text-[11px]">
                Puedes buscar por nombre de inquilino, DNI, dirección, número de factura (ej. REC-2025), averías o documentos.
              </p>
            </div>
          ) : totalResults === 0 ? (
            <div className="py-8 text-center text-slate-400">
              <p className="font-semibold text-slate-600">No se encontraron coincidencias para "{query}"</p>
              <p className="text-[11px] mt-1">Prueba con otra palabra clave o revisa la ortografía.</p>
            </div>
          ) : (
            <>
              {/* Properties */}
              {matchedProperties.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 px-2">
                    Inmuebles ({matchedProperties.length})
                  </h4>
                  <div className="space-y-1">
                    {matchedProperties.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          onNavigate('properties', p.id);
                          onClose();
                        }}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white hover:bg-sky-50 border border-slate-100 hover:border-sky-200 transition-all text-left"
                      >
                        <div className="flex items-center space-x-2.5">
                          <Building2 className="w-4 h-4 text-[#0b4f8a]" />
                          <div>
                            <p className="font-bold text-slate-900">{p.name}</p>
                            <p className="text-[11px] text-slate-500">{p.address}, {p.city}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-slate-800">{formatCurrency(p.currentRent)}/mes</span>
                          <span className="text-[10px] text-slate-400 block capitalize">{p.status}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Tenants */}
              {matchedTenants.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 px-2">
                    Inquilinos ({matchedTenants.length})
                  </h4>
                  <div className="space-y-1">
                    {matchedTenants.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          onNavigate('tenants');
                          onClose();
                        }}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white hover:bg-sky-50 border border-slate-100 hover:border-sky-200 transition-all text-left"
                      >
                        <div className="flex items-center space-x-2.5">
                          <Users className="w-4 h-4 text-emerald-600" />
                          <div>
                            <p className="font-bold text-slate-900">{t.name}</p>
                            <p className="text-[11px] text-slate-500">{t.dniNie} · {t.phone}</p>
                          </div>
                        </div>
                        <span className="text-xs text-[#0b4f8a] font-semibold flex items-center">
                          Ver ficha <ArrowRight className="w-3 h-3 ml-1" />
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Invoices */}
              {matchedInvoices.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 px-2">
                    Facturas y Recibos ({matchedInvoices.length})
                  </h4>
                  <div className="space-y-1">
                    {matchedInvoices.map((inv) => (
                      <div
                        key={inv.id}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white hover:bg-sky-50 border border-slate-100 hover:border-sky-200 transition-all text-left group"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            onNavigate('invoices');
                            onClose();
                          }}
                          className="flex items-center space-x-2.5 flex-1 min-w-0"
                        >
                          <Receipt className="w-4 h-4 text-sky-600 shrink-0" />
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900">{inv.number}</p>
                            <p className="text-[11px] text-slate-500 truncate max-w-[240px]">{inv.concept}</p>
                          </div>
                        </button>
                        <div className="flex items-center space-x-2 text-right shrink-0">
                          <div>
                            <span className="font-bold text-slate-900 block">{formatCurrency(inv.totalAmount)}</span>
                            <span className={`text-[10px] block capitalize font-semibold ${
                              inv.status === 'cobrado' ? 'text-emerald-600' : 'text-amber-600'
                            }`}>
                              {inv.status}
                            </span>
                          </div>
                          {onSelectInvoicePrint && (
                            <button
                              type="button"
                              onClick={() => {
                                onSelectInvoicePrint(inv.id);
                                onClose();
                              }}
                              title="Imprimir / Ver recibo"
                              className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-100 rounded-lg transition-colors"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Issues */}
              {matchedIssues.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 px-2">
                    Incidencias y Averías ({matchedIssues.length})
                  </h4>
                  <div className="space-y-1">
                    {matchedIssues.map((iss) => (
                      <button
                        key={iss.id}
                        type="button"
                        onClick={() => {
                          onNavigate('issues');
                          onClose();
                        }}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white hover:bg-sky-50 border border-slate-100 hover:border-sky-200 transition-all text-left"
                      >
                        <div className="flex items-center space-x-2.5">
                          <AlertCircle className="w-4 h-4 text-rose-500" />
                          <div>
                            <p className="font-bold text-slate-900">{iss.title}</p>
                            <p className="text-[11px] text-slate-500 truncate max-w-[280px]">{iss.description}</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                          {iss.status}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Documents */}
              {matchedDocuments.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 px-2">
                    Documentos ({matchedDocuments.length})
                  </h4>
                  <div className="space-y-1">
                    {matchedDocuments.map((doc) => (
                      <button
                        key={doc.id}
                        type="button"
                        onClick={() => {
                          onNavigate('documents');
                          onClose();
                        }}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white hover:bg-sky-50 border border-slate-100 hover:border-sky-200 transition-all text-left"
                      >
                        <div className="flex items-center space-x-2.5">
                          <FolderOpen className="w-4 h-4 text-amber-500" />
                          <div>
                            <p className="font-bold text-slate-900">{doc.title}</p>
                            <p className="text-[11px] text-slate-400 font-mono">{doc.fileName}</p>
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-500">{doc.fileSize}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-white border-t border-slate-200 text-slate-400 text-[11px] flex items-center justify-between px-4">
          <span>Pulsa <strong className="text-slate-600">Enter</strong> para seleccionar o haz clic</span>
          <span className="flex items-center">
            <CornerDownLeft className="w-3.5 h-3.5 mr-1" /> Acceso directo
          </span>
        </div>
      </div>
    </div>
  );
};
