import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useQuotes } from '../hooks/useQuotes';
import { USERS } from '../data/users'; // Import USERS for store lookup
import { formatMoney } from '../utils/formatters'; // Import formatMoney
import Header from '../components/layout/Header';
import GlassPanel from '../components/ui/GlassPanel';
import StatsGrid from '../components/dashboard/StatsGrid';
import CRMTable from '../components/dashboard/CRMTable';
import AdminStats from '../components/dashboard/AdminStats';
import ClientDetailModal from '../components/dashboard/ClientDetailModal';

export default function DashboardPage() {
  const { user, getRoleName } = useAuth();
  const { quotes, loading } = useQuotes(user?.id, user?.role);
  const [selectedClient, setSelectedClient] = useState(null);

  // Filter quotes by Store if Manager (useQuotes handles Vendor filtering)
  const dashboardQuotes = useMemo(() => {
    if (!user || !quotes.length) return [];
    
    // Admin sees all
    if (user.role === 'admin') return quotes;

    // Vendors already filtered by hook, but ensure safety
    if (user.role === 'vendor') return quotes;

    // Managers: Filter by store using USERS lookup
    if (user.role === 'manager') {
      return quotes.filter(q => {
        // Find the user who created the quote
        // Note: clients.json uses 'user' field as ID string
        const quoteUser = USERS.find(u => u.id === q.user);
        // Display if in same store
        return quoteUser && quoteUser.storeId === user.storeId;
      });
    }

    return quotes;
  }, [quotes, user]);



  // Get all quotes for the selected client (match by name + email)
  const clientQuotes = useMemo(() => {
    if (!selectedClient) return [];
    return dashboardQuotes.filter(
      (q) =>
        q.client?.name === selectedClient.name &&
        q.client?.email === selectedClient.email
    );
  }, [dashboardQuotes, selectedClient]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Background decorations */}
      <div className="fixed top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-blue-400/5 blur-[120px] z-[-1]"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[35vw] h-[35vw] rounded-full bg-cyan-400/5 blur-[100px] z-[-1]"></div>

      <Header />

      <main className="flex-grow max-w-7xl mx-auto px-4 py-8 md:py-10 w-full space-y-8 relative z-10">
        {/* Welcome */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-brand-dark mb-1">
              ¡Hola, {user?.name}!
            </h1>
            <p className="text-slate-500">
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-brand-light text-brand-blue">
                {getRoleName(user?.role)}
              </span>
              <span className="ml-3 text-sm">
                {new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}
              </span>
            </p>
          </div>
          <Link
            to="/quoter"
            className="bg-brand-blue text-white font-bold py-3 px-6 rounded-2xl hover:bg-blue-600 transition-all shadow-lg hover:shadow-xl flex items-center gap-2 w-fit"
          >
            <i className="fas fa-plus"></i> Nueva Cotización
          </Link>
        </div>

        {/* Stats */}
        {user?.role === 'admin' ? (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-brand-dark mb-4">Panel Global (Admin)</h2>
            <AdminStats />
          </div>
        ) : (
          <StatsGrid quotes={dashboardQuotes} />
        )}





        {/* CRM Table */}
        <GlassPanel>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-brand-dark">
              <i className="fas fa-users mr-2 text-brand-blue"></i>
              Últimos Clientes
            </h2>
            <Link to="/crm" className="text-sm font-bold text-brand-blue hover:text-brand-dark transition-colors">
              Ver todos <i className="fas fa-arrow-right ml-1"></i>
            </Link>
          </div>
          <CRMTable
            quotes={dashboardQuotes.slice(0, 5)}
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
