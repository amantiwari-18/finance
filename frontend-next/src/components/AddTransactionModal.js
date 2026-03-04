'use client';
import { useState, useEffect } from 'react';
import Modal from './Modal';
import { useApp } from '@/context/AppContext';
import { transactionsAPI } from '@/lib/api';
import { toast } from 'react-hot-toast';

export default function AddTransactionModal({ open, onClose, editingTransaction }) {
    const { categories, subcategories, refreshAll } = useApp();
    const [formData, setFormData] = useState({
        category_id: '',
        subcategory_id: '',
        amount: '',
        date: new Date().toISOString().slice(0, 16),
        description: '',
    });
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        if (editingTransaction) {
            setFormData({
                ...editingTransaction,
                date: new Date(editingTransaction.date).toISOString().slice(0, 16),
            });
        } else {
            setFormData({
                category_id: '',
                subcategory_id: '',
                amount: '',
                date: new Date().toISOString().slice(0, 16),
                description: '',
            });
        }
    }, [editingTransaction, open]);

    const filteredSubcategories = subcategories.filter(
        (s) => s.category_id === parseInt(formData.category_id)
    );

    const handleSubmit = async (e) => {
        e.preventDefault();
        setBusy(true);
        const tId = toast.loading(editingTransaction ? 'Updating entry...' : 'Committing registry...');
        try {
            const payload = {
                ...formData,
                category_id: parseInt(formData.category_id),
                subcategory_id: parseInt(formData.subcategory_id),
                amount: parseFloat(formData.amount),
                date: new Date(formData.date).toISOString(),
            };

            if (editingTransaction) {
                await transactionsAPI.update(editingTransaction.id, payload);
                toast.success('Registry entry updated.', { id: tId });
            } else {
                await transactionsAPI.create(payload);
                toast.success('Registry entry committed.', { id: tId });
            }

            await refreshAll();
            onClose();
        } catch (err) {
            toast.error(err.message || 'Transaction failed.', { id: tId });
        } finally {
            setBusy(false);
        }
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
        >
            <form onSubmit={handleSubmit} className="luxury-form">
                <div className="form-row">
                    <div className="form-group">
                        <label className="form-label">Category</label>
                        <select
                            className="form-select"
                            required
                            value={formData.category_id}
                            onChange={(e) => setFormData({ ...formData, category_id: e.target.value, subcategory_id: '' })}
                        >
                            <option value="">Select Category</option>
                            {categories.map((c) => (
                                <option key={c.id} value={c.id}>{c.name} ({c.type})</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Subcategory</label>
                        <select
                            className="form-select"
                            required
                            value={formData.subcategory_id}
                            onChange={(e) => setFormData({ ...formData, subcategory_id: e.target.value })}
                        >
                            <option value="">Select Subcategory</option>
                            {filteredSubcategories.map((s) => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label className="form-label">Amount</label>
                        <input
                            type="number"
                            step="0.01"
                            className="form-input"
                            required
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Date</label>
                        <input
                            type="datetime-local"
                            className="form-input"
                            required
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">Description (Optional)</label>
                    <input
                        type="text"
                        className="form-input"
                        placeholder="Note down capital movement details..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                </div>

                <div className="modal-footer" style={{ padding: '0' }}>
                    <button type="button" className="btn-secondary-luxe" onClick={onClose}>Cancel</button>
                    <button type="submit" className="btn-primary-luxe" disabled={busy}>
                        {busy ? 'Processing...' : (editingTransaction ? 'Update Entry' : 'Commit Registry')}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
