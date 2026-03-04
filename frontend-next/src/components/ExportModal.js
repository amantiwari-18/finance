'use client';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import Modal from './Modal';
import Icon from './Icon';
import { transactionsAPI } from '@/lib/api';

export default function ExportModal({ open, onClose }) {
    const [range, setRange] = useState('month');
    const [method, setMethod] = useState('download');
    const [loading, setLoading] = useState(false);

    const handleAction = async () => {
        setLoading(true);
        const tId = toast.loading('Calibrating treasury manifest...');
        try {
            const result = await transactionsAPI.exportExcel(range, method);

            if (method === 'download') {
                const url = window.URL.createObjectURL(result);
                const a = document.createElement('a');
                a.href = url;
                a.download = `Vault_Registry_${range}.xlsx`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                toast.success('Registry manifest localized.', { id: tId });
            } else {
                toast.success('Secure Treasury Transmission initiated. Check your encrypted inbox.', { id: tId });
                onClose();
            }
        } catch (err) {
            toast.error(err.message || 'Transmission failed.', { id: tId });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal open={open} onClose={onClose} title="Capital Registry Export" wide={false}>
            <div className="premium-card" style={{ padding: '24px', background: 'rgba(255,255,255,0.02)' }}>
                <div style={{ marginBottom: 24 }}>
                    <label className="form-label" style={{ color: 'var(--accent-teal)', marginBottom: 12, display: 'block' }}>TEMPORAL HORIZON</label>
                    <div className="range-grid">
                        {['today', 'week', 'month', 'year', 'all'].map(r => (
                            <button
                                key={r}
                                className={`range-pill ${range === r ? 'active' : ''}`}
                                onClick={() => setRange(r)}
                            >
                                {r.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>

                <div style={{ marginBottom: 32 }}>
                    <label className="form-label" style={{ color: 'var(--accent-teal)', marginBottom: 12, display: 'block' }}>DELIVERY PROTOCOL</label>
                    <div className="method-stack">
                        <button
                            className={`method-card ${method === 'download' ? 'active' : ''}`}
                            onClick={() => setMethod('download')}
                        >
                            <div className="method-info">
                                <Icon name="download" size={20} />
                                <div>
                                    <div className="method-name">DIRECT DOWNLOAD</div>
                                    <div className="method-desc">Instant localization of XLSX manifest</div>
                                </div>
                            </div>
                        </button>
                        <button
                            className={`method-card ${method === 'email' ? 'active' : ''}`}
                            onClick={() => setMethod('email')}
                        >
                            <div className="method-info">
                                <Icon name="mail" size={20} />
                                <div>
                                    <div className="method-name">SECURE EMAIL</div>
                                    <div className="method-desc">Data summary with optional attachments</div>
                                </div>
                            </div>
                        </button>
                    </div>
                </div>

                <button
                    className="btn-primary-luxe"
                    style={{ width: '100%', padding: '16px' }}
                    onClick={handleAction}
                    disabled={loading}
                >
                    {loading ? 'CALIBRATING...' : 'INITIATE EXPORT'}
                </button>
            </div>

            <style jsx>{`
                .range-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 8px;
                }
                .range-pill {
                    background: rgba(255,255,255,0.03);
                    border: 1px solid var(--border-color);
                    color: var(--text-secondary);
                    padding: 8px;
                    border-radius: 8px;
                    font-size: 0.7rem;
                    font-weight: 800;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .range-pill:hover { background: rgba(255,255,255,0.08); }
                .range-pill.active {
                    background: var(--accent-teal);
                    color: #000;
                    border-color: var(--accent-teal);
                }

                .method-stack {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                .method-card {
                    background: rgba(255,255,255,0.03);
                    border: 1px solid var(--border-color);
                    padding: 16px;
                    border-radius: 12px;
                    cursor: pointer;
                    text-align: left;
                    width: 100%;
                    transition: all 0.2s;
                }
                .method-card:hover { background: rgba(255,255,255,0.05); }
                .method-card.active {
                    border-color: var(--accent-sapphire);
                    background: rgba(99, 102, 241, 0.05);
                }
                .method-info {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    color: var(--text-primary);
                }
                .method-name { font-weight: 800; font-size: 0.85rem; }
                .method-desc { font-size: 0.7rem; color: var(--text-muted); font-weight: 600; margin-top: 2px; }
            `}</style>
        </Modal>
    );
}
