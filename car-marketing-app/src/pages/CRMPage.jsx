import { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useQuotes } from '../hooks/useQuotes';
import { USERS } from '../data/users';
import Header from '../components/layout/Header';
import GlassPanel from '../components/ui/GlassPanel';
import CRMTable from '../components/dashboard/CRMTable';
import ClientDetailModal from '../components/dashboard/ClientDetailModal';

export default function CRMPage() {
  const { user } = useAuth();
  const { quotes, loading } = useQuotes(user?.id, user?.role);
  const [selectedClient, setSelectedClient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter quotes logic
  const crmQuotes = useMemo(() => {
    if (!user || !quotes.length) return [];
    
    // Admin sees all (hook returns all)
    // Vendor sees own (hook already filters)

    // Managers: Filter by store using USERS lookup
    if (user.role === 'manager') {
      return quotes.filter(q => {
        const quoteUser = USERS.find(u => u.id === q.user);
        return quoteUser && quoteUser.storeId === user.storeId;
      });
    }

    return quotes;
  }, [quotes, user]);

  const filteredQuotes = useMemo(() => {
    if (!searchTerm) return crmQuotes;
    const lower = searchTerm.toLowerCase();
    return crmQuotes.filter((q) => 
      q.client?.name?.toLowerCase().includes(lower) ||
      q.client?.email?.toLowerCase().includes(lower) ||
      q.client?.phone?.includes(lower) ||
      q.vehicle?.model?.toLowerCase().includes(lower)
    );

  }, [crmQuotes, searchTerm]);

  const clientQuotes = useMemo(() => {
    if (!selectedClient) return [];
    return filteredQuotes.filter(
      (q) =>
        q.client?.name === selectedClient.name &&
        q.client?.email === selectedClient.email
    );
  }, [filteredQuotes, selectedClient]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />

      <main className="flex-grow max-w-7xl mx-auto px-4 py-8 md:py-10 w-full space-y-8">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold text-brand-dark">Directorio de Clientes</h1>
                <p className="text-slate-500 mt-1">
                    {user?.role === 'manager' ? 'Visualizando clientes de tu sucursal' : 
                     user?.role === 'admin' ? 'Visualizando todos los clientes' : 
                     'Tus clientes asignados'}
                </p>
            </div>
            <div className="text-xs font-bold text-slate-400 bg-white border border-slate-200 px-3 py-1.5 rounded-full shadow-sm">
              {filteredQuotes.length} registros totales
            </div>
        </div>

        <GlassPanel>
          <div className="mb-6 relative">
            <input
              type="text"
              placeholder="Buscar por nombre, vehículo, email..."
              className="w-full md:w-96 pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
          </div>

          <CRMTable
            quotes={filteredQuotes}
            loading={loading}
            onClientClick={(client) => setSelectedClient(client)}
            showVendor={user?.role === 'manager' || user?.role === 'admin'}
          />
        </GlassPanel>
      </main>

      {/* Client Detail Modal */}
      <ClientDetailModal
        client={selectedClient}
        quotes={clientQuotes}
        isOpen={!!selectedClient}
        onClose={() => setSelectedClient(null)}
      />
    </div>
  );
}
