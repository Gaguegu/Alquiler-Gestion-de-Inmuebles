import React, { useState } from 'react';
import { Property } from '../types';
import {
  LayoutDashboard,
  Building2,
  Users,
  FileSignature,
  Receipt,
  CreditCard,
  TrendingDown,
  Wrench,
  FolderLock,
  BarChart3,
  Settings,
  Filter,
  Download,
  Menu,
  X,
  Plus
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  properties: Property[];
  selectedPropertyId: string;
  setSelectedPropertyId: (id: string) => void;
  onQuickBackup: () => void;
  pendingInvoicesCount: number;
  openIssuesCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  properties,
  selectedPropertyId,
  setSelectedPropertyId,
  onQuickBackup,
  pendingInvoicesCount,
  openIssuesCount,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Panel', icon: LayoutDashboard },
    { id: 'properties', label: 'Inmuebles', icon: Building2, count: properties.length },
    { id: 'tenants', label: 'Inquilinos', icon: Users },
    { id: 'contracts', label: 'Contratos', icon: FileSignature },
    { id: 'invoices', label: 'Facturas/Recibos', icon: Receipt, badge: pendingInvoicesCount },
    { id: 'payments', label: 'Cobros', icon: CreditCard },
    { id: 'expenses', label: 'Gastos', icon: TrendingDown },
    { id: 'issues', label: 'Incidencias', icon: Wrench, badge: openIssuesCount },
    { id: 'documents', label: 'Documentos', icon: FolderLock },
    { id: 'reports', label: 'Informes', icon: BarChart3 },
    { id: 'settings', label: 'Ajustes', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80 shadow-xs no-print">
      {/* Top Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Brand */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setActiveTab('dashboard')}
              id="brand-logo-btn"
              className="flex items-center space-x-2.5 focus:outline-hidden text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-[#0b4f8a] text-white flex items-center justify-center shadow-md font-black text-xl tracking-tighter">
                A
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-slate-900 flex items-center">
                  ANSAMA
                  <span className="ml-1.5 text-[11px] font-semibold uppercase px-1.5 py-0.5 rounded-sm bg-sky-100 text-sky-800 tracking-wider">
                    Inmuebles
                  </span>
                </span>
                <p className="text-[11px] text-slate-500 font-medium -mt-0.5">Gestión Privada Patrimonial</p>
              </div>
            </button>
          </div>

          {/* Global Property Filter */}
          <div className="hidden md:flex items-center space-x-3">
            <div className="flex items-center bg-slate-100/90 rounded-xl p-1 border border-slate-200">
              <div className="flex items-center pl-2.5 pr-1.5 text-slate-500 text-xs font-medium">
                <Filter className="w-3.5 h-3.5 mr-1 text-slate-400" />
                <span>Inmueble:</span>
              </div>
              <select
                id="global-property-filter"
                value={selectedPropertyId}
                onChange={(e) => setSelectedPropertyId(e.target.value)}
                className="bg-white text-slate-800 text-xs font-semibold rounded-lg px-2.5 py-1.5 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-2xs"
              >
                <option value="all">🏢 Todos los inmuebles ({properties.length})</option>
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.type === 'vivienda' ? '🏠' : p.type === 'local' ? '🏬' : '🏢'} {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Quick backup button */}
            <button
              onClick={onQuickBackup}
              id="quick-backup-btn"
              title="Descargar copia de seguridad en archivo JSON"
              className="p-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-colors flex items-center text-xs font-medium space-x-1.5"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span className="hidden lg:inline">Copia Seguridad</span>
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              id="mobile-nav-toggle-btn"
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Horizontal Navigation Tabs */}
      <div className="hidden md:block bg-slate-50/60 border-t border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 overflow-x-auto py-1 scrollbar-none" aria-label="Tabs">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-3 py-2 text-xs font-medium rounded-lg flex items-center space-x-1.5 whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-white text-[#0b4f8a] shadow-xs font-semibold border border-slate-200/70'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#0b4f8a]' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                      {item.badge}
                    </span>
                  )}
                  {item.count !== undefined && (
                    <span className="text-[10px] text-slate-400 ml-0.5">({item.count})</span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-200 px-4 pt-3 pb-5 space-y-3">
          <div className="p-2 bg-slate-100 rounded-xl">
            <label className="block text-xs font-semibold text-slate-600 mb-1">Filtrar por inmueble:</label>
            <select
              id="mobile-property-filter"
              value={selectedPropertyId}
              onChange={(e) => {
                setSelectedPropertyId(e.target.value);
                setMobileMenuOpen(false);
              }}
              className="w-full bg-white text-slate-800 text-xs font-medium rounded-lg p-2 border border-slate-200"
            >
              <option value="all">🏢 Todos los inmuebles ({properties.length})</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`p-2.5 rounded-xl text-left text-xs font-medium flex items-center space-x-2 ${
                    isActive
                      ? 'bg-sky-50 text-[#0b4f8a] font-bold border border-sky-200'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4 text-slate-500" />
                  <span className="truncate">{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="ml-auto px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-200">
            <button
              onClick={() => {
                onQuickBackup();
                setMobileMenuOpen(false);
              }}
              className="w-full py-2 bg-slate-100 text-slate-800 rounded-xl text-xs font-semibold flex items-center justify-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Exportar Copia de Seguridad JSON</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
