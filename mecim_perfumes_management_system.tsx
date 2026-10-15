import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Package, ShoppingBag, ShoppingCart, Wallet, 
  TrendingUp, Box, Calculator as CalcIcon, FileText, Settings, 
  Search, Plus, Trash2, Edit3, CheckCircle2, 
  AlertTriangle, ShieldCheck, RefreshCw, 
  Lock, DollarSign, X, History, LogOut, Key, AlertCircle,
  Sun, Moon
} from 'lucide-react';

export interface Product {
  id: string;
  name: string;
  brand: string;
  concentration: string;
  volume_ml: number;
  internal_code: string;
  cost_price: number;
  sale_price: number;
  physical_stock: number;
  reserved_stock: number;
  min_stock: number;
  notes?: string;
  created_at?: string;
}

export interface InventoryMovement {
  id: string;
  product_id: string;
  product_name?: string;
  type: 'COMPRA' | 'SALIDA' | 'AJUSTE' | 'RESERVA' | 'LIBERACION' | 'VENTA';
  quantity: number;
  reason: string;
  user_email?: string;
  created_at: string;
}

export interface Order {
  id: string;
  client_name: string;
  client_phone: string;
  product_id: string;
  product_name: string;
  quantity: number;
  agreed_price: number;
  status: 'Consulta' | 'Pendiente' | 'Reservado' | 'Entregado' | 'Cancelado';
  payment_status: 'Pendiente' | 'Seña Pagada' | 'Cobrado';
  paid_amount: number;
  pending_amount: number;
  created_at: string;
  notes?: string;
}

export interface Sale {
  id: string;
  operation_number: number;
  client_name: string;
  total_amount: number;
  total_cost: number;
  estimated_margin: number;
  payment_status: string;
  delivery_status: string;
  payment_method: string;
  paid_amount: number;
  pending_amount: number;
  created_at: string;
  items: Array<{
    product_id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
    unit_cost: number;
  }>;
}

export interface CashMovement {
  id: string;
  type: 'INGRESO' | 'EGRESO';
  category: string;
  description: string;
  amount: number;
  payment_method: string;
  date: string;
}

export interface Supply {
  id: string;
  name: string;
  unit: string;
  quantity: number;
  min_stock: number;
  unit_cost: number;
}

export interface BusinessConfig {
  businessName: string;
  tagline: string;
  currency: string;
  restockPct: number;
  debtPct: number;
  initialInvestment: number;
  supabaseUrl?: string;
  supabaseAnonKey?: string;
}

const getSupabaseClient = (url?: string, key?: string) => {
  const envUrl = url || localStorage.getItem('CM_SUPABASE_URL');
  const envKey = key || localStorage.getItem('CM_SUPABASE_KEY');

  if (envUrl && envKey && (window as any).supabase) {
    try {
      return (window as any).supabase.createClient(envUrl, envKey);
    } catch (e) {
      console.error('Error initializing Supabase client:', e);
      return null;
    }
  }
  return null;
};

export default function App() {
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
  const [config, setConfig] = useState<BusinessConfig>({
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
  const [products, setProducts] = useState<Product[]>([]);
  const [inventoryMovements, setInventoryMovements] = useState<InventoryMovement[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [cashMovements, setCashMovements] = useState<CashMovement[]>([]);
  const [supplies, setSupplies] = useState<Supply[]>([]);
  const [debts, setDebts] = useState<any[]>([
    { id: 'd1', concept: 'Capital Inicial Préstamo Reposición', initial_amount: 220000, current_amount: 175000, status: 'En Pago' }
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

  useEffect(() => {
    // Inject Supabase script tag dynamically if not present
    if (!document.getElementById('supabase-cdn')) {
      const script = document.createElement('script');
      script.id = 'supabase-cdn';
      script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
      script.async = true;
      script.onload = () => {
        const client = getSupabaseClient();
        if (client) {
          setSupabase(client);
        }
        setAuthLoading(false);
      };
      document.body.appendChild(script);
    } else {
      setAuthLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!supabase) {
      setAuthLoading(false);
      return;
    }

    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
      } catch (e) {
        console.error('Session check error', e);
      } finally {
        setAuthLoading(false);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    return () => subscription?.unsubscribe();
  }, [supabase]);

  const fetchAllData = async () => {
    if (!supabase) return;

    try {
      const { data: prodData } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (prodData) setProducts(prodData);

      const { data: movData } = await supabase.from('inventory_movements').select('*').order('created_at', { ascending: false });
      if (movData) setInventoryMovements(movData);

      const { data: ordData } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      if (ordData) setOrders(ordData);

      const { data: salesData } = await supabase.from('sales').select('*').order('created_at', { ascending: false });
      if (salesData) setSales(salesData);

      const { data: cashData } = await supabase.from('cash_movements').select('*').order('created_at', { ascending: false });
      if (cashData) setCashMovements(cashData);

      const { data: supData } = await supabase.from('supplies').select('*').order('created_at', { ascending: false });
      if (supData) setSupplies(supData);
    } catch (err) {
      console.error('Error fetching data from Supabase:', err);
    }
  };

  useEffect(() => {
    if (user && supabase) {
      fetchAllData();
    }
  }, [user, supabase]);

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
      {/* Toast Notification */}
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
            
            {/* LOGO C&M PERFUMES - REDISEÑADO LUXURY BOUTIQUE */}
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
                  Haute Parfumerie &bull; Est. 2026
                </span>
              </div>
            </div>
          </div>

          {/* User Options & Theme Switcher */}
          <div className="flex items-center space-x-3">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-xl border transition-colors ${
                theme === 'dark' ? 'bg-slate-900 border-slate-800 text-amber-400 hover:bg-slate-800' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
              }`}
              title="Cambiar tema de color"
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
                Modo Local / Sin Login
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Login Modal Overlay if Supabase configured but user not logged in */}
      {!user && supabase && !authLoading && (
        <div className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className={`max-w-md w-full p-6 rounded-2xl border shadow-2xl space-y-4 ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
                <Lock size={22} />
              </div>
              <h2 className="font-serif text-xl font-normal text-amber-200">Acceso a C&M Perfumes</h2>
              <p className="text-xs text-slate-400">Ingresa con tu usuario registrado para sincronizar datos en vivo.</p>
            </div>

            {authError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-400 flex items-center space-x-2">
                <AlertCircle size={16} />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Correo Electrónico</label>
                <input 
                  type="email" 
                  required 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  className={`w-full p-2.5 rounded-xl border focus:outline-none ${theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'}`} 
                  placeholder="socio@cmperfumes.com"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Contraseña</label>
                <input 
                  type="password" 
                  required 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  className={`w-full p-2.5 rounded-xl border focus:outline-none ${theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'}`} 
                  placeholder="••••••••"
                />
              </div>
              <button type="submit" className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-semibold hover:from-amber-400 hover:to-amber-500 transition-all shadow-lg">
                Iniciar Sesión
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Main Layout Body */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Sidebar */}
        <aside className={`
          fixed md:static inset-y-0 left-0 z-40 w-64 ${bgSidebar} text-slate-300 transform transition-transform duration-200 ease-in-out flex flex-col border-r
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          <div className="p-4 border-b border-slate-800/80 flex justify-between items-center md:hidden">
            <span className="font-serif text-sm tracking-widest text-amber-200 uppercase">Menú C&M</span>
            <button onClick={() => setMobileMenuOpen(false)} className="text-slate-400 hover:text-white">
              <X size={20} />
            </button>
          </div>
          
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {[
              { id: 'inicio', label: 'Resumen General', icon: LayoutDashboard },
              { id: 'stock', label: 'Stock & Inventario', icon: Package },
              { id: 'pedidos', label: 'Pedidos y Reservas', icon: ShoppingBag },
              { id: 'ventas', label: 'Ventas Realizadas', icon: ShoppingCart },
              { id: 'caja', label: 'Caja y Movimientos', icon: Wallet },
              { id: 'inversion', label: 'Deuda y Capital', icon: TrendingUp },
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
            C&M Perfumes &bull; v2.5
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          {activeTab === 'inicio' && <DashboardView products={products} orders={orders} sales={sales} cashMovements={cashMovements} debts={debts} theme={theme} />}
          {activeTab === 'stock' && <StockModule products={products} setProducts={setProducts} inventoryMovements={inventoryMovements} setInventoryMovements={setInventoryMovements} supabase={supabase} user={user} notify={notify} theme={theme} />}
          {activeTab === 'pedidos' && <OrdersView orders={orders} setOrders={setOrders} products={products} setProducts={setProducts} supabase={supabase} notify={notify} theme={theme} />}
          {activeTab === 'ventas' && <SalesView sales={sales} setSales={setSales} products={products} supabase={supabase} notify={notify} theme={theme} />}
          {activeTab === 'caja' && <CashView cashMovements={cashMovements} setCashMovements={setCashMovements} supabase={supabase} notify={notify} theme={theme} />}
          {activeTab === 'inversion' && <InvestmentView debts={debts} config={config} theme={theme} />}
          {activeTab === 'insumos' && <SuppliesView supplies={supplies} setSupplies={setSupplies} supabase={supabase} notify={notify} theme={theme} />}
          {activeTab === 'calculadora' && <CalculatorView config={config} theme={theme} />}
          {activeTab === 'informes' && <ReportsView products={products} sales={sales} theme={theme} />}
          {activeTab === 'config' && <ConfigView config={config} setConfig={setConfig} notify={notify} theme={theme} />}
        </main>
      </div>

      {/* Supabase Credential Config Modal */}
      {showConfigModal && (
        <SupabaseConfigModal 
          config={config} 
          onSave={saveSupabaseKeys} 
          onClose={() => setShowConfigModal(false)} 
          theme={theme}
        />
      )}
    </div>
  );
}

function StockModule({ products, setProducts, inventoryMovements, setInventoryMovements, supabase, user, notify, theme }: any) {
  const [showModal, setShowModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

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

  const handleOpenEdit = (p: Product) => {
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
        setProducts(products.map((p: Product) => p.id === editingProduct.id ? { ...p, ...payload } : p));
        notify('Perfume actualizado en Supabase');
      } else {
        const { data, error } = await supabase.from('products').insert([{ ...payload, reserved_stock: 0 }]).select();
        if (error) return notify('Error al crear: ' + error.message, 'error');
        if (data) setProducts([data[0], ...products]);
        notify('Perfume registrado con éxito');
      }
    } else {
      if (editingProduct) {
        setProducts(products.map((p: Product) => p.id === editingProduct.id ? { ...p, ...payload } : p));
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
    setProducts(products.filter((p: Product) => p.id !== id));
    notify('Perfume eliminado del inventario');
  };

  const handleStockAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    let newStock = selectedProduct.physical_stock;
    if (adjustData.type === 'COMPRA') newStock += adjustData.quantity;
    if (adjustData.type === 'SALIDA') newStock = Math.max(0, newStock - adjustData.quantity);
    if (adjustData.type === 'AJUSTE') newStock = adjustData.quantity;

    if (supabase) {
      const { error: pErr } = await supabase.from('products').update({ physical_stock: newStock }).eq('id', selectedProduct.id);
      if (pErr) return notify('Error al actualizar stock: ' + pErr.message, 'error');

      const movPayload = {
        product_id: selectedProduct.id,
        type: adjustData.type,
        quantity: adjustData.quantity,
        reason: adjustData.reason,
        user_email: user?.email || 'Socio C&M'
      };

      const { data: mData, error: mErr } = await supabase.from('inventory_movements').insert([movPayload]).select();
      if (!mErr && mData) {
        setInventoryMovements([mData[0], ...inventoryMovements]);
      }
    }

    setProducts(products.map((p: Product) => p.id === selectedProduct.id ? { ...p, physical_stock: newStock } : p));
    setShowAdjustModal(false);
    notify('Ajuste de stock guardado');
  };

  const filteredProducts = products.filter((p: Product) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h1 className="font-serif text-2xl font-normal text-amber-200">Gestión de Stock & Inventario</h1>
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

      <div className={`${cardBg} rounded-2xl overflow-hidden`}>
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
              {filteredProducts.map((p: Product) => {
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
                        className="p-1.5 text-amber-400 hover:text-amber-300 rounded-lg hover:bg-slate-800 transition-colors"
                        title="Ajustar stock"
                      >
                        <RefreshCw size={15} />
                      </button>
                      <button 
                        onClick={() => handleOpenEdit(p)}
                        className="p-1.5 text-slate-400 hover:text-amber-300 rounded-lg hover:bg-slate-800 transition-colors"
                        title="Editar producto"
                      >
                        <Edit3 size={15} />
                      </button>
                      <button 
                        onClick={() => handleDeleteProduct(p.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                        title="Eliminar producto"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add/Edit */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`border rounded-2xl w-full max-w-lg p-6 space-y-4 ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-serif text-lg text-amber-200">{editingProduct ? 'Editar Perfume' : 'Nuevo Perfume'}</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white"><X size={18}/></button>
            </div>
            <form onSubmit={handleSaveProduct} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Nombre</label>
                  <input type="text" required placeholder="Ej: Sauvage" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className={`w-full p-2 border rounded-xl text-slate-200 ${theme === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200 text-slate-800'}`} />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Marca</label>
                  <input type="text" required placeholder="Ej: Dior" value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} className={`w-full p-2 border rounded-xl text-slate-200 ${theme === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200 text-slate-800'}`} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Costo Compra ($)</label>
                  <input type="number" required placeholder="30000" value={formData.cost_price} onChange={e => setFormData({...formData, cost_price: e.target.value})} className={`w-full p-2 border rounded-xl font-mono ${theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'}`} />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Precio Venta ($)</label>
                  <input type="number" required placeholder="65000" value={formData.sale_price} onChange={e => setFormData({...formData, sale_price: e.target.value})} className={`w-full p-2 border rounded-xl font-mono ${theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'}`} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Stock Físico</label>
                  <input type="number" placeholder="5" value={formData.physical_stock} onChange={e => setFormData({...formData, physical_stock: e.target.value})} className={`w-full p-2 border rounded-xl font-mono ${theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'}`} />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Volumen (ml)</label>
                  <input type="number" placeholder="100" value={formData.volume_ml} onChange={e => setFormData({...formData, volume_ml: Number(e.target.value)})} className={`w-full p-2 border rounded-xl font-mono ${theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'}`} />
                </div>
              </div>
              <div className="pt-2 flex justify-end space-x-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300">Cancelar</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-semibold hover:bg-amber-400">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Adjustment Modal */}
      {showAdjustModal && selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`border rounded-2xl w-full max-w-md p-6 space-y-4 ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-serif text-lg text-amber-200">Ajustar Stock - {selectedProduct.name}</h3>
              <button onClick={() => setShowAdjustModal(false)} className="text-slate-400 hover:text-white"><X size={18}/></button>
            </div>
            <form onSubmit={handleStockAdjustment} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Tipo de Movimiento</label>
                <select value={adjustData.type} onChange={e => setAdjustData({...adjustData, type: e.target.value as any})} className={`w-full p-2 border rounded-xl ${theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'}`}>
                  <option value="COMPRA">COMPRA / REPOSICION (+)</option>
                  <option value="SALIDA">SALIDA / ROTURA (-)</option>
                  <option value="AJUSTE">AJUSTE RE-RECUENTO (Fijar exacto)</option>
                </select>
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Cantidad</label>
                <input type="number" min="1" required value={adjustData.quantity} onChange={e => setAdjustData({...adjustData, quantity: Number(e.target.value)})} className={`w-full p-2 border rounded-xl font-mono ${theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'}`} />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Motivo</label>
                <input type="text" required value={adjustData.reason} onChange={e => setAdjustData({...adjustData, reason: e.target.value})} className={`w-full p-2 border rounded-xl ${theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'}`} />
              </div>
              <div className="pt-2 flex justify-end space-x-2">
                <button type="button" onClick={() => setShowAdjustModal(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300">Cancelar</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-semibold">Confirmar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`border rounded-2xl w-full max-w-2xl p-6 space-y-4 max-h-[80vh] flex flex-col ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-serif text-lg text-amber-200">Historial de Movimientos de Stock</h3>
              <button onClick={() => setShowHistoryModal(false)} className="text-slate-400 hover:text-white"><X size={18}/></button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2">
              {inventoryMovements.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-6 text-center">No hay movimientos registrados.</p>
              ) : (
                inventoryMovements.map((m: InventoryMovement) => (
                  <div key={m.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-slate-200">{m.type}</span>
                      <p className="text-slate-400 text-[11px] mt-0.5">{m.reason}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-amber-300 font-bold">Cant: {m.quantity}</span>
                      <div className="text-[10px] text-slate-500">{m.user_email || 'Socio'}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SupabaseConfigModal({ config, onSave, onClose, theme }: any) {
  const [url, setUrl] = useState(config.supabaseUrl || '');
  const [key, setKey] = useState(config.supabaseAnonKey || '');

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className={`max-w-md w-full p-6 rounded-2xl border shadow-2xl space-y-4 ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <h3 className="font-serif text-lg text-amber-200 flex items-center space-x-2">
            <Key size={18} />
            <span>Configuración de Supabase</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={18}/></button>
        </div>

        <p className="text-xs text-slate-400">
          Ingresa la URL y la Anon Key de tu proyecto Supabase para activar la sincronización en tiempo real y el inicio de sesión compartido.
        </p>

        <div className="space-y-3 text-xs">
          <div>
            <label className="text-slate-400 block mb-1">SUPABASE URL</label>
            <input 
              type="text" 
              value={url} 
              onChange={e => setUrl(e.target.value)} 
              placeholder="https://xyz.supabase.co" 
              className={`w-full p-2.5 rounded-xl border font-mono text-xs ${theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'}`} 
            />
          </div>
          <div>
            <label className="text-slate-400 block mb-1">SUPABASE ANON KEY</label>
            <input 
              type="password" 
              value={key} 
              onChange={e => setKey(e.target.value)} 
              placeholder="eyJhbGciOiJIUzI1Ni..." 
              className={`w-full p-2.5 rounded-xl border font-mono text-xs ${theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'}`} 
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end space-x-2">
          <button onClick={onClose} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs">Cancelar</button>
          <button onClick={() => onSave(url, key)} className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-semibold text-xs hover:bg-amber-400">Guardar & Conectar</button>
        </div>
      </div>
    </div>
  );
}

function DashboardView({ products, orders, sales, cashMovements, debts, theme }: any) {
  const totalPhysicalStock = products.reduce((acc: number, p: any) => acc + (p.physical_stock || 0), 0);
  const totalReservedStock = products.reduce((acc: number, p: any) => acc + (p.reserved_stock || 0), 0);
  const availableStock = totalPhysicalStock - totalReservedStock;
  const stockCostValue = products.reduce((acc: number, p: any) => acc + ((p.physical_stock || 0) * (p.cost_price || 0)), 0);

  const cardBg = theme === 'dark' ? 'bg-slate-900/60 border-slate-800/80' : 'bg-white border-slate-200 shadow-sm';

  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-slate-800/80">
        <h1 className="font-serif text-2xl font-normal text-amber-200">Panel Operativo & Resumen</h1>
        <p className="text-xs text-slate-400 mt-1">Métricas esenciales para la gestión de C&M Perfumes.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`${cardBg} rounded-2xl p-4 flex flex-col justify-between`}>
          <div className="flex justify-between items-start text-slate-400">
            <span className="text-xs uppercase font-mono tracking-wider">Unidades Libres</span>
            <Package size={16} className="text-amber-400" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-semibold text-amber-300 font-mono">{availableStock}</span>
            <span className="text-xs text-slate-500 block mt-0.5">Físico: {totalPhysicalStock} | Res: {totalReservedStock}</span>
          </div>
        </div>

        <div className={`${cardBg} rounded-2xl p-4 flex flex-col justify-between`}>
          <div className="flex justify-between items-start text-slate-400">
            <span className="text-xs uppercase font-mono tracking-wider">Caja Actual</span>
            <Wallet size={16} className="text-emerald-400" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-semibold text-emerald-400 font-mono">$0</span>
            <span className="text-xs text-slate-500 block mt-0.5">Ingresos vs Egresos</span>
          </div>
        </div>

        <div className={`${cardBg} rounded-2xl p-4 flex flex-col justify-between`}>
          <div className="flex justify-between items-start text-slate-400">
            <span className="text-xs uppercase font-mono tracking-wider">Valor Stock (Costo)</span>
            <DollarSign size={16} className="text-sky-400" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-semibold text-slate-200 font-mono">${stockCostValue.toLocaleString()}</span>
            <span className="text-xs text-slate-500 block mt-0.5">Capital en inventario</span>
          </div>
        </div>

        <div className={`${cardBg} rounded-2xl p-4 flex flex-col justify-between`}>
          <div className="flex justify-between items-start text-slate-400">
            <span className="text-xs uppercase font-mono tracking-wider">Deuda Pendiente</span>
            <TrendingUp size={16} className="text-rose-400" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-semibold text-rose-400 font-mono">$175.000</span>
            <span className="text-xs text-slate-500 block mt-0.5">Préstamo Inicial</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function OrdersView({ orders, setOrders, products, setProducts, supabase, notify, theme }: any) {
  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-slate-800/80">
        <h1 className="font-serif text-2xl font-normal text-amber-200">Pedidos y Reservas</h1>
        <p className="text-xs text-slate-400 mt-0.5">Gestión de seña y compromiso de entrega para clientes.</p>
      </div>
      <div className="p-8 border border-dashed border-slate-800 rounded-2xl text-center text-xs text-slate-500">
        Módulo de pedidos e integración directa con reservas activas.
      </div>
    </div>
  );
}

function SalesView({ sales, setSales, products, supabase, notify, theme }: any) {
  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-slate-800/80">
        <h1 className="font-serif text-2xl font-normal text-amber-200">Ventas Realizadas</h1>
        <p className="text-xs text-slate-400 mt-0.5">Historial de facturación directa.</p>
      </div>
      <div className="p-8 border border-dashed border-slate-800 rounded-2xl text-center text-xs text-slate-500">
        Asignación automática de cobros a reposición y fondo de deuda.
      </div>
    </div>
  );
}

function CashView({ cashMovements, setCashMovements, supabase, notify, theme }: any) {
  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-slate-800/80">
        <h1 className="font-serif text-2xl font-normal text-amber-200">Caja Chica y Movimientos</h1>
        <p className="text-xs text-slate-400 mt-0.5">Registro directo de flujo monetario.</p>
      </div>
    </div>
  );
}

function InvestmentView({ debts, config, theme }: any) {
  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-slate-800/80">
        <h1 className="font-serif text-2xl font-normal text-amber-200">Inversión y Deudas</h1>
        <p className="text-xs text-slate-400 mt-0.5">Regla de división de cobranzas ({config.restockPct}% / {config.debtPct}%).</p>
      </div>
    </div>
  );
}

function SuppliesView({ supplies, setSupplies, supabase, notify, theme }: any) {
  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-slate-800/80">
        <h1 className="font-serif text-2xl font-normal text-amber-200">Insumos y Packaging</h1>
        <p className="text-xs text-slate-400 mt-0.5">Control de bolsas kraft, moños y cinta satinada.</p>
      </div>
    </div>
  );
}

function CalculatorView({ config, theme }: any) {
  const [costo, setCosto] = useState<number | ''>(25000);
  const [precioVenta, setPrecioVenta] = useState<number | ''>(55000);

  const numCosto = Number(costo) || 0;
  const numPrecio = Number(precioVenta) || 0;
  const gananciaBruta = numPrecio - numCosto;
  const margenPorcentaje = numPrecio > 0 ? ((gananciaBruta / numPrecio) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-slate-800/80">
        <h1 className="font-serif text-2xl font-normal text-amber-200">Calculadora Comercial de Margen</h1>
        <p className="text-xs text-slate-400 mt-0.5">Simulador de rendimiento por frasco de perfume.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-5 border border-slate-800 rounded-2xl space-y-3 text-xs">
          <div>
            <label className="text-slate-400 block mb-1">Costo Adquisición ($)</label>
            <input type="number" value={costo} onChange={e => setCosto(Number(e.target.value))} className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl font-mono text-slate-200" />
          </div>
          <div>
            <label className="text-slate-400 block mb-1">Precio Venta ($)</label>
            <input type="number" value={precioVenta} onChange={e => setPrecioVenta(Number(e.target.value))} className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl font-mono text-slate-200" />
          </div>
        </div>
        <div className="p-5 border border-slate-800 rounded-2xl space-y-2 text-xs font-mono">
          <div className="text-emerald-400 font-bold">Ganancia Bruta: ${gananciaBruta.toLocaleString()}</div>
          <div className="text-amber-300">Margen real s/Venta: {margenPorcentaje}%</div>
        </div>
      </div>
    </div>
  );
}

function ReportsView({ products, sales, theme }: any) {
  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-slate-800/80">
        <h1 className="font-serif text-2xl font-normal text-amber-200">Reportes de Negocio</h1>
        <p className="text-xs text-slate-400 mt-0.5">Resumen de datos consolidados.</p>
      </div>
    </div>
  );
}

function ConfigView({ config, setConfig, notify, theme }: any) {
  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-slate-800/80">
        <h1 className="font-serif text-2xl font-normal text-amber-200">Ajustes C&M Perfumes</h1>
        <p className="text-xs text-slate-400 mt-0.5">Configuración de marca y reglas comerciales.</p>
      </div>
    </div>
  );
}