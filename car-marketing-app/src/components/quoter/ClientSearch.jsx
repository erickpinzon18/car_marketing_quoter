import { useState, useRef, useEffect, useCallback } from 'react';
import ToggleGroup from '../ui/ToggleGroup';

/**
 * ClientSearch — search existing clients or register a new one.
 * Props:
 *   clients        – full list from useClients()
 *   onSelect       – called with a client object { id, name, phone, email, rfc }
 *   selectedClient – currently selected client (or null)
 *   onClear        – called when user wants to change client
 *   addClient      – async function from useClients() to create new client
 *   gender         – current gender value
 *   onGenderChange – setter for gender
 */
export default function ClientSearch({
  clients,
  onSelect,
  selectedClient,
  onClear,
  addClient,
  updateClient,
  isAdmin,
  gender,
  onGenderChange,
}) {
  const [query, setQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [newClient, setNewClient] = useState({ name: '', phone: '', email: '', rfc: '' });
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', phone: '', email: '', rfc: '' });
  const wrapperRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowResults(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Filter clients locally
  const filtered = query.length >= 2
    ? clients.filter(c => {
        const q = query.toLowerCase();
        return (
          c.name?.toLowerCase().includes(q) ||
          c.email?.toLowerCase().includes(q) ||
          c.phone?.includes(query)
        );
      })
    : [];

  const handleRegister = async () => {
    if (!newClient.name.trim()) return;
    setSaving(true);
    try {
      const payload = { ...newClient, gender }; // Save gender on creation
      const created = await addClient(payload);
      onSelect(created);
      setShowRegister(false);
      setNewClient({ name: '', phone: '', email: '', rfc: '' });
      setQuery('');
    } catch (err) {
      console.error('Error creating client:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async () => {
    if (!editForm.name.trim()) return;
    setSaving(true);
    try {
      await updateClient(selectedClient.id, editForm);
      onSelect({ ...selectedClient, ...editForm });
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating client:', err);
    } finally {
      setSaving(false);
    }
  };

  // ──────────────────── SELECTED CLIENT CARD ────────────────────
  if (selectedClient) {
    if (isEditing && isAdmin) {
      return (
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-5 border border-blue-100 space-y-4">
          <div className="flex justify-between items-center mb-1">
            <h4 className="font-bold text-brand-dark text-sm">
              <i className="fas fa-edit mr-2 text-brand-blue"></i> Editar Cliente
            </h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Nombre Completo</label>
              <input type="text" value={editForm.name} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} className="input-clean w-full rounded-xl py-3 px-4 text-sm font-medium" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Teléfono</label>
              <input type="tel" value={editForm.phone} onChange={e => setEditForm(p => ({ ...p, phone: e.target.value }))} className="input-clean w-full rounded-xl py-3 px-4 text-sm font-medium" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Email</label>
              <input type="email" value={editForm.email} onChange={e => setEditForm(p => ({ ...p, email: e.target.value }))} className="input-clean w-full rounded-xl py-3 px-4 text-sm font-medium" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">RFC</label>
              <input type="text" value={editForm.rfc} onChange={e => setEditForm(p => ({ ...p, rfc: e.target.value }))} className="input-clean w-full rounded-xl py-3 px-4 text-sm font-medium" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setIsEditing(false)} className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-500 text-sm font-bold hover:bg-slate-100">Cancelar</button>
            <button onClick={handleEdit} disabled={saving || !editForm.name.trim()} className="px-5 py-2.5 rounded-xl bg-brand-blue text-white text-sm font-bold shadow-lg shadow-blue-500/20 disabled:opacity-50">
              {saving ? <><i className="fas fa-spinner fa-spin mr-2"></i> Guardando...</> : 'Guardar Cambios'}
            </button>
          </div>
        </div>
      );
    }

    const clientGender = selectedClient.gender || gender;

    return (
      <div className="space-y-5">
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-5 border border-blue-100 relative">
          <div className="absolute top-3 right-3 flex gap-2">
            {isAdmin && (
              <button
                onClick={() => {
                  setEditForm({ name: selectedClient.name || '', phone: selectedClient.phone || '', email: selectedClient.email || '', rfc: selectedClient.rfc || '' });
                  setIsEditing(true);
                }}
                className="text-xs font-bold text-slate-500 bg-white px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-all shadow-sm"
              >
                <i className="fas fa-edit mr-1.5"></i> Editar
              </button>
            )}
            <button
              onClick={onClear}
              className="text-xs font-bold text-brand-blue bg-white px-3 py-1.5 rounded-lg border border-blue-100 hover:bg-blue-50 transition-all shadow-sm"
            >
              <i className="fas fa-exchange-alt mr-1.5"></i> Cambiar
            </button>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-blue to-cyan-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/20">
              {selectedClient.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-brand-dark text-lg">{selectedClient.name}</h4>
                {clientGender && (
                  <span className="px-2 py-0.5 rounded-md bg-blue-100/60 text-brand-blue text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 border border-blue-200/50">
                    <i className={`fas ${clientGender === 'male' ? 'fa-mars' : 'fa-venus'}`}></i>
                    {clientGender === 'male' ? 'Hombre' : 'Mujer'}
                  </span>
                )}
              </div>
              <div className="flex gap-4 text-xs text-slate-500 mt-1">
                {selectedClient.phone && (
                  <span><i className="fas fa-phone mr-1 text-brand-blue/60"></i>{selectedClient.phone}</span>
                )}
                {selectedClient.email && (
                  <span><i className="fas fa-envelope mr-1 text-brand-blue/60"></i>{selectedClient.email}</span>
                )}
              </div>
            </div>
          </div>
          {selectedClient.rfc && (
            <div className="mt-3 text-xs text-slate-400">
              <i className="fas fa-id-card mr-1"></i> RFC: {selectedClient.rfc}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ──────────────────── SEARCH / REGISTER ────────────────────
  return (
    <div className="space-y-5" ref={wrapperRef}>
      {/* Search input */}
      <div className="relative">
        <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowResults(true);
            setShowRegister(false);
          }}
          onFocus={() => query.length >= 2 && setShowResults(true)}
          placeholder="Buscar cliente por nombre, teléfono o email..."
          className="input-clean w-full rounded-xl py-3 pl-11 pr-4 text-sm font-medium text-brand-dark focus:outline-none"
        />

        {/* Results dropdown */}
        {showResults && query.length >= 2 && (
          <div className="absolute z-30 top-full left-0 right-0 mt-2 bg-white rounded-xl border border-slate-200 shadow-2xl max-h-72 overflow-y-auto">
            {filtered.length > 0 ? (
              <>
                <div className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase border-b border-slate-50">
                  {filtered.length} resultado{filtered.length !== 1 && 's'}
                </div>
                {filtered.map(c => (
                  <button
                    key={c.id}
                    onClick={() => {
                      onSelect(c);
                      setQuery('');
                      setShowResults(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-blue-50/60 transition-colors flex items-center gap-3 border-b border-slate-50 last:border-0"
                  >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-500 font-bold text-xs shrink-0">
                      {c.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-slate-700 text-sm truncate">{c.name}</div>
                      <div className="text-xs text-slate-400 flex gap-3">
                        {c.phone && <span>{c.phone}</span>}
                        {c.email && <span className="truncate">{c.email}</span>}
                      </div>
                    </div>
                  </button>
                ))}
              </>
            ) : (
              <div className="p-4 text-center">
                <div className="text-sm text-slate-400 mb-3">
                  No se encontró ningún cliente con "<span className="font-bold text-slate-600">{query}</span>"
                </div>
                <button
                  onClick={() => {
                    setShowRegister(true);
                    setShowResults(false);
                    setNewClient(prev => ({ ...prev, name: query }));
                  }}
                  className="text-sm font-bold text-white bg-brand-blue px-5 py-2.5 rounded-xl hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/20"
                >
                  <i className="fas fa-plus mr-2"></i> Registrar nuevo cliente
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick action */}
      {!showRegister && query.length < 2 && (
        <div className="flex items-center gap-3">
          <div className="flex-grow h-px bg-slate-100"></div>
          <button
            onClick={() => setShowRegister(true)}
            className="text-xs font-bold text-brand-blue hover:text-blue-700 transition-colors"
          >
            <i className="fas fa-user-plus mr-1.5"></i> Registrar nuevo cliente
          </button>
          <div className="flex-grow h-px bg-slate-100"></div>
        </div>
      )}

      {/* Registration form */}
      {showRegister && (
        <div className="bg-slate-50/80 rounded-2xl border border-slate-200 p-5 space-y-4">
          <div className="flex justify-between items-center mb-1">
            <h4 className="font-bold text-brand-dark text-sm">
              <i className="fas fa-user-plus mr-2 mb-4 text-brand-blue"></i> Nuevo Cliente
            </h4>
            <button
              onClick={() => setShowRegister(false)}
              className="text-slate-400 hover:text-slate-600 text-xs"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
                <i className="fas fa-user mr-1 text-brand-blue"></i> Nombre Completo
              </label>
              <input
                type="text"
                value={newClient.name}
                onChange={(e) => setNewClient(p => ({ ...p, name: e.target.value }))}
                placeholder="Juan Pérez"
                className="input-clean w-full rounded-xl py-3 px-4 text-sm font-medium text-brand-dark focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
                <i className="fas fa-phone mr-1 text-brand-blue"></i> Teléfono
              </label>
              <input
                type="tel"
                value={newClient.phone}
                onChange={(e) => setNewClient(p => ({ ...p, phone: e.target.value }))}
                placeholder="55 1234 5678"
                className="input-clean w-full rounded-xl py-3 px-4 text-sm font-medium text-brand-dark focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
                <i className="fas fa-envelope mr-1 text-brand-blue"></i> Email
              </label>
              <input
                type="email"
                value={newClient.email}
                onChange={(e) => setNewClient(p => ({ ...p, email: e.target.value }))}
                placeholder="correo@email.com"
                className="input-clean w-full rounded-xl py-3 px-4 text-sm font-medium text-brand-dark focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
                <i className="fas fa-id-card mr-1 text-brand-blue"></i> RFC (Opcional)
              </label>
              <input
                type="text"
                value={newClient.rfc}
                onChange={(e) => setNewClient(p => ({ ...p, rfc: e.target.value }))}
                placeholder="XAXX010101000"
                className="input-clean w-full rounded-xl py-3 px-4 text-sm font-medium text-brand-dark focus:outline-none"
              />
            </div>
            <div className="md:col-span-2 mt-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 block">
                <i className="fas fa-user mr-1 text-brand-blue"></i> Género
              </label>
              <ToggleGroup
                options={[
                  { value: 'male', label: 'Masculino', icon: 'fas fa-mars' },
                  { value: 'female', label: 'Femenino', icon: 'fas fa-venus' },
                ]}
                value={gender}
                onChange={onGenderChange}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setShowRegister(false)}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-500 text-sm font-bold hover:bg-slate-100 transition-all"
            >
              Cancelar
            </button>
            <button
              onClick={handleRegister}
              disabled={!newClient.name.trim() || saving}
              className="px-5 py-2.5 rounded-xl bg-brand-blue text-white text-sm font-bold hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <><i className="fas fa-spinner fa-spin mr-2"></i> Guardando...</>
              ) : (
                <><i className="fas fa-check mr-2"></i> Registrar y Seleccionar</>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
