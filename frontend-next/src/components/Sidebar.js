'use client';
import Icon from './Icon';

export default function Sidebar({ open, onClose, userEmail, onLogout, activeTab, onNavClick }) {
    const links = [
        { icon: 'layout-dashboard', label: 'Overview', id: 'dashboard' },
        { icon: 'receipt', label: 'Ledger', id: 'transactions' },
        { icon: 'folder', label: 'Portfolios', id: 'categories' },
        { icon: 'target', label: 'Allocation', id: 'budgets' },
        { icon: 'landmark', label: 'Liabilities', id: 'loans' },
    ];

    return (
        <>
            {open && <div className="sidebar-backdrop" onClick={onClose} />}
            <aside className={`sidebar ${open ? 'open' : ''}`}>
                <div className="sidebar-brand">
                    <div className="brand-logo-container">
                        <img src="/logo.png" alt="PPSJ" className="sidebar-logo-img" />
                    </div>
                </div>

                <nav className="sidebar-nav">
                    {links.map((l) => (
                        <button
                            key={l.id}
                            className={`luxury-nav-link ${activeTab === l.id ? 'active' : ''}`}
                            onClick={() => onNavClick(l.id)}
                        >
                            <span className="link-icon-luxury">
                                <Icon name={l.icon} size={18} />
                            </span>
                            <span className="link-label-luxury">{l.label}</span>
                            {activeTab === l.id && <div className="active-indicator" />}
                        </button>
                    ))}
                </nav>

                <div className="sidebar-footer-luxury">
                    <div className="user-profile">
                        <div className="user-avatar">{userEmail?.charAt(0).toUpperCase()}</div>
                        <div className="user-info">
                            <div className="user-email">{userEmail}</div>
                            <div className="user-status">Executive Access</div>
                        </div>
                    </div>
                    <button className="luxury-logout-btn" onClick={onLogout}>
                        <Icon name="log-out" size={16} />
                        <span>Terminate Session</span>
                    </button>
                </div>
            </aside>

            <style jsx>{`
                .sidebar {
                    background: var(--bg-secondary);
                    box-shadow: 10px 0 40px rgba(0,0,0,0.02);
                }
                .sidebar {
                    background: var(--bg-secondary);
                    box-shadow: 10px 0 40px rgba(0, 0, 0, 0.4);
                }
                .sidebar-backdrop {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.6);
                    backdrop-filter: blur(8px);
                    z-index: 999;
                }
                .sidebar-brand {
                    padding: 32px 24px;
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }
                .brand-logo-container {
                    width: 100%;
                    padding: 12px;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid var(--border-platinum);
                    border-radius: 16px;
                    display: grid;
                    place-items: center;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.2);
                }
                .sidebar-logo-img {
                    width: 100%;
                    height: auto;
                    border-radius: 8px;
                    filter: drop-shadow(0 0 10px rgba(0, 209, 255, 0.1));
                }

                .sidebar-nav {
                    padding: 20px 16px;
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }

                .luxury-nav-link {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    padding: 14px 18px;
                    border-radius: 14px;
                    border: none;
                    background: transparent;
                    color: var(--text-secondary);
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    position: relative;
                    width: 100%;
                    text-align: left;
                    cursor: pointer;
                }

                .luxury-nav-link:hover {
                    color: var(--text-primary);
                    background: rgba(255, 255, 255, 0.03);
                }

                .luxury-nav-link.active {
                    color: var(--text-primary);
                    background: rgba(255, 255, 255, 0.05);
                    box-shadow: inset 0 0 20px rgba(255, 255, 255, 0.02);
                }

                .link-label-luxury {
                    font-size: 0.95rem;
                    font-weight: 600;
                }

                .active-indicator {
                    position: absolute;
                    left: 0;
                    width: 4px;
                    height: 20px;
                    background: var(--accent-primary);
                    border-radius: 0 4px 4px 0;
                    box-shadow: 0 0 15px var(--accent-primary);
                }

                .sidebar-footer-luxury {
                    margin-top: auto;
                    padding: 32px 24px;
                    border-top: 1px solid var(--border-color);
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                }

                .user-profile {
                    display: flex;
                    align-items: center;
                    gap: 14px;
                }

                .user-avatar {
                    width: 40px;
                    height: 40px;
                    border-radius: 12px;
                    background: var(--accent-gradient);
                    color: #000;
                    display: grid;
                    place-items: center;
                    font-weight: 800;
                    font-size: 1.1rem;
                }

                .user-email {
                    font-size: 0.85rem;
                    font-weight: 700;
                    color: var(--text-primary);
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    max-width: 160px;
                }

                .user-status {
                    font-size: 0.7rem;
                    color: var(--accent-teal);
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    font-weight: 800;
                }

                .luxury-logout-btn {
                    width: 100%;
                    padding: 12px;
                    border-radius: 12px;
                    border: 1px solid rgba(239, 68, 68, 0.1);
                    background: rgba(239, 68, 68, 0.05);
                    color: var(--danger);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    font-size: 0.85rem;
                    font-weight: 700;
                    transition: all 0.3s ease;
                }

                .luxury-logout-btn:hover {
                    background: var(--danger);
                    color: #fff;
                }
            `}</style>
        </>
    );
}
