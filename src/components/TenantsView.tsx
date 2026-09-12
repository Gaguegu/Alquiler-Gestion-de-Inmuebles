import React, { useState } from 'react';
import { Tenant, Property, Contract } from '../types';
import {
  Users,
  Plus,
  Search,
  Phone,
  Mail,
  CreditCard,
  Building,
  Edit2,
  Trash2,
  X,
  FileText
} from 'lucide-react';

interface TenantsViewProps {
  tenants: Tenant[];
  properties: Property[];
  contracts: Contract[];
  onSaveTenant: (tenant: Tenant) => void;
  onDeleteTenant: (id: string) => void;
}

export const TenantsView: React.FC<TenantsViewProps> = ({
  tenants,
  properties,
  contracts,
  onSaveTenant,
  onDeleteTenant,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);

  const [formData, setFormData] = useState<Partial<Tenant>>({
    name: '',
    dniNie: '',
    phone: '',
    email: '',
    iban: '',
    emergencyContact: '',
    notes: '',
  });

  const filteredTenants = tenants.filter(t =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.dniNie.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openNewModal = () => {
    setEditingTenant(null);
    setFormData({
      id: 'ten-' + Date.now(),
      name: '',
      dniNie: '',
      phone: '',
      email: '',
      iban: '',
      emergencyContact: '',
      notes: '',
      createdAt: new Date().toISOString().split('T')[0],
    });
    setModalOpen(true);
  };

  const openEditModal = (t: Tenant) => {
    setEditingTenant(t);
    setFormData({ ...t });
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.dniNie) return;

    const saved: Tenant = {
      id: editingTenant ? editingTenant.id : (formData.id || 'ten-' + Date.now()),
      name: formData.name || '',
      dniNie: formData.dniNie || '',
      phone: formData.phone || '',
      email: formData.email || '',
      iban: formData.iban || '',
      emergencyContact: formData.emergencyContact || '',
      notes: formData.notes || '',
      createdAt: formData.createdAt || new Date().toISOString().split('T')[0],
    };

    onSaveTenant(saved);
    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Directorio de Inquilinos</h1>
          <p className="text-sm text-slate-500">Gestión de arrendatarios, identificaciones fiscales, domiciliaciones bancarias y contactos.</p>
        </div>
        <button
          onClick={openNewModal}
          id="add-tenant-btn"
          className="px-4 py-2.5 bg-[#0b4f8a] hover:bg-[#093d6b] text-white rounded-xl text-xs font-bold shadow-sm transition-colors flex items-center space-x-1.5 self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Añadir Inquilino</span>
        </button>
      </div>

      {/* Search Filter Bar */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center">
        <Search className="w-4 h-4 text-slate-400 ml-2 mr-3" />
        <input
          type="text"
          id="search-tenants-input"
          placeholder="Buscar por nombre, NIF/NIE, CIF o correo electrónico..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full text-xs text-slate-800 focus:outline-hidden bg-transparent"
        />
        {searchTerm && (
          <button onClick={() => setSearchTerm('')} className="text-xs text-slate-400 hover:text-slate-600 mr-2">
            Limpiar
          </button>
        )}
      </div>

      {/* Tenants Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTenants.map((tenant) => {
          // Find active contract
          const contract = contracts.find(c => c.tenantId === tenant.id && c.status === 'activo');
          const property = contract ? properties.find(p => p.id === contract.propertyId) : null;

          return (
            <div
              key={tenant.id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md transition-all p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-sm">
                      {tenant.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm leading-tight">{tenant.name}</h3>
                      <p className="text-xs font-mono text-slate-500">{tenant.dniNie}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => openEditModal(tenant)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
                      title="Editar inquilino"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`¿Eliminar al inquilino "${tenant.name}"?`)) {
                          onDeleteTenant(tenant.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                      title="Eliminar inquilino"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Details */}
                <div className="py-3 space-y-2 text-xs">
                  {tenant.phone && (
                    <div className="flex items-center text-slate-600">
                      <Phone className="w-3.5 h-3.5 mr-2 text-slate-400 shrink-0" />
                      <a href={`tel:${tenant.phone}`} className="hover:text-[#0b4f8a] font-medium">
                        {tenant.phone}
                      </a>
                    </div>
                  )}

                  {tenant.email && (
                    <div className="flex items-center text-slate-600 truncate">
                      <Mail className="w-3.5 h-3.5 mr-2 text-slate-400 shrink-0" />
                      <a href={`mailto:${tenant.email}`} className="hover:text-[#0b4f8a] truncate">
                        {tenant.email}
                      </a>
                    </div>
                  )}

                  {tenant.iban && (
                    <div className="flex items-center text-slate-600">
                      <CreditCard className="w-3.5 h-3.5 mr-2 text-slate-400 shrink-0" />
                      <span className="font-mono text-[11px] text-slate-700 font-medium truncate">
                        {tenant.iban}
                      </span>
                    </div>
                  )}

                  {tenant.emergencyContact && (
                    <div className="pt-2 text-[11px] text-slate-500 border-t border-slate-100">
                      <span className="font-semibold text-slate-700">Contacto emergencia:</span> {tenant.emergencyContact}
                    </div>
                  )}
                </div>
              </div>

              {/* Associated Property Badge */}
              <div className="pt-3 border-t border-slate-100 mt-2">
                {property ? (
                  <div className="p-2.5 bg-sky-50/80 rounded-xl flex items-center space-x-2 text-xs">
                    <Building className="w-4 h-4 text-[#0b4f8a] shrink-0" />
                    <div className="truncate">
                      <p className="font-bold text-[#0b4f8a] truncate">{property.name}</p>
                      <p className="text-[11px] text-slate-500">Contrato activo hasta {contract?.endDate}</p>
                    </div>
                  </div>
                ) : (
                  <div className="p-2 bg-slate-50 rounded-xl text-center text-[11px] text-slate-400 font-medium">
                    Sin contrato activo asignado
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Alta / Edición Inquilino */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="px-6 py-4 bg-slate-800 text-white flex items-center justify-between">
              <h3 className="font-bold text-slate-100">
                {editingTenant ? 'Editar Inquilino' : 'Nuevo Inquilino'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nombre y Apellidos / Razón Social *</label>
                <input
                  type="text"
                  required
                  placeholder="ej. Laura Sánchez Morales o Empresa S.L."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">DNI / NIE / CIF *</label>
                  <input
                    type="text"
                    required
                    placeholder="ej. 50123456X"
                    value={formData.dniNie}
                    onChange={(e) => setFormData({ ...formData, dniNie: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-xs uppercase"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Teléfono</label>
                  <input
                    type="tel"
                    placeholder="+34 600 000 000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  placeholder="inquilino@correo.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Cuenta Bancaria para Domiciliación (IBAN)</label>
                <input
                  type="text"
                  placeholder="ESXX 0000 0000 0000 0000 0000"
                  value={formData.iban}
                  onChange={(e) => setFormData({ ...formData, iban: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Contacto de Emergencia / Avalista</label>
                <input
                  type="text"
                  placeholder="Nombre y teléfono de familiar o garante"
                  value={formData.emergencyContact}
                  onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notas Adicionales</label>
                <textarea
                  rows={2}
                  placeholder="Observaciones, acuerdos particulares..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-100 font-medium text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0b4f8a] hover:bg-[#093d6b] text-white rounded-xl font-bold text-xs shadow-sm"
                >
                  {editingTenant ? 'Guardar Cambios' : 'Registrar Inquilino'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
