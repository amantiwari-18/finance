'use client';
import { useState, useEffect } from 'react';
import Modal from './Modal';
import { useApp } from '@/context/AppContext';
import { categoriesAPI, subcategoriesAPI } from '@/lib/api';
import Icon from './Icon';
import { toast } from 'react-hot-toast';

export default function ManageCategoriesModal({ open, onClose }) {
    const { categories, subcategories, loadCategories } = useApp();
    const [newCat, setNewCat] = useState({ name: '', type: 'expense', icon: 'shopping-bag', color: '#6366f1' });
    const [newSub, setNewSub] = useState({ name: '', category_id: '' });
    const [busy, setBusy] = useState(false);

    const handleAddCategory = async (e) => {
        e.preventDefault();
        setBusy(true);
        const tId = toast.loading('Synchronizing new portfolio group...');
        try {
            await categoriesAPI.create(newCat);
            setNewCat({ name: '', type: 'expense', icon: 'shopping-bag', color: '#6366f1' });
            await loadCategories();
            toast.success('Portfolio group synchronized.', { id: tId });
        } catch (err) {
            toast.error(err.message || 'Synchronization failed.', { id: tId });
        } finally {
            setBusy(false);
        }
    };

    const handleAddSubcategory = async (e) => {
        e.preventDefault();
        setBusy(true);
        const tId = toast.loading('Allocating new portfolio segment...');
        try {
            await subcategoriesAPI.create({ ...newSub, category_id: parseInt(newSub.category_id) });
            setNewSub({ name: '', category_id: '' });
            await loadCategories();
            toast.success('Portfolio segment allocated.', { id: tId });
        } catch (err) {
            toast.error(err.message || 'Allocation failed.', { id: tId });
        } finally {
            setBusy(false);
        }
    };

    const handleDeleteCategory = async (id) => {
        if (!confirm('Delete this category? All its subcategories and transactions will also be removed.')) return;
        const tId = toast.loading('De-provisioning portfolio group...');
        try {
            await categoriesAPI.delete(id);
            await loadCategories();
            toast.success('Portfolio group de-provisioned.', { id: tId });
        } catch (err) {
            toast.error(err.message || 'De-provisioning failed.', { id: tId });
        }
    };

    const handleDeleteSubcategory = async (id) => {
        if (!confirm('Delete this subcategory?')) return;
        const tId = toast.loading('Removing portfolio segment...');
        try {
            await subcategoriesAPI.delete(id);
            await loadCategories();
            toast.success('Portfolio segment removed.', { id: tId });
        } catch (err) {
            toast.error(err.message || 'Removal failed.', { id: tId });
        }
    };

    return (
        <Modal open={open} onClose={onClose} title="Portfolio Definition" wide>
            <div className="form-row luxury-form" style={{ alignItems: 'start', gridTemplateColumns: 'minmax(300px, 1fr) 1.5fr' }}>
                <div className="gap-stack">
                    <div className="premium-card" style={{ padding: '24px', background: 'rgba(255,255,255,0.02)' }}>
                        <h4 style={{ marginBottom: 16, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>New Portfolio Group</h4>
                        <form onSubmit={handleAddCategory}>
                            <div className="form-group">
                                <label className="form-label">Title</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    required
                                    value={newCat.name}
                                    onChange={(e) => setNewCat({ ...newCat, name: e.target.value })}
                                />
                            </div>
                            <div className="form-row" style={{ gap: '12px', alignItems: 'end', gridTemplateColumns: '1fr 100px' }}>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label">Flow Type</label>
                                    <select
                                        className="form-select"
                                        value={newCat.type}
                                        onChange={(e) => setNewCat({ ...newCat, type: e.target.value })}
                                    >
                                        <option value="expense">Debit</option>
                                        <option value="income">Credit</option>
                                    </select>
                                </div>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label">Glyph</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={newCat.icon}
                                        onChange={(e) => setNewCat({ ...newCat, icon: e.target.value })}
                                    />
                                </div>
                            </div>
                            <button type="submit" className="btn-primary-luxe" style={{ width: '100%' }} disabled={busy}>Add Portfolio</button>
                        </form>
                    </div>

                    <div className="premium-card" style={{ padding: '24px', background: 'rgba(255,255,255,0.02)' }}>
                        <h4 style={{ marginBottom: 16, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>New Sub-Allocation</h4>
                        <form onSubmit={handleAddSubcategory}>
                            <div className="form-group">
                                <label className="form-label">Parent Portfolio</label>
                                <select
                                    className="form-select"
                                    required
                                    value={newSub.category_id}
                                    onChange={(e) => setNewSub({ ...newSub, category_id: e.target.value })}
                                >
                                    <option value="">Select Parent</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Segment Title</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    required
                                    value={newSub.name}
                                    onChange={(e) => setNewSub({ ...newSub, name: e.target.value })}
                                />
                            </div>
                            <button type="submit" className="btn-primary-luxe" style={{ width: '100%' }} disabled={busy}>Add Segment</button>
                        </form>
                    </div>
                </div>

                <div className="premium-card" style={{ padding: '24px', background: 'rgba(255,255,255,0.02)', maxHeight: 600, overflowY: 'auto' }}>
                    <h4 style={{ marginBottom: 20, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Asset Registry</h4>
                    <div className="gap-stack" style={{ gap: '20px' }}>
                        {categories.map((cat) => (
                            <div key={cat.id} style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: 16 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                                    <div style={{ width: 32, height: 32, borderRadius: '8px', background: `${cat.color}22`, display: 'grid', placeItems: 'center', color: cat.color }}>
                                        <Icon name={cat.icon} size={18} />
                                    </div>
                                    <span style={{ fontWeight: 700, fontSize: '0.95rem', flex: 1 }}>{cat.name}</span>
                                    <span style={{ fontSize: '0.6rem', padding: '2px 8px', borderRadius: '4px', background: cat.type === 'income' ? 'rgba(52, 211, 153, 0.1)' : 'rgba(248, 113, 113, 0.1)', color: cat.type === 'income' ? 'var(--success)' : 'var(--danger)', fontWeight: 800, textTransform: 'uppercase' }}>{cat.type}</span>
                                    <button
                                        onClick={() => handleDeleteCategory(cat.id)}
                                        title="Delete category"
                                        style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '8px', width: 28, height: 28, display: 'grid', placeItems: 'center', cursor: 'pointer', flexShrink: 0 }}
                                    >
                                        <Icon name="trash-2" size={13} color="var(--danger)" />
                                    </button>
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, paddingLeft: '44px' }}>
                                    {subcategories.filter(s => s.category_id === cat.id).map(sub => (
                                        <span key={sub.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', padding: '4px 10px 4px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                                            {sub.name}
                                            <button
                                                onClick={() => handleDeleteSubcategory(sub.id)}
                                                title="Delete subcategory"
                                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'grid', placeItems: 'center', opacity: 0.5, lineHeight: 1 }}
                                            >
                                                <Icon name="x" size={11} color="var(--danger)" />
                                            </button>
                                        </span>
                                    ))}
                                    {subcategories.filter(s => s.category_id === cat.id).length === 0 && (
                                        <span className="text-muted" style={{ fontSize: '0.7rem', fontStyle: 'italic' }}>No segments defined</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </Modal>
    );
}
