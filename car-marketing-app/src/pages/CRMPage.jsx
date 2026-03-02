import { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useQuotes } from '../hooks/useQuotes';
import { useClients } from '../hooks/useClients';
import Header from '../components/layout/Header';
import GlassPanel from '../components/ui/GlassPanel';
import CRMTable from '../components/dashboard/CRMTable';
import ClientDetailModal from '../components/dashboard/ClientDetailModal';

export default function CRMPage() {
  const { user } = useAuth();
  const { quotes, loading: loadingQuotes, updateQuoteStatus } = useQuotes(user?.id, user?.role, user?.storeId);
  const { clients, loading: loadingClients } = useClients();
  const [selectedClient, setSelectedClient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Map quotes to their clients for quick lookup
  const clientQuotesMap = useMemo(() => {
    const map = {};
    quotes.forEach(q => {
      const cid = q.clientId || q.client?.id || q.client?.name; // Fallback for old data
      if (!cid) return;
      if (!map[cid]) map[cid] = [];
      map[cid].push(q);
    });
    return map;
  }, [quotes]);

  // Combine clients with their quotes
  const clientsWithData = useMemo(() => {
    return clients.map(client => {
      // Find quotes for this exact client ID (or fallback to name matching for older quotes)
      const clientQuotes = clientQuotesMap[client.id] || 
        quotes.filter(q => q.client?.name === client.name && q.client?.email === client.email);
        
      const totalInvested = clientQuotes.reduce((sum, q) => sum + (q.financials?.totalInitial || 0), 0);
      
      // Determine if the client belongs to this view based on quotes and user role
      // For vendors, they only see clients they have quoted.
      // For managers/admins, they see all clients in their scope.
      const hasQuotesInScope = clientQuotes.length > 0;
      const isVisible = user?.role === 'admin' || user?.role === 'manager' || hasQuotesInScope;

      return {
        ...client,
        quotes: clientQuotes,
        totalInvested,
        isVisible
      };
    }).filter(c => c.isVisible); // Only keep clients visible to this user
  }, [clients, clientQuotesMap, quotes, user]);

  // Search filter
  const filteredClients = useMemo(() => {
    if (!searchTerm) return clientsWithData;
    const lower = searchTerm.toLowerCase();
    return clientsWithData.filter((c) => 
      c.name?.toLowerCase().includes(lower) ||
      c.email?.toLowerCase().includes(lower) ||
      c.phone?.includes(lower)
    );
  }, [clientsWithData, searchTerm]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />

      <main className="flex-grow max-w-7xl mx-auto px-4 py-8 md:py-10 w-full space-y-8">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold text-brand-dark">Directorio de Clientes</h1>
                <p className="text-slate-500 mt-1">
                    {user?.role === 'manager' ? 'Todos los clientes (Tu sucursal)' : 
                     user?.role === 'admin' ? 'Visualizando todos los clientes' : 
                     'Tus clientes asignados'}
                </p>
            </div>
            <div className="text-xs font-bold text-slate-400 bg-white border border-slate-200 px-3 py-1.5 rounded-full shadow-sm">
              {filteredClients.length} clientes totales
            </div>
        </div>

        <GlassPanel>
          <div className="mb-6 relative">
            <input
              type="text"
              placeholder="Buscar por nombre, email o teléfono..."
              className="w-full md:w-96 pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
          </div>

          <CRMTable
            clients={filteredClients}
            loading={loadingQuotes || loadingClients}
            onClientClick={(client) => setSelectedClient(client)}
            showVendor={user?.role === 'manager' || user?.role === 'admin'}
            isAdmin={user?.role === 'admin'}
            onUpdateQuoteStatus={updateQuoteStatus}
          />
        </GlassPanel>
      </main>

      {/* Client Detail Modal */}
      <ClientDetailModal
        client={selectedClient}
        quotes={selectedClient?.quotes || []}
        isOpen={!!selectedClient}
        onClose={() => setSelectedClient(null)}
        isAdmin={user?.role === 'admin'}
        onUpdateQuoteStatus={updateQuoteStatus}
      />
    </div>
  );
}
