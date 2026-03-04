'use client';
import { useState, useEffect } from 'react';
import Modal from './Modal';
import { useApp } from '@/context/AppContext';
import { budgetsAPI } from '@/lib/api';
import Icon from './Icon';
import { formatCurrency } from '@/lib/format';
import { toast } from 'react-hot-toast';

export default function ManageBudgetsModal({ open, onClose }) {
    const { categories, subcategories, refreshAll } = useApp();
    const [budgets, setBudgets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [newBudget, setNewBudget] = useState({ category_id: '', amount: '', period: 'monthly' });

    useEffect(() => {
        if (open) {
            loadBudgets();
        }
    }, [open]);

    const loadBudgets = async () => {
        try {
            const data = await budgetsAPI.getAll();
            setBudgets(data);
        } catch (err) {
            console.error('Failed to load budgets', err);
        }
    };

    const handleAddBudget = async (e) => {
        e.preventDefault();
        setLoading(true);
        const tId = toast.loading('Engineering capital limit strategy...');
        try {
            await budgetsAPI.create({
                ...newBudget,
                category_id: parseInt(newBudget.category_id),
                amount: parseFloat(newBudget.amount)
            });
            setNewBudget({ category_id: '', amount: '', period: 'monthly' });
            await loadBudgets();
            await refreshAll();
            toast.success('Strategy successfully engineered.', { id: tId });
        } catch (err) {
            toast.error(err.message || 'Strategy engineering failed.', { id: tId });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Exterminate this budget strategy?')) return;
        const tId = toast.loading('Exterminating strategy...');
        try {
            await budgetsAPI.delete(id);
            await loadBudgets();
            await refreshAll();
            toast.success('Strategy exterminated.', { id: tId });
        } catch (err) {
            toast.error(err.message || 'Extermination failed.', { id: tId });
        }
    };

    const getCategory = (id) => categories.find(c => c.id === id);

    return (
        <Modal open={open} onClose={onClose} title="Strategic Allocation" wide>
            <div className="form-row luxury-form" style={{ alignItems: 'start', gridTemplateColumns: 'minmax(300px, 1fr) 1.5fr' }}>
                <div className="premium-card" style={{ padding: '24px', background: 'rgba(255,255,255,0.02)' }}>
                    <h4 style={{ marginBottom: 16, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>New Allocation Limit</h4>
                    <form onSubmit={handleAddBudget}>
                        <div className="form-group">
                            <label className="form-label">Portfolio Group</label>
                            <select
                                className="form-select"
                                required
                                value={newBudget.category_id}
                                onChange={(e) => setNewBudget({ ...newBudget, category_id: e.target.value })}
                            >
                                <option value="">Select Portfolio</option>
                                {categories.filter(c => c.type === 'expense').map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-row" style={{ gap: '12px', alignItems: 'end', gridTemplateColumns: '1fr 130px' }}>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Quantum Limit</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    placeholder="0.00"
                                    required
                                    value={newBudget.amount}
                                    onChange={(e) => setNewBudget({ ...newBudget, amount: e.target.value })}
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Period</label>
                                <select
                                    className="form-select"
                                    value={newBudget.period}
                                    onChange={(e) => setNewBudget({ ...newBudget, period: e.target.value })}
                                >
                                    <option value="monthly">Monthly</option>
                                    <option value="weekly">Weekly</option>
                                    <option value="yearly">Yearly</option>
                                </select>
                            </div>
                        </div>
                        <button type="submit" className="btn-primary-luxe" style={{ width: '100%' }} disabled={loading}>
                            {loading ? 'Committing...' : 'Engineer Strategy'}
                        </button>
                    </form>
                </div>

                <div className="premium-card" style={{ padding: '24px', background: 'rgba(255,255,255,0.02)', maxHeight: 500, overflowY: 'auto' }}>
                    <h4 style={{ marginBottom: 20, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Active Strategies</h4>
                    {budgets.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px 0' }}>
                            <Icon name="target" size={32} color="var(--border-platinum)" style={{ marginBottom: 16 }} />
                            <p className="text-muted" style={{ fontSize: '0.8rem' }}>No strategic limits defined.</p>
                        </div>
                    ) : (
                        <div className="gap-stack" style={{ gap: '12px' }}>
                            {budgets.map((b) => {
                                const cat = getCategory(b.category_id);
                                return (
                                    <div key={b.id} style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '16px',
                                        background: 'rgba(255,255,255,0.03)',
                                        borderRadius: '12px',
                                        border: '1px solid var(--border-color)'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <div style={{ width: 32, height: 32, borderRadius: '8px', background: `${cat?.color || '#fff'}22`, display: 'grid', placeItems: 'center', color: cat?.color }}>
                                                <Icon name={cat?.icon || 'target'} size={18} />
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{cat?.name || 'All-Sector'}</div>
                                                <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                                                    {formatCurrency(b.amount)} <span style={{ opacity: 0.5 }}>/</span> {b.period}
                                                </div>
                                            </div>
                                        </div>
                                        <button className="modal-close" style={{ width: 32, height: 32 }} onClick={() => handleDelete(b.id)}>
                                            <Icon name="trash-2" size={14} color="var(--danger)" />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
}
