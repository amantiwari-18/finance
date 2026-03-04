'use client';
import { useState, useEffect } from 'react';
import Modal from './Modal';
import { useApp } from '@/context/AppContext';
import { loansAPI } from '@/lib/api';
import Icon from './Icon';
import { formatCurrency } from '@/lib/format';
import { toast } from 'react-hot-toast';

export default function ManageLoansModal({ open, onClose }) {
    const { loans, refreshAll } = useApp();
    const [loading, setLoading] = useState(false);
    const [newLoan, setNewLoan] = useState({ name: '', total_amount: '', interest_rate: '0' });

    const handleAddLoan = async (e) => {
        e.preventDefault();
        setLoading(true);
        const tId = toast.loading('Registering new debt instrument...');
        try {
            await loansAPI.create({
                ...newLoan,
                total_amount: parseFloat(newLoan.total_amount),
                interest_rate: parseFloat(newLoan.interest_rate)
            });
            setNewLoan({ name: '', total_amount: '', interest_rate: '0' });
            await refreshAll();
            toast.success('Liability registered in vault.', { id: tId });
        } catch (err) {
            toast.error(err.message || 'Liability registration failed.', { id: tId });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Liquidity check: Are you sure you want to retire this liability tracking?')) return;
        const tId = toast.loading('Retiring liability tracking...');
        try {
            await loansAPI.delete(id);
            await refreshAll();
            toast.success('Liability retired.', { id: tId });
        } catch (err) {
            toast.error(err.message || 'Retirement failed.', { id: tId });
        }
    };

    return (
        <Modal open={open} onClose={onClose} title="Liability Registry" wide>
            <div className="form-row luxury-form" style={{ alignItems: 'start', gridTemplateColumns: 'minmax(300px, 1fr) 1.5fr' }}>
                <div className="premium-card" style={{ padding: '24px', background: 'rgba(255,255,255,0.02)' }}>
                    <h4 style={{ marginBottom: 12, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>New Debt Instrument</h4>
                    <p className="text-muted" style={{ fontSize: '0.75rem', marginBottom: 20, lineHeight: 1.4 }}>
                        Registering a liability creates a dedicated segment in <span style={{ color: 'var(--accent-sapphire)' }}>Loans & EMI</span>.
                        Sequential repayments will amortize the principal automatically.
                    </p>
                    <form onSubmit={handleAddLoan}>
                        <div className="form-group">
                            <label className="form-label">Counterparty / Institution</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="e.g. Sapphire Capital Partners"
                                required
                                value={newLoan.name}
                                onChange={(e) => setNewLoan({ ...newLoan, name: e.target.value })}
                            />
                        </div>
                        <div className="form-row" style={{ gap: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', marginBottom: 20 }}>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Principal Value</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    placeholder="0.00"
                                    required
                                    value={newLoan.total_amount}
                                    onChange={(e) => setNewLoan({ ...newLoan, total_amount: e.target.value })}
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Yield Rate (%)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    className="form-input"
                                    value={newLoan.interest_rate}
                                    onChange={(e) => setNewLoan({ ...newLoan, interest_rate: e.target.value })}
                                />
                            </div>
                        </div>
                        <button type="submit" className="btn-primary-luxe" style={{ width: '100%' }} disabled={loading}>
                            {loading ? 'Processing...' : 'Register Liability'}
                        </button>
                    </form>
                </div>

                <div className="premium-card" style={{ padding: '24px', background: 'rgba(255,255,255,0.02)', maxHeight: 500, overflowY: 'auto' }}>
                    <h4 style={{ marginBottom: 20, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Amortization Schedule</h4>
                    {loans.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px 0' }}>
                            <Icon name="landmark" size={32} color="var(--border-platinum)" style={{ marginBottom: 16 }} />
                            <p className="text-muted" style={{ fontSize: '0.8rem' }}>No active liabilities on book.</p>
                        </div>
                    ) : (
                        <div className="gap-stack" style={{ gap: '16px' }}>
                            {loans.map((l) => (
                                <div key={l.id} style={{
                                    padding: '20px',
                                    background: 'rgba(255,255,255,0.03)',
                                    borderRadius: '16px',
                                    border: '1px solid var(--border-color)'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                        <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>{l.name}</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--accent-sapphire)', background: 'rgba(99,102,241,0.1)', padding: '3px 10px', borderRadius: '100px', whiteSpace: 'nowrap' }}>
                                                {l.interest_rate}% p.a.
                                            </span>
                                            <button className="modal-close" style={{ width: 32, height: 32 }} onClick={() => handleDelete(l.id)}>
                                                <Icon name="trash-2" size={14} color="var(--danger)" />
                                            </button>
                                        </div>
                                    </div>

                                    <div style={{ marginBottom: 8 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: 8, fontWeight: 700 }}>
                                            <span style={{ color: 'var(--text-secondary)' }}>Outstanding Capital</span>
                                            <span style={{ color: 'var(--text-primary)' }}>{formatCurrency(l.remaining_amount)}</span>
                                        </div>
                                        <div style={{ height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 10, overflow: 'hidden' }}>
                                            <div
                                                style={{ height: '100%', width: `${(l.remaining_amount / l.total_amount) * 100}%`, background: 'var(--accent-sapphire)', boxShadow: '0 0 10px rgba(99, 102, 241, 0.4)', transition: 'width 1s ease' }}
                                            />
                                        </div>
                                        <div style={{ textAlign: 'right', fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 6, fontWeight: 600 }}>
                                            Nominal Principal: {formatCurrency(l.total_amount)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
}
