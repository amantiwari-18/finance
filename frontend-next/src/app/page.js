'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppProvider, useApp } from '@/context/AppContext';
import Sidebar from '@/components/Sidebar';
import StatsCards from '@/components/StatsCards';
import Charts from '@/components/Charts';
import TransactionTable from '@/components/TransactionTable';
import AddTransactionModal from '@/components/AddTransactionModal';
import BulkEntryModal from '@/components/BulkEntryModal';
import ManageCategoriesModal from '@/components/ManageCategoriesModal';
import ManageBudgetsModal from '@/components/ManageBudgetsModal';
import ManageLoansModal from '@/components/ManageLoansModal';
import ExportModal from '@/components/ExportModal';
import Modal from '@/components/Modal';
import { toast } from 'react-hot-toast';
import { importAPI, transactionsAPI } from '@/lib/api';
import { formatCurrency } from '@/lib/format';
import Icon from '@/components/Icon';
import AnimatedAmount from '@/components/AnimatedAmount';

function DashboardContent() {
  const router = useRouter();
  const {
    user, loading, refreshAll, transactions, analytics, categories, loans,
    loadTransactions
  } = useApp();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [manageCatOpen, setManageCatOpen] = useState(false);
  const [manageBudgetOpen, setManageBudgetOpen] = useState(false);
  const [manageLoanOpen, setManageLoanOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [busy, setBusy] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  const [filters, setFilters] = useState({
    transaction_type: '',
    category_id: '',
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      refreshAll();
    }
  }, [user, refreshAll]);

  const handleFilterChange = (field, value) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    loadTransactions(newFilters);
  };

  const scrollToSection = (id) => {
    setActiveTab(id);
    const el = document.getElementById(`section-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setSidebarOpen(false);
  };

  const handleImport = async (e) => {
    e.preventDefault();
    const file = e.target.elements.excelFile.files[0];
    if (!file) return;

    setBusy(true);
    const tId = toast.loading('Ingesting registry manifest...');
    try {
      await importAPI.importExcel(file);
      await refreshAll();
      setImportOpen(false);
      toast.success('Registry ingestion successful.', { id: tId });
    } catch (err) {
      toast.error(err.message || 'Ingestion failed.', { id: tId });
    } finally {
      setBusy(false);
    }
  };

  if (loading || !user) {
    return (
      <div style={{ height: '100vh', display: 'grid', placeItems: 'center', background: '#0a0f1d' }}>
        <span className="spinner" style={{ width: 40, height: 40, border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <style jsx>{` @keyframes spin { to { transform: rotate(360deg); } } `}</style>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        userEmail={user.email}
        activeTab={activeTab}
        onNavClick={scrollToSection}
        onLogout={() => {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('userEmail');
          router.push('/login');
        }}
      />

      <main className="main-content">
        <header className="premium-header">
          <div className="header-left">
            <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)}>
              <Icon name="menu" size={24} />
            </button>
            <div className="premium-greeting">
              <span className="greeting-label">Secret Vault</span>
              <h1>Welcome, <span className="highlight-text">{user.email.split('@')[0]}</span></h1>
            </div>
          </div>
          <div className="header-actions">
            <button className="action-btn-primary" onClick={() => { setEditingTransaction(null); setAddModalOpen(true); }}>
              <Icon name="plus" size={18} /> <span>New Record</span>
            </button>
          </div>
        </header>

        <div className="page-section gap-stack">
          {/* Dashboard Section */}
          <section id="section-dashboard" className="gap-stack">
            <StatsCards analytics={analytics} transactions={transactions} loans={loans} />
            <Charts analytics={analytics} categories={categories} />
          </section>

          {/* Transactions Section */}
          <section id="section-transactions" className="gap-stack scroll-mt">
            <div className="section-header-row">
              <div className="title-stack">
                <h2>Asset Movement</h2>
                <div className="filter-pills">
                  <button
                    className={`pill-btn ${filters.transaction_type === '' ? 'pill-active' : ''}`}
                    onClick={() => handleFilterChange('transaction_type', '')}
                  >All</button>
                  <button
                    className={`pill-btn pill-credit ${filters.transaction_type === 'income' ? 'pill-credit-active' : ''}`}
                    onClick={() => handleFilterChange('transaction_type', 'income')}
                  >● Credit</button>
                  <button
                    className={`pill-btn pill-debit ${filters.transaction_type === 'expense' ? 'pill-debit-active' : ''}`}
                    onClick={() => handleFilterChange('transaction_type', 'expense')}
                  >● Debit</button>
                </div>
              </div>
              <div className="btn-group">
                <button className="btn-icon-text" onClick={() => setExportModalOpen(true)}>
                  <Icon name="download" size={16} />
                  Export Registry
                </button>
                <button className="btn-icon-text" onClick={() => setImportOpen(true)}>
                  <Icon name="upload" size={14} /> <span>Import</span>
                </button>
                <button className="btn-primary-luxe" onClick={() => {
                  setEditingTransaction(null);
                  setAddModalOpen(true);
                }}>
                  <Icon name="plus" size={16} /> Asset Flux
                </button>
              </div>
            </div>

            <TransactionTable
              filters={filters}
              onEdit={(t) => { setEditingTransaction(t); setAddModalOpen(true); }}
            />
          </section>

          {/* Categories Section */}
          <section id="section-categories" className="gap-stack scroll-mt">
            <div className="section-header-row">
              <h2>Category Portfolios</h2>
              <button className="btn-icon-text" onClick={() => setManageCatOpen(true)}>
                <Icon name="settings" size={14} /> <span>Configure</span>
              </button>
            </div>
            <div className="category-grid-premium">
              {categories.slice(0, 8).map(cat => (
                <div key={cat.id} className="category-pill-card">
                  <div className="pill-icon" style={{ background: `${cat.color}22`, color: cat.color }}>
                    <Icon name={cat.icon} size={16} />
                  </div>
                  <span className="pill-name">{cat.name}</span>
                  <div className={`pill-badge ${cat.type}`}>{cat.type}</div>
                </div>
              ))}
              {categories.length > 8 && (
                <button className="category-pill-card more" onClick={() => setManageCatOpen(true)}>
                  <span>+{categories.length - 8} More</span>
                </button>
              )}
            </div>
          </section>

          {/* Budgets Section */}
          <section id="section-budgets" className="gap-stack scroll-mt">
            <div className="section-header-row">
              <div className="title-stack">
                <h2>Capital Limits</h2>
                <label>Allocation efficiency tracking</label>
              </div>
              <button className="btn-icon-text" onClick={() => setManageBudgetOpen(true)}>
                <Icon name="target" size={14} /> <span>Manage</span>
              </button>
            </div>
            <div className="premium-card-list">
              {analytics?.category_breakdown?.filter(c => c.budget_amount > 0).map(cat => {
                const percent = Math.min((cat.total_amount / cat.budget_amount) * 100, 100);
                const isOver = cat.total_amount > cat.budget_amount;
                const periodLabel = cat.budget_period || 'monthly';
                return (
                  <div key={cat.category_id} className="limit-card">
                    <div className="limit-row">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span className="limit-name">{cat.category_name}</span>
                        <span style={{
                          fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase',
                          padding: '2px 8px', borderRadius: '100px', letterSpacing: '0.06em',
                          background: 'rgba(99,102,241,0.12)', color: 'var(--accent-sapphire)',
                          border: '1px solid rgba(99,102,241,0.2)'
                        }}>{periodLabel}</span>
                      </div>
                      <span className="limit-vals">
                        <AnimatedAmount value={cat.total_amount} />
                        <span className="limit-sep">/</span>
                        <span className="limit-total">{formatCurrency(cat.budget_amount)}</span>
                      </span>
                    </div>
                    <div className="limit-progress-bg">
                      <div className={`limit-progress-fill ${isOver ? 'danger' : ''}`} style={{ width: `${percent}%` }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: '0.65rem', color: isOver ? 'var(--danger)' : 'var(--text-muted)', fontWeight: 700 }}>
                      <span>{isOver ? '⚠ Over limit' : `${Math.round(percent)}% utilised`}</span>
                      <span style={{ color: 'var(--text-muted)' }}>Remaining: {formatCurrency(Math.max(cat.budget_amount - cat.total_amount, 0))}</span>
                    </div>
                  </div>
                );
              })}
              {analytics?.category_breakdown?.filter(c => c.budget_amount > 0).length === 0 && (
                <div className="empty-asset-box" onClick={() => setManageBudgetOpen(true)}>
                  <Icon name="pie-chart" size={24} color="var(--text-muted)" />
                  <p>No active capital limits. Define allocation targets to optimize performance.</p>
                </div>
              )}
            </div>
          </section>

          {/* Loans Section */}
          <section id="section-loans" className="gap-stack scroll-mt">
            <div className="section-header-row">
              <div className="title-stack">
                <h2>Liabilities</h2>
                <label>Outstanding debt and EMI scheduling</label>
              </div>
              <button className="btn-icon-text" onClick={() => setManageLoanOpen(true)}>
                <Icon name="landmark" size={14} /> <span>Manage Loans</span>
              </button>
            </div>
            <div className="liability-grid">
              {loans.map(loan => (
                <div key={loan.id} className="liability-card">
                  <div className="liability-info">
                    <div className="liability-icon">
                      <Icon name="credit-card" size={18} />
                    </div>
                    <div className="liability-text">
                      <span className="liability-name">{loan.name}</span>
                      <span className="liability-amount"><AnimatedAmount value={loan.remaining_amount} /></span>
                    </div>
                  </div>
                  <div className="liability-mini-progress">
                    <div className="fill" style={{ width: `${(loan.remaining_amount / loan.total_amount) * 100}%` }} />
                  </div>
                </div>
              ))}
              {loans.length === 0 && (
                <div className="empty-asset-box full-width" onClick={() => setManageLoanOpen(true)}>
                  <Icon name="shield" size={24} color="var(--text-muted)" />
                  <p>Debt-free environment detected. No active liabilities found.</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="mobile-bottom-nav">
        <button className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => scrollToSection('dashboard')}>
          <Icon name="layout-dashboard" size={20} />
          <span>Overview</span>
        </button>
        <button className={`nav-item ${activeTab === 'transactions' ? 'active' : ''}`} onClick={() => scrollToSection('transactions')}>
          <Icon name="receipt" size={20} />
          <span>Ledger</span>
        </button>
        <button className="nav-item plus-btn" onClick={() => { setEditingTransaction(null); setAddModalOpen(true); }}>
          <div className="plus-icon-circle">
            <Icon name="plus" size={24} color="#fff" />
          </div>
        </button>
        <button className={`nav-item ${activeTab === 'budgets' ? 'active' : ''}`} onClick={() => scrollToSection('budgets')}>
          <Icon name="target" size={20} />
          <span>Strategy</span>
        </button>
        <button className={`nav-item ${activeTab === 'loans' ? 'active' : ''}`} onClick={() => scrollToSection('loans')}>
          <Icon name="landmark" size={20} />
          <span>Liability</span>
        </button>
      </nav>

      {/* Modals */}
      <AddTransactionModal open={addModalOpen} onClose={() => setAddModalOpen(false)} editingTransaction={editingTransaction} />
      <BulkEntryModal open={bulkModalOpen} onClose={() => setBulkModalOpen(false)} />
      <ManageCategoriesModal open={manageCatOpen} onClose={() => setManageCatOpen(false)} />
      <ManageBudgetsModal open={manageBudgetOpen} onClose={() => setManageBudgetOpen(false)} />
      <ManageLoansModal open={manageLoanOpen} onClose={() => setManageLoanOpen(false)} />
      <ExportModal open={exportModalOpen} onClose={() => setExportModalOpen(false)} />

      <Modal open={importOpen} onClose={() => setImportOpen(false)} title="Registry Ingestion">
        <form onSubmit={handleImport} className="luxury-form">
          <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: 20 }}>Upload capital registry in Excel (.xlsx) format for automated batch processing.</p>
          <div className="form-group">
            <label className="form-label">Data Manifest (.xlsx)</label>
            <input type="file" name="excelFile" accept=".xlsx,.xls" required className="form-input"
              style={{ padding: '40px 20px', borderStyle: 'dashed', textAlign: 'center' }} />
          </div>
          <div className="modal-footer" style={{ padding: '0', marginTop: '20px' }}>
            <button type="button" className="btn-secondary-luxe" onClick={() => setImportOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary-luxe">Initiate Sync</button>
          </div>
        </form>
      </Modal>

      <style jsx>{`
        .premium-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 40px 0;
            margin-bottom: 16px;
        }
        .premium-greeting h1 {
            font-size: 1.75rem;
            font-weight: 800;
            color: var(--text-primary);
            letter-spacing: -0.02em;
        }
        .greeting-label {
            font-size: 0.7rem;
            text-transform: uppercase;
            letter-spacing: 0.2em;
            color: var(--accent-sapphire);
            font-weight: 700;
            margin-bottom: 4px;
            display: block;
        }
        .highlight-text {
            background: var(--accent-gradient);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        .header-actions {
            display: flex;
            gap: 12px;
        }
        .action-btn-primary {
            background: var(--accent-teal);
            border: 1px solid rgba(255,255,255,0.1);
            padding: 10px 20px;
            border-radius: 12px;
            color: white;
            font-weight: 700;
            display: flex;
            align-items: center;
            gap: 10px;
            transition: all 0.3s ease;
            font-size: 0.9rem;
            box-shadow: 0 4px 15px rgba(78, 190, 194, 0.3);
        }
        .action-btn-primary:hover {
            background: #3da8ad;
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(78, 190, 194, 0.4);
        }
        .action-btn-secondary {
            width: 42px;
            height: 42px;
            border-radius: 12px;
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            color: var(--text-secondary);
            display: grid;
            place-items: center;
            transition: all 0.3s ease;
        }
        .action-btn-secondary:hover {
            color: var(--text-primary);
            border-color: var(--text-secondary);
        }
        .mobile-menu-btn {
            display: none;
            background: none;
            border: none;
            color: var(--text-primary);
            margin-right: 16px;
        }

        .section-header-row {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            margin-bottom: 8px;
        }
        .title-stack h2 {
            font-size: 1.25rem;
            font-weight: 800;
            letter-spacing: -0.01em;
        }
        .title-stack label {
            font-size: 0.8rem;
            color: var(--text-muted);
        }
        .filter-pills {
            display: flex;
            align-items: center;
            gap: 6px;
            margin-top: 8px;
        }
        .pill-btn {
            padding: 5px 14px;
            border-radius: 100px;
            font-size: 0.7rem;
            font-weight: 800;
            letter-spacing: 0.04em;
            cursor: pointer;
            transition: all 0.2s ease;
            border: 1px solid var(--border-color);
            background: rgba(255,255,255,0.03);
            color: var(--text-muted);
        }
        .pill-btn:hover { color: var(--text-primary); border-color: var(--border-platinum); }
        .pill-active { color: var(--text-primary) !important; background: rgba(255,255,255,0.07) !important; border-color: var(--border-platinum) !important; }
        .pill-credit { color: var(--success); border-color: rgba(52,211,153,0.2); }
        .pill-credit:hover { background: rgba(52,211,153,0.08); }
        .pill-credit-active { background: rgba(52,211,153,0.12) !important; border-color: var(--success) !important; color: var(--success) !important; }
        .pill-debit { color: var(--danger); border-color: rgba(248,113,113,0.2); }
        .pill-debit:hover { background: rgba(248,113,113,0.08); }
        .pill-debit-active { background: rgba(248,113,113,0.12) !important; border-color: var(--danger) !important; color: var(--danger) !important; }
        .btn-icon-text {
            background: none;
            border: none;
            color: var(--accent-sapphire);
            font-weight: 700;
            font-size: 0.85rem;
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 8px 0;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        .btn-icon-text.secondary {
            color: var(--text-secondary);
        }
        .btn-icon-text:hover {
            color: var(--text-primary);
        }
        .btn-group {
            display: flex;
            align-items: center;
            gap: 20px;
        }

        .category-grid-premium {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
            gap: 16px;
        }
        .category-pill-card {
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: 14px;
            padding: 12px;
            display: flex;
            flex-direction: column;
            gap: 8px;
            transition: all 0.3s ease;
        }
        .category-pill-card:hover {
            border-color: var(--border-platinum);
            transform: translateY(-2px);
        }
        .pill-icon {
            width: 28px;
            height: 28px;
            border-radius: 8px;
            display: grid;
            place-items: center;
        }
        .pill-name { font-size: 0.85rem; font-weight: 700; }
        .pill-badge {
            font-size: 0.65rem;
            padding: 2px 8px;
            border-radius: 4px;
            text-transform: uppercase;
            width: fit-content;
            font-weight: 800;
        }
        .pill-badge.income { background: rgba(52, 211, 153, 0.1); color: var(--success); }
        .pill-badge.expense { background: rgba(248, 113, 113, 0.1); color: var(--danger); }

        .premium-card-list {
            display: flex;
            flex-direction: column;
            gap: 12px;
        }
        .limit-card {
            background: var(--bg-card);
            padding: 16px 20px;
            border-radius: 16px;
            border: 1px solid var(--border-color);
        }
        .limit-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 16px;
        }
        .limit-name { font-weight: 700; font-size: 0.95rem; }
        .limit-vals { font-family: var(--font-mono); font-size: 0.9rem; }
        .limit-sep { margin: 0 4px; opacity: 0.3; }
        .limit-total { color: var(--text-muted); }
        .limit-progress-bg {
            height: 6px;
            background: rgba(255,255,255,0.03);
            border-radius: 3px;
            overflow: hidden;
        }
        .limit-progress-fill {
            height: 100%;
            background: var(--accent-sapphire);
            border-radius: 3px;
            transition: width 1s var(--transition-base);
        }
        .limit-progress-fill.danger { background: var(--danger); }

        .liability-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 16px;
        }
        .liability-card {
            background: var(--bg-card);
            padding: 16px;
            border-radius: 16px;
            border: 1px solid var(--border-color);
        }
        .liability-info {
            display: flex;
            gap: 12px;
            align-items: center;
            margin-bottom: 16px;
        }
        .dashboard-header {
            position: sticky;
            top: 0;
            z-index: 1000;
            padding: 24px 0;
            background: rgba(10, 10, 11, 0.85); /* Obsidian Base */
            backdrop-filter: blur(12px);
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid var(--border-color);
            margin-bottom: 10px;
        }
        .header-left {
            display: flex;
            align-items: center;
            gap: 12px;
        }
        .liability-icon {
            width: 38px;
            height: 38px;
            background: rgba(255,255,255,0.03);
            border-radius: 10px;
            display: grid;
            place-items: center;
            color: var(--accent-sapphire);
        }
        .liability-text { display: flex; flex-direction: column; }
        .liability-name { font-size: 0.8rem; color: var(--text-secondary); font-weight: 600; }
        .liability-amount { font-size: 1.1rem; font-weight: 800; }
        .liability-mini-progress {
            height: 3px;
            background: rgba(255,255,255,0.03);
            border-radius: 2px;
        }
        .liability-mini-progress .fill {
            height: 100%;
            background: var(--accent-sapphire);
            border-radius: 2px;
        }

        .empty-asset-box {
            background: rgba(255,255,255,0.01);
            border: 1px dashed var(--border-color);
            border-radius: 20px;
            padding: 40px;
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            gap: 16px;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        .empty-asset-box:hover { background: rgba(255,255,255,0.02); border-color: var(--text-muted); }
        .empty-asset-box p { font-size: 0.85rem; color: var(--text-muted); max-width: 250px; }
        .full-width { grid-column: 1 / -1; }

        .mobile-bottom-nav {
            display: none;
            position: fixed;
            bottom: 20px;
            left: 20px;
            right: 20px;
            height: 64px;
            background: rgba(18, 18, 20, 0.92);
            backdrop-filter: blur(20px);
            border: 1px solid var(--border-color);
            border-radius: 24px;
            padding: 0 10px;
            justify-content: space-around;
            align-items: center;
            z-index: 1001;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.6);
        }
        .nav-item {
            background: none;
            border: none;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 4px;
            color: var(--text-muted);
            transition: all 0.3s ease;
            flex: 1;
            padding: 8px 0;
            cursor: pointer;
        }
        .nav-item span { font-size: 0.6rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
        .nav-item.active { color: var(--accent-teal); }
        .plus-btn { 
            position: relative; 
            top: -24px; 
            z-index: 1002;
            pointer-events: auto !important;
        }
        .plus-icon-circle {
            width: 56px;
            height: 56px;
            border-radius: 50%;
            background: var(--accent-teal);
            display: grid;
            place-items: center;
            box-shadow: 0 8px 30px rgba(0, 209, 255, 0.4);
            border: 4px solid var(--bg-primary);
            transition: transform 0.2s ease;
        }
        .plus-btn:active .plus-icon-circle { transform: scale(0.9); }

        .scroll-mt { scroll-margin-top: 40px; }

        @media (max-width: 1024px) {
            .mobile-menu-btn { display: block; }
            .mobile-bottom-nav { display: flex; }
            .header-actions span { display: none; }
            .action-btn-primary { padding: 12px; width: 44px; height: 44px; justify-content: center; }
            .premium-header { padding: 24px 0; }
        }
        @media (max-width: 640px) {
            .premium-greeting h1 { font-size: 1.5rem; }
            .category-grid-premium { grid-template-columns: repeat(2, 1fr); }
            .liability-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AppProvider>
      <DashboardContent />
    </AppProvider>
  );
}
