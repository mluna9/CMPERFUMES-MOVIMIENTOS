import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Package, ShoppingBag, ShoppingCart, Wallet, 
  TrendingUp, Box, Calculator as CalcIcon, FileText, Settings, 
  Search, Plus, Trash2, Edit3, CheckCircle2, 
  AlertTriangle, ShieldCheck, RefreshCw, 
  Lock, DollarSign, X, History, LogOut, Key, AlertCircle,
  Sun, Moon, Users, PieChart
} from 'lucide-react';

export function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [activeTab, setActiveTab] = useState<'inicio' | 'stock' | 'pedidos' | 'ventas' | 'caja' | 'inversion' | 'insumos' | 'calculadora' | 'informes' | 'config'>('inicio');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);

  // Supabase & Auth States
  const [supabase, setSupabase] = useState<any>(() => getSupabaseClient());
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Business Configuration State
  const [config, setConfig] = useState({
    businessName: 'C&M PERFUMES',
    tagline: 'HAUTE PARFUMERIE & ESSENCES',
    currency: 'ARS',
    restockPct: 50,
    debtPct: 50,
    initialInvestment: 220000,
    supabaseUrl: localStorage.getItem('CM_SUPABASE_URL') || '',
    supabaseAnonKey: localStorage.getItem('CM_SUPABASE_KEY') || ''
  });

  // Data States
  const [products, setProducts] = useState([
    { id: 'p1', name: 'Baccarat Rouge 540', brand: 'Maison Francis Kurkdjian', concentration: 'EDP', volume_ml: 100, internal_code: 'CM-101', cost_price: 25000, sale_price: 65000, physical_stock: 5, reserved_stock: 1, min_stock: 2, notes: 'Fragancia estrella' },
    { id: 'p2', name: 'Sauvage', brand: 'Dior', concentration: 'EDT', volume_ml: 100, internal_code: 'CM-102', cost_price: 22000, sale_price: 58000, physical_stock: 8, reserved_stock: 0, min_stock: 3, notes: 'Alta demanda masculina' },
    { id: 'p3', name: 'Lost Cherry', brand: 'Tom Ford', concentration: 'EDP', volume_ml: 50, internal_code: 'CM-103', cost_price: 28000, sale_price: 72000, physical_stock: 3, reserved_stock: 1, min_stock: 2, notes: 'Niche unisex' }
  ]);
  const [inventoryMovements, setInventoryMovements] = useState([
    { id: 'm1', product_id: 'p1', product_name: 'Baccarat Rouge 540', type: 'COMPRA', quantity: 5, reason: 'Stock inicial', user_email: 'mati@cmperfumes.com', created_at: '2026-03-01 10:00' }
  ]);
  const [orders, setOrders] = useState([
    { id: 'o1', client_name: 'Lucía Gómez', client_phone: '1123456789', product_id: 'p1', product_name: 'Baccarat Rouge 540', quantity: 1, agreed_price: 65000, status: 'Reservado', payment_status: 'Seña Pagada', paid_amount: 30000, pending_amount: 35000, created_at: '2026-03-10', notes: 'Retira el viernes' }
  ]);
  const [sales, setSales] = useState([
    {
      id: 's1',
      operation_number: 1001,
      client_name: 'Carlos Mendez',
      total_amount: 58000,
      total_cost: 22000,
      estimated_margin: 36000,
      net_profit: 36000,
      mati_profit: 18000, // 50%
      cele_profit: 18000, // 50%
      payment_status: 'Cobrado',
      delivery_status: 'Entregado',
      payment_method: 'Efectivo',
      paid_amount: 58000,
      pending_amount: 0,
      created_at: '2026-03-05',
      items: [{ product_id: 'p2', product_name: 'Sauvage', quantity: 1, unit_price: 58000, unit_cost: 22000 }]
    }
  ]);
  const [cashMovements, setCashMovements] = useState([
    { id: 'c1', type: 'INGRESO', category: 'Venta', description: 'Venta #1001 - Carlos Mendez', amount: 58000, payment_method: 'Efectivo', date: '2026-03-05' },
    { id: 'c2', type: 'EGRESO', category: 'Insumos', description: 'Compra de atomizadores y cajas', amount: 8500, payment_method: 'Transferencia', date: '2026-03-02' }
  ]);
  const [supplies, setSupplies] = useState([
    { id: 'su1', name: 'Frascos Vidrio 100ml', unit: 'Unidades', quantity: 45, min_stock: 15, unit_cost: 1200 },
    { id: 'su2', name: 'Atomizadores Negros', unit: 'Unidades', quantity: 60, min_stock: 20, unit_cost: 350 }
  ]);
  const [debts, setDebts] = useState([
    { id: 'd1', concept: 'Capital Inicial Préstamo Reposición', initial_amount: 220000, current_amount: 140000, status: 'En Pago' }
  ]);

  // Notifications
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const notify = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Helper Supabase loader
  function getSupabaseClient(url?: string, key?: string) {
    const envUrl = url || localStorage.getItem('CM_SUPABASE_URL');
    const envKey = key || localStorage.getItem('CM_SUPABASE_KEY');
    if (envUrl && envKey && (window as any).supabase) {
      try {
        return (window as any).supabase.createClient(envUrl, envKey);
      } catch (e) {
        console.error('Error Supabase client:', e);
        return null;
      }
    }
    return null;
  }

  useEffect(() => {
    if (!document.getElementById('supabase-cdn')) {
      const script = document.createElement('script');
      script.id = 'supabase-cdn';
      script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
      script.async = true;
      script.onload = () => {
        const client = getSupabaseClient();
        if (client) setSupabase(client);
        setAuthLoading(false);
      };
      document.body.appendChild(script);
    } else {
      const client = getSupabaseClient();
      if (client && !supabase) setSupabase(client);
      setAuthLoading(false);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      notify('Por favor configura primero la conexión a Supabase', 'error');
      setShowConfigModal(true);
      return;
    }
    setAuthError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setAuthError(error.message);
      notify('Error al iniciar sesión: ' + error.message, 'error');
    } else {
      notify('Sesión iniciada correctamente');
    }
  };

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
      setUser(null);
      notify('Sesión cerrada');
    }
  };

  const saveSupabaseKeys = (url: string, key: string) => {
    localStorage.setItem('CM_SUPABASE_URL', url);
    localStorage.setItem('CM_SUPABASE_KEY', key);
    const client = getSupabaseClient(url, key);
    setSupabase(client);
    setConfig(prev => ({ ...prev, supabaseUrl: url, supabaseAnonKey: key }));
    setShowConfigModal(false);
    notify('Credenciales de Supabase guardadas correctamente');
  };

  const bgMain = theme === 'dark' ? 'bg-[#0b0d14] text-slate-100' : 'bg-slate-50 text-slate-800';
  const bgHeader = theme === 'dark' ? 'bg-[#0e111a]/95 border-slate-800/80' : 'bg-white/95 border-slate-200';
  const bgSidebar = theme === 'dark' ? 'bg-[#090b10] border-slate-800/80' : 'bg-white border-slate-200';

  return (
    <div className={`min-h-screen ${bgMain} flex flex-col font-sans transition-colors duration-200 selection:bg-amber-500 selection:text-slate-950`}>
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-2xl border text-white flex items-center space-x-3 backdrop-blur-md transition-all ${
          notification.type === 'success' ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200' : 'bg-rose-950/90 border-rose-500/50 text-rose-200'
        }`}>
          {notification.type === 'success' ? <CheckCircle2 size={18} className="text-emerald-400"/> : <AlertTriangle size={18} className="text-rose-400"/>}
          <span className="font-medium text-sm tracking-wide">{notification.message}</span>
        </div>
      )}

      {/* Header */}
      <header className={`${bgHeader} backdrop-blur-md sticky top-0 z-30 border-b transition-colors`}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
              className={`md:hidden p-2 rounded-xl border ${theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'}`}
            >
              <LayoutDashboard size={20} />
            </button>
            
            <div className="flex items-center space-x-3.5 group cursor-pointer" onClick={() => setActiveTab('inicio')}>
              <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-700 via-amber-500 to-amber-200 p-[1px] shadow-xl shadow-amber-950/30 group-hover:scale-105 transition-all duration-300">
                <div className={`w-full h-full rounded-[15px] flex items-center justify-center ${theme === 'dark' ? 'bg-[#0b0d14]' : 'bg-white'}`}>
                  <span className="font-serif italic font-bold bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 bg-clip-text text-transparent text-sm tracking-tighter">
                    C&M
                  </span>
                </div>
              </div>
              <div className="flex flex-col justify-center">
                <span className="font-serif text-base tracking-[0.25em] font-medium bg-gradient-to-r from-amber-100 via-amber-300 to-amber-500 bg-clip-text text-transparent uppercase leading-tight">
                  C&M Perfumes
                </span>
                <span className={`text-[8px] font-mono tracking-[0.3em] uppercase mt-0.5 ${theme === 'dark' ? 'text-amber-500/60' : 'text-amber-700/70'}`}>
                  Mati &amp; Cele &bull; Partner Management
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-xl border transition-colors ${
                theme === 'dark' ? 'bg-slate-900 border-slate-800 text-amber-400 hover:bg-slate-800' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
              }`}
              title="Cambiar tema"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <button
              onClick={() => setShowConfigModal(true)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-mono flex items-center space-x-1.5 transition-colors ${
                supabase ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
              }`}
            >
              <ShieldCheck size={14} />
              <span className="hidden sm:inline">{supabase ? 'Supabase Conectado' : 'Conectar Supabase'}</span>
            </button>

            {user ? (
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300 font-serif text-xs font-bold">
                  {user.email?.substring(0, 2).toUpperCase()}
                </div>
                <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-rose-400" title="Cerrar sesión">
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <div className="text-xs font-mono text-amber-400/80 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                Modo Local
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main App Layout */}
      <div className="flex-1 flex flex-col md:flex-row">
        <aside className={`
          fixed md:static inset-y-0 left-0 z-40 w-64 ${bgSidebar} text-slate-300 transform transition-transform duration-200 ease-in-out flex flex-col border-r
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          <div className="p-4 border-b border-slate-800/80 flex justify-between items-center md:hidden">
            <span className="font-serif text-sm tracking-widest text-amber-200 uppercase">Menú C&amp;M</span>
            <button onClick={() => setMobileMenuOpen(false)} className="text-slate-400 hover:text-white">
              <X size={20} />
            </button>
          </div>
          
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {[
              { id: 'inicio', label: 'Resumen General', icon: LayoutDashboard },
              { id: 'stock', label: 'Stock & Inventario', icon: Package },
              { id: 'pedidos', label: 'Pedidos y Reservas', icon: ShoppingBag },
              { id: 'ventas', label: 'Ventas', icon: ShoppingCart },
              { id: 'caja', label: 'Caja y Movimientos', icon: Wallet },
              { id: 'inversion', label: 'Ganancias', icon: Users },
              { id: 'insumos', label: 'Insumos y Packaging', icon: Box },
              { id: 'calculadora', label: 'Calculadora de Margen', icon: CalcIcon },
              { id: 'informes', label: 'Reportes y Datos', icon: FileText },
              { id: 'config', label: 'Ajustes', icon: Settings }
            ].map(item => {
              const IconComp = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id as any); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive 
                      ? 'bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent border border-amber-500/30 text-amber-300 font-semibold' 
                      : `${theme === 'dark' ? 'hover:bg-slate-900 text-slate-400 hover:text-slate-200' : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'}`
                  }`}
                >
                  <IconComp size={16} className={isActive ? 'text-amber-400' : 'text-slate-400'} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-slate-800/80 text-[11px] text-slate-500 text-center font-mono">
            C&amp;M Perfumes &bull; v2.7
          </div>
        </aside>

        <main className="flex-1 p-4 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          {activeTab === 'inicio' && <DashboardView products={products} orders={orders} sales={sales} cashMovements={cashMovements} debts={debts} theme={theme} />}
          {activeTab === 'stock' && <StockModule products={products} setProducts={setProducts} inventoryMovements={inventoryMovements} setInventoryMovements={setInventoryMovements} supabase={supabase} user={user} notify={notify} theme={theme} />}
          {activeTab === 'pedidos' && <OrdersView orders={orders} setOrders={setOrders} products={products} setProducts={setProducts} supabase={supabase} notify={notify} theme={theme} />}
          {activeTab === 'ventas' && <SalesView sales={sales} setSales={setSales} products={products} setProducts={setProducts} cashMovements={cashMovements} setCashMovements={setCashMovements} supabase={supabase} user={user} notify={notify} theme={theme} />}
          {activeTab === 'caja' && <CashView cashMovements={cashMovements} setCashMovements={setCashMovements} supabase={supabase} notify={notify} theme={theme} />}
          {activeTab === 'inversion' && <InvestmentView sales={sales} debts={debts} setDebts={setDebts} config={config} supabase={supabase} notify={notify} theme={theme} />}
          {activeTab === 'insumos' && <SuppliesView supplies={supplies} setSupplies={setSupplies} supabase={supabase} notify={notify} theme={theme} />}
          {activeTab === 'calculadora' && <CalculatorView config={config} theme={theme} />}
          {activeTab === 'informes' && <ReportsView products={products} sales={sales} theme={theme} />}
          {activeTab === 'config' && <ConfigView config={config} setConfig={setConfig} notify={notify} theme={theme} />}
        </main>
      </div>

      {showConfigModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className={`max-w-md w-full p-6 rounded-2xl border shadow-2xl space-y-4 ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className="flex justify-between items-center">
              <h3 className="font-serif text-lg text-amber-200">Configuración Supabase</h3>
              <button onClick={() => setShowConfigModal(false)} className="text-slate-400 hover:text-white"><X size={18}/></button>
            </div>
            <p className="text-xs text-slate-400">Ingresa tus credenciales de proyecto en Supabase para sincronizar stock y ventas.</p>
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Supabase URL</label>
                <input 
                  type="text" 
                  id="sup_url" 
                  defaultValue={config.supabaseUrl} 
                  placeholder="https://xyz.supabase.co" 
                  className={`w-full p-2.5 rounded-xl border ${theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Supabase Anon Key</label>
                <input 
                  type="password" 
                  id="sup_key" 
                  defaultValue={config.supabaseAnonKey} 
                  placeholder="eyJhbGciOi..." 
                  className={`w-full p-2.5 rounded-xl border ${theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
                />
              </div>
              <button 
                onClick={() => {
                  const url = (document.getElementById('sup_url') as HTMLInputElement).value;
                  const key = (document.getElementById('sup_key') as HTMLInputElement).value;
                  saveSupabaseKeys(url, key);
                }}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-semibold hover:from-amber-400 hover:to-amber-500 transition-all shadow-lg"
              >
                Guardar y Conectar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DashboardView({ products, orders, sales, cashMovements, debts, theme }: any) {
  const cardBg = theme === 'dark' ? 'bg-slate-900/40 border-slate-800/80' : 'bg-white border-slate-200 shadow-sm';

  const totalSalesAmount = sales.reduce((acc: number, s: any) => acc + (s.total_amount || 0), 0);
  const totalNetProfit = sales.reduce((acc: number, s: any) => acc + (s.net_profit || 0), 0);
  const totalStockCount = products.reduce((acc: number, p: any) => acc + (p.physical_stock || 0), 0);
  const pendingOrdersCount = orders.filter((o: any) => o.status === 'Pendiente' || o.status === 'Reservado').length;

  const matiTotal = totalNetProfit * 0.5;
  const celeTotal = totalNetProfit * 0.5;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h1 className="font-serif text-2xl font-normal text-amber-200">Resumen General C&amp;M</h1>
          <p className="text-xs text-slate-400 mt-0.5">Indicadores clave de inventario, ventas y ganancias compartidas.</p>
        </div>
        <div className="text-xs font-mono text-amber-400/80 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/20">
          Socio Mati (50%) &bull; Socio Cele (50%)
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`${cardBg} p-5 rounded-2xl border relative overflow-hidden group`}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Ventas Totales</p>
              <h3 className="text-2xl font-serif text-amber-200 mt-1">${totalSalesAmount.toLocaleString()}</h3>
            </div>
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="mt-3 text-[11px] text-emerald-400 flex items-center space-x-1">
            <span>{sales.length} operaciones registradas</span>
          </div>
        </div>

        <div className={`${cardBg} p-5 rounded-2xl border relative overflow-hidden group`}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Ganancia Neta Total</p>
              <h3 className="text-2xl font-serif text-emerald-400 mt-1">${totalNetProfit.toLocaleString()}</h3>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <DollarSign size={20} />
            </div>
          </div>
          <div className="mt-3 text-[11px] text-slate-400 flex justify-between">
            <span>Mati: ${matiTotal.toLocaleString()}</span>
            <span>Cele: ${celeTotal.toLocaleString()}</span>
          </div>
        </div>

        <div className={`${cardBg} p-5 rounded-2xl border relative overflow-hidden group`}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Stock Físico Total</p>
              <h3 className="text-2xl font-serif text-amber-200 mt-1">{totalStockCount} <span className="text-xs text-slate-400 font-sans">unid.</span></h3>
            </div>
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Package size={20} />
            </div>
          </div>
          <div className="mt-3 text-[11px] text-slate-400">
            <span>{products.length} perfumes diferentes</span>
          </div>
        </div>

        <div className={`${cardBg} p-5 rounded-2xl border relative overflow-hidden group`}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Pedidos Activos</p>
              <h3 className="text-2xl font-serif text-amber-200 mt-1">{pendingOrdersCount}</h3>
            </div>
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <ShoppingBag size={20} />
            </div>
          </div>
          <div className="mt-3 text-[11px] text-purple-400">
            <span>Reservas y pendientes</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`${cardBg} p-5 rounded-2xl border space-y-4`}>
          <h3 className="font-serif text-lg text-amber-200">Distribución de Ganancias (50 / 50)</h3>
          <p className="text-xs text-slate-400">Cada venta descuenta costo y divide la ganancia neta equitativamente entre los socios.</p>
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 text-center space-y-1">
              <span className="text-xs font-mono text-amber-400 uppercase tracking-widest">Mati (50%)</span>
              <h4 className="text-xl font-serif text-amber-200">${matiTotal.toLocaleString()}</h4>
              <p className="text-[10px] text-slate-500">Disponible para retiro / reinversión</p>
            </div>
            <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 text-center space-y-1">
              <span className="text-xs font-mono text-amber-400 uppercase tracking-widest">Cele (50%)</span>
              <h4 className="text-xl font-serif text-amber-200">${celeTotal.toLocaleString()}</h4>
              <p className="text-[10px] text-slate-500">Disponible para retiro / reinversión</p>
            </div>
          </div>
        </div>

        <div className={`${cardBg} p-5 rounded-2xl border space-y-4`}>
          <h3 className="font-serif text-lg text-amber-200">Últimas Ventas Registradas</h3>
          <div className="space-y-2">
            {sales.slice(0, 3).map((s: any) => (
              <div key={s.id} className="p-3 rounded-xl bg-slate-950/40 border border-slate-800 flex justify-between items-center text-xs">
                <div>
                  <span className="font-semibold text-slate-200">#{s.operation_number} &bull; {s.client_name}</span>
                  <div className="text-[10px] text-slate-400">{s.created_at} &bull; {s.payment_method}</div>
                </div>
                <div className="text-right">
                  <span className="font-mono text-amber-300 font-semibold">${s.total_amount?.toLocaleString()}</span>
                  <div className="text-[10px] text-emerald-400">Neto: ${s.net_profit?.toLocaleString()}</div>
                </div>
              </div>
            ))}
            {sales.length === 0 && <p className="text-xs text-slate-500 italic">No hay ventas registradas aún.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

function StockModule({ products, setProducts, inventoryMovements, setInventoryMovements, supabase, user, notify, theme }: any) {
  const [showModal, setShowModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [editingProduct, setEditingProduct] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: '', brand: '', concentration: 'EDP', volume_ml: 100, cost_price: '', sale_price: '', physical_stock: '', min_stock: 2, notes: ''
  });

  const [adjustData, setAdjustData] = useState({
    type: 'COMPRA' as 'COMPRA' | 'SALIDA' | 'AJUSTE',
    quantity: 1,
    reason: 'Ingreso por reposición'
  });

  const cardBg = theme === 'dark' ? 'bg-slate-900/40 border-slate-800/80' : 'bg-white border-slate-200 shadow-sm';
  const tableHeaderBg = theme === 'dark' ? 'bg-slate-950 text-slate-400' : 'bg-slate-100 text-slate-600';

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setFormData({ name: '', brand: '', concentration: 'EDP', volume_ml: 100, cost_price: '', sale_price: '', physical_stock: '', min_stock: 2, notes: '' });
    setShowModal(true);
  };

  const handleOpenEdit = (p: any) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      brand: p.brand,
      concentration: p.concentration,
      volume_ml: p.volume_ml,
      cost_price: p.cost_price.toString(),
      sale_price: p.sale_price.toString(),
      physical_stock: p.physical_stock.toString(),
      min_stock: p.min_stock,
      notes: p.notes || ''
    });
    setShowModal(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.brand || !formData.cost_price || !formData.sale_price) {
      notify('Completa los campos requeridos', 'error');
      return;
    }

    const payload = {
      name: formData.name,
      brand: formData.brand,
      concentration: formData.concentration,
      volume_ml: Number(formData.volume_ml),
      internal_code: editingProduct ? editingProduct.internal_code : `CM-${Math.floor(100 + Math.random() * 900)}`,
      cost_price: Number(formData.cost_price),
      sale_price: Number(formData.sale_price),
      physical_stock: Number(formData.physical_stock) || 0,
      min_stock: Number(formData.min_stock) || 2,
      notes: formData.notes
    };

    if (supabase) {
      if (editingProduct) {
        const { error } = await supabase.from('products').update(payload).eq('id', editingProduct.id);
        if (error) return notify('Error al actualizar: ' + error.message, 'error');
        setProducts(products.map((p: any) => p.id === editingProduct.id ? { ...p, ...payload } : p));
        notify('Perfume actualizado');
      } else {
        const { data, error } = await supabase.from('products').insert([{ ...payload, reserved_stock: 0 }]).select();
        if (error) return notify('Error al crear: ' + error.message, 'error');
        if (data) setProducts([data[0], ...products]);
        notify('Perfume registrado con éxito');
      }
    } else {
      if (editingProduct) {
        setProducts(products.map((p: any) => p.id === editingProduct.id ? { ...p, ...payload } : p));
      } else {
        const newP = { ...payload, id: Date.now().toString(), reserved_stock: 0 };
        setProducts([newP, ...products]);
      }
      notify('Guardado localmente');
    }

    setShowModal(false);
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('¿Estás seguro de eliminar este perfume?')) return;
    if (supabase) {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) return notify('Error al eliminar: ' + error.message, 'error');
    }
    setProducts(products.filter((p: any) => p.id !== id));
    notify('Perfume eliminado');
  };

  const handleStockAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    let newStock = selectedProduct.physical_stock;
    if (adjustData.type === 'COMPRA') newStock += adjustData.quantity;
    if (adjustData.type === 'SALIDA') newStock = Math.max(0, newStock - adjustData.quantity);
    if (adjustData.type === 'AJUSTE') newStock = adjustData.quantity;

    if (supabase) {
      await supabase.from('products').update({ physical_stock: newStock }).eq('id', selectedProduct.id);
      const movPayload = {
        product_id: selectedProduct.id,
        type: adjustData.type,
        quantity: adjustData.quantity,
        reason: adjustData.reason,
        user_email: user?.email || 'Socio C&M'
      };
      const { data } = await supabase.from('inventory_movements').insert([movPayload]).select();
      if (data) setInventoryMovements([data[0], ...inventoryMovements]);
    } else {
      setInventoryMovements([{
        id: Date.now().toString(),
        product_id: selectedProduct.id,
        product_name: selectedProduct.name,
        type: adjustData.type,
        quantity: adjustData.quantity,
        reason: adjustData.reason,
        user_email: user?.email || 'Socio C&M'
      }, ...inventoryMovements]);
    }

    setProducts(products.map((p: any) => p.id === selectedProduct.id ? { ...p, physical_stock: newStock } : p));
    setShowAdjustModal(false);
    notify('Ajuste de stock guardado');
  };

  const filteredProducts = products.filter((p: any) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h1 className="font-serif text-2xl font-normal text-amber-200">Gestión de Stock &amp; Inventario</h1>
          <p className="text-xs text-slate-400 mt-0.5">Control de unidades físicas, reservas y movimientos.</p>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setShowHistoryModal(true)}
            className="flex items-center space-x-1.5 px-3 py-2 bg-slate-800/80 hover:bg-slate-700 text-slate-200 rounded-xl font-medium text-xs border border-slate-700 transition-all"
          >
            <History size={16} />
            <span>Historial Movimientos</span>
          </button>
          <button 
            onClick={handleOpenCreate}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 rounded-xl font-medium text-xs shadow-lg hover:from-amber-400 hover:to-amber-500 transition-all"
          >
            <Plus size={16} />
            <span>Agregar Perfume</span>
          </button>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3.5 top-3 text-slate-500" />
        <input 
          type="text" 
          placeholder="Buscar perfume por nombre o marca..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={`w-full pl-10 pr-4 py-2 border rounded-xl text-xs placeholder-slate-500 focus:outline-none focus:border-amber-500/50 ${theme === 'dark' ? 'bg-slate-900/80 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'}`}
        />
      </div>

      <div className={`${cardBg} rounded-2xl overflow-hidden border`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className={`${tableHeaderBg} font-mono text-[11px] uppercase tracking-wider border-b border-slate-800/80`}>
              <tr>
                <th className="p-3.5">Perfume / Fragancia</th>
                <th className="p-3.5">Costo Unit.</th>
                <th className="p-3.5">Precio Venta</th>
                <th className="p-3.5 text-center">Físico</th>
                <th className="p-3.5 text-center">Reservado</th>
                <th className="p-3.5 text-center">Disponible</th>
                <th className="p-3.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-500 italic">No hay perfumes registrados en el inventario.</td>
                </tr>
              ) : (
                filteredProducts.map((p: any) => {
                  const disponible = p.physical_stock - (p.reserved_stock || 0);
                  return (
                    <tr key={p.id} className="hover:bg-amber-500/5 transition-colors">
                      <td className="p-3.5">
                        <div className="font-semibold text-slate-200">{p.name}</div>
                        <div className="text-[10px] text-slate-400">{p.brand} &bull; {p.concentration} ({p.volume_ml}ml)</div>
                      </td>
                      <td className="p-3.5 font-mono text-slate-300">${p.cost_price?.toLocaleString()}</td>
                      <td className="p-3.5 font-mono text-amber-300 font-semibold">${p.sale_price?.toLocaleString()}</td>
                      <td className="p-3.5 text-center font-mono font-medium">{p.physical_stock}</td>
                      <td className="p-3.5 text-center font-mono text-amber-400">{p.reserved_stock || 0}</td>
                      <td className="p-3.5 text-center font-mono">
                        <span className={`px-2.5 py-1 rounded-md font-semibold text-[11px] ${
                          disponible > 0 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                          {disponible}
                        </span>
                      </td>
                      <td className="p-3.5 text-right space-x-1">
                        <button 
                          onClick={() => { setSelectedProduct(p); setShowAdjustModal(true); }}
                          className="p-1.5 bg-amber-500/10 text-amber-400 rounded-lg hover:bg-amber-500/20 transition-colors"
                          title="Ajustar Stock"
                        >
                          <RefreshCw size={14} />
                        </button>
                        <button 
                          onClick={() => handleOpenEdit(p)}
                          className="p-1.5 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors"
                          title="Editar"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button 
                          onClick={() => handleDeleteProduct(p.id)}
                          className="p-1.5 bg-rose-500/10 text-rose-400 rounded-lg hover:bg-rose-500/20 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className={`max-w-lg w-full p-6 rounded-2xl border shadow-2xl space-y-4 ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className="flex justify-between items-center">
              <h3 className="font-serif text-lg text-amber-200">{editingProduct ? 'Editar Perfume' : 'Nuevo Perfume'}</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white"><X size={18}/></button>
            </div>
            <form onSubmit={handleSaveProduct} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Nombre Fragancia</label>
                  <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Baccarat Rouge 540" className={`w-full p-2.5 rounded-xl border ${theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'}`}/>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Marca / Casa</label>
                  <input type="text" required value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} placeholder="Maison Francis" className={`w-full p-2.5 rounded-xl border ${theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'}`}/>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Concentración</label>
                  <select value={formData.concentration} onChange={e => setFormData({...formData, concentration: e.target.value})} className={`w-full p-2.5 rounded-xl border ${theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'}`}>
                    <option value="EDP">EDP</option>
                    <option value="EDT">EDT</option>
                    <option value="Parfum">Parfum</option>
                    <option value="Extrait">Extrait</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Volumen (ml)</label>
                  <input type="number" required value={formData.volume_ml} onChange={e => setFormData({...formData, volume_ml: Number(e.target.value)})} className={`w-full p-2.5 rounded-xl border ${theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'}`}/>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Stock Inicial</label>
                  <input type="number" required value={formData.physical_stock} onChange={e => setFormData({...formData, physical_stock: e.target.value})} className={`w-full p-2.5 rounded-xl border ${theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'}`}/>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Precio Costo ($)</label>
                  <input type="number" required value={formData.cost_price} onChange={e => setFormData({...formData, cost_price: e.target.value})} className={`w-full p-2.5 rounded-xl border ${theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'}`}/>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Precio Venta ($)</label>
                  <input type="number" required value={formData.sale_price} onChange={e => setFormData({...formData, sale_price: e.target.value})} className={`w-full p-2.5 rounded-xl border ${theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'}`}/>
                </div>
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Notas / Observaciones</label>
                <input type="text" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="Notas adicionales..." className={`w-full p-2.5 rounded-xl border ${theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'}`}/>
              </div>
              <button type="submit" className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-semibold hover:from-amber-400 hover:to-amber-500 transition-all shadow-lg">
                Guardar Perfume
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Adjust Stock Modal */}
      {showAdjustModal && selectedProduct && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className={`max-w-md w-full p-6 rounded-2xl border shadow-2xl space-y-4 ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className="flex justify-between items-center">
              <h3 className="font-serif text-lg text-amber-200">Ajustar Stock: {selectedProduct.name}</h3>
              <button onClick={() => setShowAdjustModal(false)} className="text-slate-400 hover:text-white"><X size={18}/></button>
            </div>
            <form onSubmit={handleStockAdjustment} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Tipo de Movimiento</label>
                <select value={adjustData.type} onChange={e => setAdjustData({...adjustData, type: e.target.value as any})} className={`w-full p-2.5 rounded-xl border ${theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'}`}>
                  <option value="COMPRA">COMPRA (Entrada)</option>
                  <option value="SALIDA">SALIDA (Merma / Uso)</option>
                  <option value="AJUSTE">AJUSTE (Inventario Físico)</option>
                </select>
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Cantidad</label>
                <input type="number" required value={adjustData.quantity} onChange={e => setAdjustData({...adjustData, quantity: Number(e.target.value)})} className={`w-full p-2.5 rounded-xl border ${theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'}`}/>
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Motivo / Razón</label>
                <input type="text" required value={adjustData.reason} onChange={e => setAdjustData({...adjustData, reason: e.target.value})} className={`w-full p-2.5 rounded-xl border ${theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'}`}/>
              </div>
              <button type="submit" className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-semibold hover:from-amber-400 hover:to-amber-500 transition-all shadow-lg">
                Registrar Movimiento
              </button>
            </form>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className={`max-w-2xl w-full p-6 rounded-2xl border shadow-2xl space-y-4 max-h-[80vh] overflow-y-auto ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className="flex justify-between items-center">
              <h3 className="font-serif text-lg text-amber-200">Historial de Movimientos de Stock</h3>
              <button onClick={() => setShowHistoryModal(false)} className="text-slate-400 hover:text-white"><X size={18}/></button>
            </div>
            <div className="space-y-2 text-xs">
              {inventoryMovements.map((m: any) => (
                <div key={m.id} className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 flex justify-between items-center">
                  <div>
                    <span className="font-semibold text-amber-300">{m.type} &bull; {m.product_name || 'Perfume'}</span>
                    <p className="text-[11px] text-slate-400">{m.reason} &bull; {m.user_email || 'Socio'}</p>
                  </div>
                  <div className="text-right font-mono">
                    <span className="text-slate-200 font-bold">Qty: {m.quantity}</span>
                    <div className="text-[10px] text-slate-500">{m.created_at || 'Reciente'}</div>
                  </div>
                </div>
              ))}
              {inventoryMovements.length === 0 && <p className="text-center text-slate-500 py-4">No hay movimientos registrados.</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function OrdersView({ orders, setOrders, products, setProducts, supabase, notify, theme }: any) {
  const [showModal, setShowModal] = useState(false);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [productId, setProductId] = useState(products[0]?.id || '');
  const [quantity, setQuantity] = useState(1);
  const [agreedPrice, setAgreedPrice] = useState('');
  const [status, setStatus] = useState('Reservado');
  const [paymentStatus, setPaymentStatus] = useState('Seña Pagada');
  const [paidAmount, setPaidAmount] = useState('');
  const [notes, setNotes] = useState('');

  const cardBg = theme === 'dark' ? 'bg-slate-900/40 border-slate-800/80' : 'bg-white border-slate-200 shadow-sm';
  const tableHeaderBg = theme === 'dark' ? 'bg-slate-950 text-slate-400' : 'bg-slate-100 text-slate-600';

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    const prod = products.find((p: any) => p.id === productId);
    if (!prod) return notify('Selecciona un perfume válido', 'error');

    const total = Number(agreedPrice) || (prod.sale_price * quantity);
    const paid = Number(paidAmount) || 0;
    const pending = total - paid;

    const payload = {
      client_name: clientName,
      client_phone: clientPhone,
      product_id: productId,
      product_name: prod.name,
      quantity: Number(quantity),
      agreed_price: total,
      status,
      payment_status: paymentStatus,
      paid_amount: paid,
      pending_amount: pending,
      notes
    };

    if (supabase) {
      const { data, error } = await supabase.from('orders').insert([payload]).select();
      if (error) return notify('Error al crear pedido: ' + error.message, 'error');
      if (data) setOrders([data[0], ...orders]);
    } else {
      setOrders([{ id: Date.now().toString(), ...payload, created_at: new Date().toISOString().split('T')[0] }, ...orders]);
    }

    // Reserve stock
    if (status === 'Reservado') {
      const updatedStock = products.map((p: any) => p.id === productId ? { ...p, reserved_stock: (p.reserved_stock || 0) + Number(quantity) } : p);
      setProducts(updatedStock);
    }

    setShowModal(false);
    notify('Pedido registrado con éxito');
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    const ord = orders.find((o: any) => o.id === orderId);
    if (!ord) return;

    if (supabase) {
      await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
    }
    setOrders(orders.map((o: any) => o.id === orderId ? { ...o, status: newStatus } : o));
    notify('Estado de pedido actualizado');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h1 className="font-serif text-2xl font-normal text-amber-200">Pedidos &amp; Reservas</h1>
          <p className="text-xs text-slate-400 mt-0.5">Control de encargos de clientes, señas y entregas.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 rounded-xl font-medium text-xs shadow-lg hover:from-amber-400 hover:to-amber-500 transition-all"
        >
          <Plus size={16} />
          <span>Nuevo Pedido</span>
        </button>
      </div>

      <div className={`${cardBg} rounded-2xl overflow-hidden border`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className={`${tableHeaderBg} font-mono text-[11px] uppercase tracking-wider border-b border-slate-800/80`}>
              <tr>
                <th className="p-3.5">Cliente</th>
                <th className="p-3.5">Perfume &amp; Cantidad</th>
                <th className="p-3.5">Precio Acordado</th>
                <th className="p-3.5">Estado Pago</th>
                <th className="p-3.5">Estado Pedido</th>
                <th className="p-3.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-500 italic">No hay pedidos registrados.</td>
                </tr>
              ) : (
                orders.map((o: any) => (
                  <tr key={o.id} className="hover:bg-amber-500/5 transition-colors">
                    <td className="p-3.5">
                      <div className="font-semibold text-slate-200">{o.client_name}</div>
                      <div className="text-[10px] text-slate-400">{o.client_phone}</div>
                    </td>
                    <td className="p-3.5">
                      <div className="font-medium text-slate-200">{o.product_name}</div>
                      <div className="text-[10px] text-amber-400">Cantidad: {o.quantity}</div>
                    </td>
                    <td className="p-3.5 font-mono text-amber-300 font-semibold">
                      ${o.agreed_price?.toLocaleString()}
                      {o.pending_amount > 0 && <div className="text-[10px] text-rose-400">Debe: ${o.pending_amount?.toLocaleString()}</div>}
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-1 rounded-md font-semibold text-[10px] ${
                        o.payment_status === 'Cobrado' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {o.payment_status}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <select 
                        value={o.status} 
                        onChange={e => handleUpdateStatus(o.id, e.target.value)}
                        className={`p-1.5 rounded-lg border text-xs font-semibold ${
                          o.status === 'Entregado' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                        }`}
                      >
                        <option value="Consulta">Consulta</option>
                        <option value="Pendiente">Pendiente</option>
                        <option value="Reservado">Reservado</option>
                        <option value="Entregado">Entregado</option>
                        <option value="Cancelado">Cancelado</option>
                      </select>
                    </td>
                    <td className="p-3.5 text-right">
                      <button 
                        onClick={() => {
                          if (window.confirm('¿Eliminar pedido?')) setOrders(orders.filter((x: any) => x.id !== o.id));
                        }}
                        className="p-1.5 bg-rose-500/10 text-rose-400 rounded-lg hover:bg-rose-500/20 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className={`max-w-lg w-full p-6 rounded-2xl border shadow-2xl space-y-4 ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className="flex justify-between items-center">
              <h3 className="font-serif text-lg text-amber-200">Registrar Nuevo Pedido</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white"><X size={18}/></button>
            </div>
            <form onSubmit={handleCreateOrder} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Nombre Cliente</label>
                  <input type="text" required value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Lucía Gómez" className={`w-full p-2.5 rounded-xl border ${theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'}`}/>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Teléfono / WhatsApp</label>
                  <input type="text" required value={clientPhone} onChange={e => setClientPhone(e.target.value)} placeholder="1123456789" className={`w-full p-2.5 rounded-xl border ${theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'}`}/>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Perfume</label>
                  <select value={productId} onChange={e => setProductId(e.target.value)} className={`w-full p-2.5 rounded-xl border ${theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'}`}>
                    {products.map((p: any) => (
                      <option key={p.id} value={p.id}>{p.name} (${p.sale_price})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Cantidad</label>
                  <input type="number" required min={1} value={quantity} onChange={e => setQuantity(Number(e.target.value))} className={`w-full p-2.5 rounded-xl border ${theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'}`}/>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Precio Total ($)</label>
                  <input type="number" required value={agreedPrice} onChange={e => setAgreedPrice(e.target.value)} placeholder="65000" className={`w-full p-2.5 rounded-xl border ${theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'}`}/>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Seña Pagada ($)</label>
                  <input type="number" value={paidAmount} onChange={e => setPaidAmount(e.target.value)} placeholder="30000" className={`w-full p-2.5 rounded-xl border ${theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'}`}/>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Estado Pago</label>
                  <select value={paymentStatus} onChange={e => setPaymentStatus(e.target.value)} className={`w-full p-2.5 rounded-xl border ${theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'}`}>
                    <option value="Pendiente">Pendiente</option>
                    <option value="Seña Pagada">Seña Pagada</option>
                    <option value="Cobrado">Cobrado</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Notas</label>
                <input type="text" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Retira el sábado..." className={`w-full p-2.5 rounded-xl border ${theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'}`}/>
              </div>
              <button type="submit" className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-semibold hover:from-amber-400 hover:to-amber-500 transition-all shadow-lg">
                Registrar Pedido / Reserva
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function SalesView({ sales, setSales, products, setProducts, cashMovements, setCashMovements, supabase, user, notify, theme }: any) {
  const [showModal, setShowModal] = useState(false);
  const [clientName, setClientName] = useState('');
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [quantity, setQuantity] = useState(1);
  const [salePrice, setSalePrice] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Efectivo');
  const [paymentStatus, setPaymentStatus] = useState('Cobrado');

  const cardBg = theme === 'dark' ? 'bg-slate-900/40 border-slate-800/80' : 'bg-white border-slate-200 shadow-sm';
  const tableHeaderBg = theme === 'dark' ? 'bg-slate-950 text-slate-400' : 'bg-slate-100 text-slate-600';

  const handleCreateSale = async (e: React.FormEvent) => {
    e.preventDefault();
    const prod = products.find((p: any) => p.id === selectedProductId);
    if (!prod) return notify('Selecciona un perfume válido', 'error');

    const totalAmount = Number(salePrice) || (prod.sale_price * quantity);
    const totalCost = (prod.cost_price || 0) * Number(quantity);
    const netProfit = totalAmount - totalCost;
    const matiProfit = netProfit * 0.5;
    const celeProfit = netProfit * 0.5;

    const salePayload = {
      operation_number: Math.floor(1000 + Math.random() * 9000),
      client_name: clientName || 'Cliente General',
      total_amount: totalAmount,
      total_cost: totalCost,
      estimated_margin: netProfit,
      net_profit: netProfit,
      mati_profit: matiProfit,
      cele_profit: celeProfit,
      payment_status: paymentStatus,
      delivery_status: 'Entregado',
      payment_method: paymentMethod,
      paid_amount: totalAmount,
      pending_amount: 0,
      items: [{ product_id: prod.id, product_name: prod.name, quantity: Number(quantity), unit_price: totalAmount / quantity, unit_cost: prod.cost_price }]
    };

    if (supabase) {
      const { data, error } = await supabase.from('sales').insert([salePayload]).select();
      if (error) return notify('Error al registrar venta: ' + error.message, 'error');
      if (data) setSales([data[0], ...sales]);

      // Add cash movement
      const cashPayload = {
        type: 'INGRESO',
        category: 'Venta',
        description: `Venta #${salePayload.operation_number} - ${salePayload.client_name}`,
        amount: totalAmount,
        payment_method: paymentMethod,
        date: new Date().toISOString().split('T')[0]
      };
      const { data: cData } = await supabase.from('cash_movements').insert([cashPayload]).select();
      if (cData) setCashMovements([cData[0], ...cashMovements]);
    } else {
      const newS = { id: Date.now().toString(), ...salePayload, created_at: new Date().toISOString().split('T')[0] };
      setSales([newS, ...sales]);
      setCashMovements([{
        id: Date.now().toString(),
        type: 'INGRESO',
        category: 'Venta',
        description: `Venta #${salePayload.operation_number} - ${salePayload.client_name}`,
        amount: totalAmount,
        payment_method: paymentMethod,
        date: new Date().toISOString().split('T')[0]
      }, ...cashMovements]);
    }

    // Deduct stock
    const newStock = Math.max(0, prod.physical_stock - Number(quantity));
    setProducts(products.map((p: any) => p.id === prod.id ? { ...p, physical_stock: newStock } : p));

    setShowModal(false);
    notify('Venta registrada con éxito. Ganancia dividida 50/50.');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h1 className="font-serif text-2xl font-normal text-amber-200">Registro de Ventas &amp; Ganancia 50/50</h1>
          <p className="text-xs text-slate-400 mt-0.5">Cada venta calcula automáticamente la ganancia neta para Mati y Cele.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 rounded-xl font-medium text-xs shadow-lg hover:from-amber-400 hover:to-amber-500 transition-all"
        >
          <Plus size={16} />
          <span>Nueva Venta</span>
        </button>
      </div>

      <div className={`${cardBg} rounded-2xl overflow-hidden border`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className={`${tableHeaderBg} font-mono text-[11px] uppercase tracking-wider border-b border-slate-800/80`}>
              <tr>
                <th className="p-3.5">Nº / Cliente</th>
                <th className="p-3.5">Total Venta</th>
                <th className="p-3.5">Costo Total</th>
                <th className="p-3.5">Ganancia Neta</th>
                <th className="p-3.5">Mati (50%)</th>
                <th className="p-3.5">Cele (50%)</th>
                <th className="p-3.5">Método de Pago</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {sales.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-500 italic">No hay ventas registradas.</td>
                </tr>
              ) : (
                sales.map((s: any) => (
                  <tr key={s.id} className="hover:bg-amber-500/5 transition-colors">
                    <td className="p-3.5">
                      <div className="font-semibold text-slate-200">#{s.operation_number} &bull; {s.client_name}</div>
                      <div className="text-[10px] text-slate-400">{s.created_at || 'Hoy'}</div>
                    </td>
                    <td className="p-3.5 font-mono text-amber-300 font-semibold">${s.total_amount?.toLocaleString()}</td>
                    <td className="p-3.5 font-mono text-slate-400">${s.total_cost?.toLocaleString()}</td>
                    <td className="p-3.5 font-mono text-emerald-400 font-semibold">${s.net_profit?.toLocaleString()}</td>
                    <td className="p-3.5 font-mono text-amber-200">${s.mati_profit?.toLocaleString()}</td>
                    <td className="p-3.5 font-mono text-amber-200">${s.cele_profit?.toLocaleString()}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
                        {s.payment_method}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className={`max-w-lg w-full p-6 rounded-2xl border shadow-2xl space-y-4 ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className="flex justify-between items-center">
              <h3 className="font-serif text-lg text-amber-200">Registrar Venta Directa</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white"><X size={18}/></button>
            </div>
            <form onSubmit={handleCreateSale} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Nombre Cliente</label>
                <input type="text" value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Carlos Mendez" className={`w-full p-2.5 rounded-xl border ${theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'}`}/>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Perfume</label>
                  <select value={selectedProductId} onChange={e => setSelectedProductId(e.target.value)} className={`w-full p-2.5 rounded-xl border ${theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'}`}>
                    {products.map((p: any) => (
                      <option key={p.id} value={p.id}>{p.name} (Stock: {p.physical_stock})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Cantidad</label>
                  <input type="number" min={1} required value={quantity} onChange={e => setQuantity(Number(e.target.value))} className={`w-full p-2.5 rounded-xl border ${theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'}`}/>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Precio Venta Total ($)</label>
                  <input type="number" required value={salePrice} onChange={e => setSalePrice(e.target.value)} placeholder="58000" className={`w-full p-2.5 rounded-xl border ${theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'}`}/>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Método de Pago</label>
                  <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className={`w-full p-2.5 rounded-xl border ${theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'}`}>
                    <option value="Efectivo">Efectivo</option>
                    <option value="Transferencia">Transferencia</option>
                    <option value="Mercado Pago">Mercado Pago</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-semibold hover:from-amber-400 hover:to-amber-500 transition-all shadow-lg">
                Confirmar Venta y Dividir Ganancia
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function CashView({ cashMovements, setCashMovements, supabase, notify, theme }: any) {
  const [showModal, setShowModal] = useState(false);
  const [type, setType] = useState('INGRESO');
  const [category, setCategory] = useState('Varios');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Efectivo');

  const cardBg = theme === 'dark' ? 'bg-slate-900/40 border-slate-800/80' : 'bg-white border-slate-200 shadow-sm';
  const tableHeaderBg = theme === 'dark' ? 'bg-slate-950 text-slate-400' : 'bg-slate-100 text-slate-600';

  const handleCreateMovement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount) return notify('Completa todos los campos', 'error');

    const payload = {
      type,
      category,
      description,
      amount: Number(amount),
      payment_method: paymentMethod,
      date: new Date().toISOString().split('T')[0]
    };

    if (supabase) {
      const { data, error } = await supabase.from('cash_movements').insert([payload]).select();
      if (error) return notify('Error: ' + error.message, 'error');
      if (data) setCashMovements([data[0], ...cashMovements]);
    } else {
      setCashMovements([{ id: Date.now().toString(), ...payload }, ...cashMovements]);
    }

    setShowModal(false);
    notify('Movimiento de caja registrado');
  };

  const totalIngresos = cashMovements.filter((c: any) => c.type === 'INGRESO').reduce((acc: number, c: any) => acc + c.amount, 0);
  const totalEgresos = cashMovements.filter((c: any) => c.type === 'EGRESO').reduce((acc: number, c: any) => acc + c.amount, 0);
  const balanceCaja = totalIngresos - totalEgresos;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h1 className="font-serif text-2xl font-normal text-amber-200">Caja y Movimientos de Dinero</h1>
          <p className="text-xs text-slate-400 mt-0.5">Control de ingresos, egresos y balance general.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 rounded-xl font-medium text-xs shadow-lg hover:from-amber-400 hover:to-amber-500 transition-all"
        >
          <Plus size={16} />
          <span>Registrar Movimiento</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className={`${cardBg} p-5 rounded-2xl border`}>
          <p className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Total Ingresos</p>
          <h3 className="text-2xl font-serif text-emerald-400 mt-1">${totalIngresos.toLocaleString()}</h3>
        </div>
        <div className={`${cardBg} p-5 rounded-2xl border`}>
          <p className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Total Egresos</p>
          <h3 className="text-2xl font-serif text-rose-400 mt-1">${totalEgresos.toLocaleString()}</h3>
        </div>
        <div className={`${cardBg} p-5 rounded-2xl border`}>
          <p className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Balance de Caja</p>
          <h3 className="text-2xl font-serif text-amber-200 mt-1">${balanceCaja.toLocaleString()}</h3>
        </div>
      </div>

      <div className={`${cardBg} rounded-2xl overflow-hidden border`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className={`${tableHeaderBg} font-mono text-[11px] uppercase tracking-wider border-b border-slate-800/80`}>
              <tr>
                <th className="p-3.5">Fecha</th>
                <th className="p-3.5">Tipo</th>
                <th className="p-3.5">Categoría</th>
                <th className="p-3.5">Descripción</th>
                <th className="p-3.5">Método</th>
                <th className="p-3.5 text-right">Monto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {cashMovements.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-500 italic">No hay movimientos registrados.</td>
                </tr>
              ) : (
                cashMovements.map((c: any) => (
                  <tr key={c.id} className="hover:bg-amber-500/5 transition-colors">
                    <td className="p-3.5 font-mono text-slate-400">{c.date}</td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded font-semibold text-[10px] ${
                        c.type === 'INGRESO' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {c.type}
                      </span>
                    </td>
                    <td className="p-3.5 font-medium text-slate-200">{c.category}</td>
                    <td className="p-3.5 text-slate-300">{c.description}</td>
                    <td className="p-3.5 text-slate-400">{c.payment_method}</td>
                    <td className={`p-3.5 text-right font-mono font-bold ${c.type === 'INGRESO' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {c.type === 'INGRESO' ? '+' : '-'}${c.amount?.toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className={`max-w-md w-full p-6 rounded-2xl border shadow-2xl space-y-4 ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className="flex justify-between items-center">
              <h3 className="font-serif text-lg text-amber-200">Nuevo Movimiento de Caja</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white"><X size={18}/></button>
            </div>
            <form onSubmit={handleCreateMovement} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Tipo</label>
                  <select value={type} onChange={e => setType(e.target.value)} className={`w-full p-2.5 rounded-xl border ${theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'}`}>
                    <option value="INGRESO">INGRESO</option>
                    <option value="EGRESO">EGRESO</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Categoría</label>
                  <select value={category} onChange={e => setCategory(e.target.value)} className={`w-full p-2.5 rounded-xl border ${theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'}`}>
                    <option value="Venta">Venta</option>
                    <option value="Insumos">Insumos</option>
                    <option value="Reposición">Reposición</option>
                    <option value="Retiro Socios">Retiro Socios</option>
                    <option value="Varios">Varios</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Descripción</label>
                <input type="text" required value={description} onChange={e => setDescription(e.target.value)} placeholder="Compra de frascos..." className={`w-full p-2.5 rounded-xl border ${theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'}`}/>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Monto ($)</label>
                  <input type="number" required value={amount} onChange={e => setAmount(e.target.value)} placeholder="8500" className={`w-full p-2.5 rounded-xl border ${theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'}`}/>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Método de Pago</label>
                  <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className={`w-full p-2.5 rounded-xl border ${theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'}`}>
                    <option value="Efectivo">Efectivo</option>
                    <option value="Transferencia">Transferencia</option>
                    <option value="Mercado Pago">Mercado Pago</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-semibold hover:from-amber-400 hover:to-amber-500 transition-all shadow-lg">
                Guardar Movimiento
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function InvestmentView({ sales, debts, setDebts, config, supabase, notify, theme }: any) {
  const cardBg = theme === 'dark' ? 'bg-slate-900/40 border-slate-800/80' : 'bg-white border-slate-200 shadow-sm';
  const tableHeaderBg = theme === 'dark' ? 'bg-slate-950 text-slate-400' : 'bg-slate-100 text-slate-600';

  const totalNetProfit = sales.reduce((acc: number, s: any) => acc + (s.net_profit || 0), 0);
  const matiProfit = totalNetProfit * 0.5;
  const celeProfit = totalNetProfit * 0.5;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h1 className="font-serif text-2xl font-normal text-amber-200">Ganancias &amp; Socios (Mati &amp; Cele)</h1>
          <p className="text-xs text-slate-400 mt-0.5">Control de inversión inicial, deudas y distribución de utilidades 50/50.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={`${cardBg} p-6 rounded-2xl border space-y-4`}>
          <h3 className="font-serif text-lg text-amber-200 flex items-center space-x-2">
            <Users size={18} className="text-amber-400" />
            <span>Distribución de Socios</span>
          </h3>
          <div className="space-y-3 pt-2">
            <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 flex justify-between items-center">
              <div>
                <span className="font-semibold text-slate-200">Mati (Socio 1)</span>
                <p className="text-[11px] text-slate-400">Participación del 50% en ganancias netas</p>
              </div>
              <span className="font-serif text-xl text-amber-300">${matiProfit.toLocaleString()}</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 flex justify-between items-center">
              <div>
                <span className="font-semibold text-slate-200">Cele (Socio 2)</span>
                <p className="text-[11px] text-slate-400">Participación del 50% en ganancias netas</p>
              </div>
              <span className="font-serif text-xl text-amber-300">${celeProfit.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className={`${cardBg} p-6 rounded-2xl border space-y-4`}>
          <h3 className="font-serif text-lg text-amber-200 flex items-center space-x-2">
            <Wallet size={18} className="text-amber-400" />
            <span>Inversión Inicial y Deudas</span>
          </h3>
          <div className="space-y-3 pt-2">
            <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 flex justify-between items-center text-xs">
              <div>
                <span className="font-semibold text-slate-200">Capital Inicial Invertido</span>
                <p className="text-[10px] text-slate-400">Fondo de reposición y stock</p>
              </div>
              <span className="font-mono font-bold text-amber-300">${config.initialInvestment?.toLocaleString()}</span>
            </div>
            {debts.map((d: any) => (
              <div key={d.id} className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 flex justify-between items-center text-xs">
                <div>
                  <span className="font-semibold text-slate-200">{d.concept}</span>
                  <p className="text-[10px] text-slate-400">Estado: {d.status}</p>
                </div>
                <span className="font-mono font-bold text-rose-400">${d.current_amount?.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SuppliesView({ supplies, setSupplies, supabase, notify, theme }: any) {
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('Unidades');
  const [quantity, setQuantity] = useState('');
  const [minStock, setMinStock] = useState('10');
  const [unitCost, setUnitCost] = useState('');

  const cardBg = theme === 'dark' ? 'bg-slate-900/40 border-slate-800/80' : 'bg-white border-slate-200 shadow-sm';
  const tableHeaderBg = theme === 'dark' ? 'bg-slate-950 text-slate-400' : 'bg-slate-100 text-slate-600';

  const handleCreateSupply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !quantity || !unitCost) return notify('Completa todos los campos', 'error');

    const payload = {
      name,
      unit,
      quantity: Number(quantity),
      min_stock: Number(minStock),
      unit_cost: Number(unitCost)
    };

    if (supabase) {
      const { data, error } = await supabase.from('supplies').insert([payload]).select();
      if (error) return notify('Error: ' + error.message, 'error');
      if (data) setSupplies([data[0], ...supplies]);
    } else {
      setSupplies([{ id: Date.now().toString(), ...payload }, ...supplies]);
    }

    setShowModal(false);
    notify('Insumo registrado');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h1 className="font-serif text-2xl font-normal text-amber-200">Insumos &amp; Packaging</h1>
          <p className="text-xs text-slate-400 mt-0.5">Control de frascos, atomizadores, cajas y etiquetas.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 rounded-xl font-medium text-xs shadow-lg hover:from-amber-400 hover:to-amber-500 transition-all"
        >
          <Plus size={16} />
          <span>Nuevo Insumo</span>
        </button>
      </div>

      <div className={`${cardBg} rounded-2xl overflow-hidden border`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className={`${tableHeaderBg} font-mono text-[11px] uppercase tracking-wider border-b border-slate-800/80`}>
              <tr>
                <th className="p-3.5">Insumo / Material</th>
                <th className="p-3.5">Costo Unitario</th>
                <th className="p-3.5 text-center">Stock Actual</th>
                <th className="p-3.5 text-center">Stock Mínimo</th>
                <th className="p-3.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {supplies.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-500 italic">No hay insumos registrados.</td>
                </tr>
              ) : (
                supplies.map((s: any) => (
                  <tr key={s.id} className="hover:bg-amber-500/5 transition-colors">
                    <td className="p-3.5 font-semibold text-slate-200">{s.name}</td>
                    <td className="p-3.5 font-mono text-slate-300">${s.unit_cost?.toLocaleString()}</td>
                    <td className="p-3.5 text-center font-mono font-bold text-amber-300">{s.quantity} {s.unit}</td>
                    <td className="p-3.5 text-center font-mono text-slate-400">{s.min_stock}</td>
                    <td className="p-3.5 text-right">
                      <button 
                        onClick={() => setSupplies(supplies.filter((x: any) => x.id !== s.id))}
                        className="p-1.5 bg-rose-500/10 text-rose-400 rounded-lg hover:bg-rose-500/20 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className={`max-w-md w-full p-6 rounded-2xl border shadow-2xl space-y-4 ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className="flex justify-between items-center">
              <h3 className="font-serif text-lg text-amber-200">Nuevo Insumo</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white"><X size={18}/></button>
            </div>
            <form onSubmit={handleCreateSupply} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Nombre Insumo</label>
                <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="Frascos 100ml..." className={`w-full p-2.5 rounded-xl border ${theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'}`}/>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Cantidad</label>
                  <input type="number" required value={quantity} onChange={e => setQuantity(e.target.value)} className={`w-full p-2.5 rounded-xl border ${theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'}`}/>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Stock Mín.</label>
                  <input type="number" required value={minStock} onChange={e => setMinStock(e.target.value)} className={`w-full p-2.5 rounded-xl border ${theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'}`}/>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Costo Unit. ($)</label>
                  <input type="number" required value={unitCost} onChange={e => setUnitCost(e.target.value)} className={`w-full p-2.5 rounded-xl border ${theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'}`}/>
                </div>
              </div>
              <button type="submit" className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-semibold hover:from-amber-400 hover:to-amber-500 transition-all shadow-lg">
                Guardar Insumo
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function CalculatorView({ config, theme }: any) {
  const [cost, setCost] = useState('20000');
  const [desiredMargin, setDesiredMargin] = useState('100');

  const cardBg = theme === 'dark' ? 'bg-slate-900/40 border-slate-800/80' : 'bg-white border-slate-200 shadow-sm';

  const numCost = Number(cost) || 0;
  const numMargin = Number(desiredMargin) || 0;
  const suggestedPrice = numCost * (1 + numMargin / 100);
  const estimatedProfit = suggestedPrice - numCost;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="pb-2 border-b border-slate-800/80">
        <h1 className="font-serif text-2xl font-normal text-amber-200">Calculadora de Márgenes &amp; Precios</h1>
        <p className="text-xs text-slate-400 mt-0.5">Calcula el precio de venta sugerido basado en tu costo y margen deseado.</p>
      </div>

      <div className={`${cardBg} p-6 rounded-2xl border space-y-4 text-xs`}>
        <div>
          <label className="text-slate-400 block mb-1">Costo Total de Producción / Adquisición ($)</label>
          <input type="number" value={cost} onChange={e => setCost(e.target.value)} className={`w-full p-3 rounded-xl border ${theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-200 font-mono text-sm' : 'bg-slate-50 border-slate-200 text-slate-800 font-mono text-sm'}`}/>
        </div>
        <div>
          <label className="text-slate-400 block mb-1">Margen de Ganancia Deseado (%)</label>
          <input type="number" value={desiredMargin} onChange={e => setDesiredMargin(e.target.value)} className={`w-full p-3 rounded-xl border ${theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-200 font-mono text-sm' : 'bg-slate-50 border-slate-200 text-slate-800 font-mono text-sm'}`}/>
        </div>

        <div className="p-5 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-2 mt-4">
          <div className="flex justify-between items-center">
            <span className="text-slate-300 font-medium">Precio de Venta Sugerido:</span>
            <span className="font-serif text-2xl text-amber-300 font-bold">${suggestedPrice.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-slate-400">Ganancia Neta Estimada:</span>
            <span className="font-mono text-emerald-400">${estimatedProfit.toLocaleString()} (Mati: ${(estimatedProfit*0.5).toLocaleString()} / Cele: ${(estimatedProfit*0.5).toLocaleString()})</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReportsView({ products, sales, theme }: any) {
  const cardBg = theme === 'dark' ? 'bg-slate-900/40 border-slate-800/80' : 'bg-white border-slate-200 shadow-sm';

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="pb-2 border-b border-slate-800/80">
        <h1 className="font-serif text-2xl font-normal text-amber-200">Reportes &amp; Datos</h1>
        <p className="text-xs text-slate-400 mt-0.5">Resumen analítico y estadísticas de rendimiento.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className={`${cardBg} p-5 rounded-2xl border space-y-2`}>
          <h3 className="font-serif text-base text-amber-200">Perfumes en Inventario</h3>
          <p className="text-3xl font-serif text-slate-100">{products.length}</p>
          <p className="text-[11px] text-slate-400">Variedades de alta perfumería registradas</p>
        </div>
        <div className={`${cardBg} p-5 rounded-2xl border space-y-2`}>
          <h3 className="font-serif text-base text-amber-200">Total Operaciones de Venta</h3>
          <p className="text-3xl font-serif text-emerald-400">{sales.length}</p>
          <p className="text-[11px] text-slate-400">Ventas completadas con éxito</p>
        </div>
      </div>
    </div>
  );
}

function ConfigView({ config, setConfig, notify, theme }: any) {
  const [busName, setBusName] = useState(config.businessName);
  const [inv, setInv] = useState(config.initialInvestment);

  const cardBg = theme === 'dark' ? 'bg-slate-900/40 border-slate-800/80' : 'bg-white border-slate-200 shadow-sm';

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setConfig({...config, businessName: busName, initialInvestment: Number(inv)});
    notify('Ajustes guardados correctamente');
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="pb-2 border-b border-slate-800/80">
        <h1 className="font-serif text-2xl font-normal text-amber-200">Ajustes del Negocio</h1>
        <p className="text-xs text-slate-400 mt-0.5">Configura los parámetros generales de C&amp;M Perfumes.</p>
      </div>

      <form onSubmit={handleSave} className={`${cardBg} p-6 rounded-2xl border space-y-4 text-xs`}>
        <div>
          <label className="text-slate-400 block mb-1">Nombre del Negocio</label>
          <input type="text" value={busName} onChange={e => setBusName(e.target.value)} className={`w-full p-2.5 rounded-xl border ${theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'}`}/>
        </div>
        <div>
          <label className="text-slate-400 block mb-1">Capital Inicial Invertido ($)</label>
          <input type="number" value={inv} onChange={e => setInv(e.target.value)} className={`w-full p-2.5 rounded-xl border ${theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'}`}/>
        </div>
        <button type="submit" className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-semibold hover:from-amber-400 hover:to-amber-500 transition-all shadow-lg">
          Guardar Cambios
        </button>
      </form>
    </div>
  );
}

export default App;