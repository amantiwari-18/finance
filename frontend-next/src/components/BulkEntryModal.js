'use client';
import { useState } from 'react';
import Modal from './Modal';
import { useApp } from '@/context/AppContext';
import { transactionsAPI } from '@/lib/api';
import Icon from './Icon';
import { toast } from 'react-hot-toast';

export default function BulkEntryModal({ open, onClose }) {
    const { categories, subcategories, refreshAll } = useApp();
    const [rows, setRows] = useState([
        { id: Date.now(), category_id: '', subcategory_id: '', amount: '', date: new Date().toISOString().slice(0, 16), description: '' }
    ]);
    const [busy, setBusy] = useState(false);

    const addRow = () => {
        setRows([...rows, { id: Date.now(), category_id: '', subcategory_id: '', amount: '', date: new Date().toISOString().slice(0, 16), description: '' }]);
    };

    const removeRow = (id) => {
        if (rows.length === 1) return;
        setRows(rows.filter(r => r.id !== id));
    };

    const updateRow = (id, field, value) => {
        setRows(rows.map(r => r.id === id ? { ...r, [field]: value, ...(field === 'category_id' ? { subcategory_id: '' } : {}) } : r));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setBusy(true);
        const tId = toast.loading(`Committing ${rows.length} registry records...`);
        try {
            const transactions = rows.map(r => ({
                category_id: parseInt(r.category_id),
                subcategory_id: parseInt(r.subcategory_id),
                amount: parseFloat(r.amount),
                date: new Date(r.date).toISOString(),
                description: r.description || null
            }));

            await transactionsAPI.createBulk(transactions);
            await refreshAll();
            setRows([{ id: Date.now(), category_id: '', subcategory_id: '', amount: '', date: new Date().toISOString().slice(0, 16), description: '' }]);
            toast.success(`${rows.length} records synchronized.`, { id: tId });
            onClose();
        } catch (err) {
            toast.error(err.message || 'Bulk commit failed.', { id: tId });
        } finally {
            setBusy(false);
        }
    };

    return (
        <Modal open={open} onClose={onClose} title="Bulk Transaction Entry" wide>
            <form onSubmit={handleSubmit} className="luxury-form">
                <div className="table-wrap" style={{ marginBottom: 20, overflowX: 'auto' }}>
                    <table className="ledger-table" style={{ border: '1px solid var(--border-color)', borderRadius: '12px' }}>
                        <thead>
                            <tr>
                                <th>Category</th>
                                <th>Subcategory</th>
                                <th>Amount</th>
                                <th>Date</th>
                                <th>Description</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row) => (
                                <tr key={row.id}>
                                    <td style={{ padding: '12px 16px' }}>
                                        <select
                                            className="form-select"
                                            required
                                            value={row.category_id}
                                            onChange={(e) => updateRow(row.id, 'category_id', e.target.value)}
                                        >
                                            <option value="">Select</option>
                                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </td>
                                    <td style={{ padding: '12px 16px' }}>
                                        <select
                                            className="form-select"
                                            required
                                            value={row.subcategory_id}
                                            onChange={(e) => updateRow(row.id, 'subcategory_id', e.target.value)}
                                        >
                                            <option value="">Select</option>
                                            {subcategories.filter(s => s.category_id === parseInt(row.category_id)).map(s => (
                                                <option key={s.id} value={s.id}>{s.name}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td style={{ padding: '12px 16px' }}>
                                        <input
                                            type="number"
                                            step="0.01"
                                            className="form-input"
                                            style={{ width: 100 }}
                                            required
                                            value={row.amount}
                                            onChange={(e) => updateRow(row.id, 'amount', e.target.value)}
                                        />
                                    </td>
                                    <td style={{ padding: '12px 16px' }}>
                                        <input
                                            type="datetime-local"
                                            className="form-input"
                                            required
                                            value={row.date}
                                            onChange={(e) => updateRow(row.id, 'date', e.target.value)}
                                        />
                                    </td>
                                    <td style={{ padding: '12px 16px' }}>
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="Optional"
                                            value={row.description}
                                            onChange={(e) => updateRow(row.id, 'description', e.target.value)}
                                        />
                                    </td>
                                    <td style={{ padding: '12px 16px' }}>
                                        <button type="button" className="modal-close" style={{ width: 32, height: 32 }} onClick={() => removeRow(row.id)}>
                                            <Icon name="x" size={14} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
                    <button type="button" className="btn-secondary-luxe" onClick={addRow}>
                        <Icon name="plus" size={18} /> <span>Add Row</span>
                    </button>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button type="button" className="btn-secondary-luxe" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn-primary-luxe" disabled={busy}>
                            {busy ? 'Processing...' : `Save ${rows.length} Entries`}
                        </button>
                    </div>
                </div>
            </form>
        </Modal>
    );
}
