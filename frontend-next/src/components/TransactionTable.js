'use client';
import { useApp } from '@/context/AppContext';
import { transactionsAPI } from '@/lib/api';
import Icon from './Icon';
import { formatCurrency } from '@/lib/format';
import { toast } from 'react-hot-toast';

export default function TransactionTable({ filters, onEdit }) {
    const { transactions, categories, subcategories, loadTransactions, loadAnalytics } = useApp();

    const handleDelete = async (e, id) => {
        e.stopPropagation(); // prevent row click (edit) from firing
        if (!confirm('Exterminate this ledger record?')) return;
        const tId = toast.loading('Exterminating record...');
        try {
            await transactionsAPI.delete(id);
            await loadTransactions(filters);
            await loadAnalytics();
            toast.success('Record exterminated.', { id: tId });
        } catch (err) {
            toast.error(err.message || 'Extermination failed.', { id: tId });
        }
    };

    const getCategory = (id) => categories.find(c => c.id === id);
    const getSubcategory = (id) => subcategories.find(s => s.id === id);

    return (
        <div className="exclusive-ledger-container">
            <div className="ledger-header-luxury">
                <div className="ledger-brand-accent">
                    <Icon name="activity" size={20} color="var(--accent-teal)" />
                    <div className="ledger-title-stack">
                        <h3>Sovereign Ledger</h3>
                        <p>Institutional audit status: Verified</p>
                    </div>
                </div>
                <div className="ledger-status-tag">
                    <div className="status-dot-pulse" />
                    <span>{transactions.length} Active Records</span>
                </div>
            </div>

            <div className="ledger-scroll-area">
                <table className="midnight-table">
                    <thead>
                        <tr>
                            <th>Chronology</th>
                            <th>Portfolio Asset</th>
                            <th className="hide-mobile">Specification</th>
                            <th className="text-right">Quantum</th>
                            <th className="text-right" style={{ width: 80 }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.length === 0 ? (
                            <tr>
                                <td colSpan="5">
                                    <div className="empty-vault-state">
                                        <div className="empty-icon-circle">
                                            <Icon name="database" size={32} color="var(--text-muted)" />
                                        </div>
                                        <p>Archive currently localized to zero.</p>
                                        <span className="empty-sub">Initiate a NEW RECORD to populate.</span>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            transactions.map((t) => {
                                const cat = getCategory(t.category_id);
                                const sub = getSubcategory(t.subcategory_id);
                                const isIncome = cat?.type === 'income';

                                return (
                                    <tr key={t.id} className="midnight-row" onClick={() => onEdit(t)}>
                                        <td className="cell-date">
                                            <div className="date-main">
                                                {new Date(t.date).toLocaleDateString('en-US', { day: '2-digit', month: 'short' })}
                                            </div>
                                            <div className="date-year">{new Date(t.date).getFullYear()}</div>
                                        </td>
                                        <td>
                                            <div className="portfolio-asset-cell">
                                                <div className="asset-indicator" style={{ background: cat?.color || 'var(--accent-teal)' }} />
                                                <div className="asset-meta">
                                                    <div className="asset-name">{cat?.name}</div>
                                                    <div className="sub-asset-name">{sub?.name || 'Base Asset'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="cell-desc hide-mobile">
                                            {t.description || 'Verified Transaction Entry'}
                                        </td>
                                        <td className="cell-value text-right">
                                            <span className={isIncome ? 'val-positive' : 'val-negative'}>
                                                {isIncome ? '+' : '-'}{formatCurrency(t.amount)}
                                            </span>
                                        </td>
                                        <td className="text-right" onClick={(e) => e.stopPropagation()}>
                                            <button
                                                className="delete-row-btn"
                                                onClick={(e) => handleDelete(e, t.id)}
                                                title="Delete transaction"
                                            >
                                                <Icon name="trash-2" size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            <style jsx>{`
                .exclusive-ledger-container {
                    background: var(--bg-card);
                    border: 1px solid var(--border-platinum);
                    border-radius: 28px;
                    overflow: hidden;
                    box-shadow: 0 20px 50px rgba(0,0,0,0.3);
                }
                .ledger-header-luxury {
                    padding: 24px 32px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 1px solid var(--border-color);
                    background: rgba(255,255,255,0.01);
                }
                .ledger-brand-accent { display: flex; align-items: center; gap: 16px; }
                .ledger-title-stack h3 {
                    font-size: 0.9rem;
                    font-weight: 800;
                    letter-spacing: 0.1em;
                    text-transform: uppercase;
                    color: var(--text-primary);
                    margin: 0;
                }
                .ledger-title-stack p {
                    font-size: 0.7rem;
                    color: var(--text-muted);
                    font-weight: 600;
                    margin: 2px 0 0 0;
                }
                .ledger-status-tag {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    background: rgba(0, 209, 255, 0.05);
                    padding: 8px 16px;
                    border-radius: 100px;
                    border: 1px solid rgba(0, 209, 255, 0.1);
                    font-size: 0.7rem;
                    font-weight: 800;
                    color: var(--accent-teal);
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }
                .status-dot-pulse {
                    width: 6px;
                    height: 6px;
                    background: var(--accent-teal);
                    border-radius: 50%;
                    box-shadow: 0 0 10px var(--accent-teal);
                    animation: pulse-teal 2s infinite;
                }
                @keyframes pulse-teal {
                    0% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.5); opacity: 0.4; }
                    100% { transform: scale(1); opacity: 1; }
                }

                .ledger-scroll-area { overflow-x: auto; }
                .midnight-table { width: 100%; border-collapse: collapse; }
                .midnight-table th {
                    padding: 18px 25px;
                    text-align: left;
                    font-size: 0.65rem;
                    text-transform: uppercase;
                    letter-spacing: 0.15em;
                    color: var(--text-muted);
                    font-weight: 800;
                    border-bottom: 2px solid var(--border-color);
                    background: rgba(0,0,0,0.2);
                }
                .midnight-table th:nth-child(1) { width: 120px; }
                .midnight-table th:nth-child(2) { width: 220px; }
                .midnight-table th:nth-child(4) { width: 150px; }
                .midnight-table th:last-child { width: 60px; }

                .midnight-row {
                    border-bottom: 1px solid var(--border-color);
                    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
                    cursor: pointer;
                }
                .midnight-row:hover {
                    background: rgba(99, 102, 241, 0.04);
                }
                .midnight-row:hover .delete-row-btn {
                    opacity: 1;
                    transform: translateX(0);
                }
                .midnight-row td { padding: 20px 25px; vertical-align: middle; }

                .delete-row-btn {
                    opacity: 0;
                    transform: translateX(10px);
                    background: none;
                    border: none;
                    width: 38px;
                    height: 38px;
                    display: inline-grid;
                    place-items: center;
                    cursor: pointer;
                    color: var(--text-muted);
                    transition: all 0.3s ease;
                }
                .delete-row-btn:hover {
                    color: var(--danger);
                    background: rgba(239, 68, 68, 0.1);
                    border-radius: 50%;
                }
                
                .cell-date { min-width: 90px; }
                .date-main { font-size: 0.85rem; font-weight: 800; color: var(--text-primary); }
                .date-year { font-size: 0.65rem; color: var(--text-muted); font-weight: 600; }

                .portfolio-asset-cell { display: flex; align-items: center; gap: 16px; }
                .asset-indicator { width: 4px; height: 24px; border-radius: 4px; flex-shrink: 0; }
                .asset-name { font-size: 0.9rem; font-weight: 700; color: var(--text-primary); }
                .sub-asset-name { font-size: 0.7rem; color: var(--text-muted); font-weight: 600; }

                .cell-desc { font-size: 0.85rem; color: var(--text-secondary); font-weight: 500; }
                .cell-value { font-family: var(--font-mono); font-size: 0.95rem; font-weight: 800; }
                .val-positive { color: var(--success); }
                .val-negative { color: var(--danger); }
                
                .text-right { text-align: right; }
                .hide-mobile { display: table-cell; }

                .empty-vault-state {
                    padding: 80px 0;
                    text-align: center;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }
                .empty-icon-circle {
                    width: 80px;
                    height: 80px;
                    background: rgba(255,255,255,0.02);
                    border-radius: 50%;
                    display: grid;
                    place-items: center;
                    margin-bottom: 24px;
                    border: 1px solid var(--border-platinum);
                }
                .empty-vault-state p {
                    font-size: 1rem;
                    font-weight: 700;
                    color: var(--text-primary);
                    margin: 0;
                }
                .empty-sub {
                    font-size: 0.8rem;
                    color: var(--text-muted);
                    margin-top: 8px;
                }

                @media (max-width: 768px) {
                    .hide-mobile { display: none; }
                    .midnight-row td { padding: 14px 16px; }
                    .midnight-table th { padding: 12px 16px; }
                    .ledger-header-luxury { padding: 20px; }
                    .delete-row-btn { opacity: 1; }
                }
            `}</style>
        </div>
    );
}
