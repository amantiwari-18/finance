'use client';
import Icon from './Icon';
import { formatCurrency as fmt } from '@/lib/format';
import AnimatedAmount from './AnimatedAmount';

export default function StatsCards({ analytics, transactions = [], loans = [] }) {
    const income = analytics?.total_income ?? 0;
    const expense = analytics?.total_expense ?? 0;
    const balance = income - expense;  // cash flow balance (no loans)
    const totalDebt = loans.reduce((acc, l) => acc + l.remaining_amount, 0);
    const netWorth = balance - totalDebt;

    return (
        <div className="premium-stats-wrap">
            {/* Primary Net Worth Display - The "Hero" of the dashboard */}
            <div className="premium-card hero-card-vault">
                <div className="hero-content">
                    <div className="hero-label-top">Capital Strength</div>
                    <div className={`hero-value-main ${balance >= 0 ? 'platinum-text' : 'danger-text'}`}>
                        <AnimatedAmount value={balance} />
                    </div>
                    <div className="hero-meta">
                        <span className="meta-item"><Icon name="shield-check" size={12} /> Comprehensive Liquidity</span>
                    </div>
                </div>
                <div className="hero-visual">
                    <div className="visual-circle" />
                    <Icon name="landmark" size={48} className="visual-icon" />
                </div>
            </div>

            <div className="premium-grid-stats">
                {/* Available Cash */}
                <div className="premium-card mini-stat-card">
                    <div className="mini-card-head">
                        <Icon name="wallet" size={16} color="var(--accent-teal)" />
                        <span className="mini-card-label">Liquid Assets</span>
                    </div>
                    <div className="mini-card-body">
                        <div className="mini-value"><AnimatedAmount value={balance} /></div>
                        <div className="mini-trend positive">Portfolio Total</div>
                    </div>
                </div>

                {/* Total Debt */}
                <div className="premium-card mini-stat-card">
                    <div className="mini-card-head">
                        <Icon name="shield-alert" size={16} color="var(--danger)" />
                        <span className="mini-card-label">Liabilities</span>
                    </div>
                    <div className="mini-card-body">
                        <div className="mini-value text-danger"><AnimatedAmount value={totalDebt} /></div>
                        <div className="mini-trend negative">Total Obligation</div>
                    </div>
                </div>

                {/* Monthly Performance - Income */}
                <div className="premium-card mini-stat-card">
                    <div className="mini-card-head">
                        <Icon name="arrow-up-right" size={16} color="var(--success)" />
                        <span className="mini-card-label">Inflow</span>
                    </div>
                    <div className="mini-card-body">
                        <div className="mini-value text-success"><AnimatedAmount value={income} /></div>
                        <div className="mini-trend positive">Credit Performance</div>
                    </div>
                </div>

                {/* Monthly Performance - Expense */}
                <div className="premium-card mini-stat-card">
                    <div className="mini-card-head">
                        <Icon name="arrow-down-right" size={16} color="var(--danger)" />
                        <span className="mini-card-label">Outflow</span>
                    </div>
                    <div className="mini-card-body">
                        <div className="mini-value text-danger"><AnimatedAmount value={expense} /></div>
                        <div className="mini-trend negative">Debit Performance</div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .premium-stats-wrap {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                    width: 100%;
                }
                .premium-card {
                    background: var(--bg-card);
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius-md);
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                    position: relative;
                    overflow: hidden;
                    box-shadow: var(--shadow-sm);
                }
                .hero-card-vault {
                    padding: 32px;
                    background: linear-gradient(135deg, #0f172a 0%, #020617 100%);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border: 1px solid var(--border-platinum);
                    box-shadow: 0 10px 40px rgba(0,0,0,0.5);
                }
                .hero-label-top {
                    font-size: 0.7rem;
                    text-transform: uppercase;
                    letter-spacing: 0.15em;
                    color: var(--accent-teal);
                    font-weight: 800;
                    margin-bottom: 8px;
                }
                .hero-value-main {
                    font-size: clamp(2rem, 5vw, 2.75rem);
                    font-weight: 800;
                    letter-spacing: -0.04em;
                    line-height: 1;
                    margin-bottom: 16px;
                }
                .platinum-text {
                    background: var(--accent-gradient);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                .danger-text { color: var(--danger); }
                .meta-item {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 0.75rem;
                    color: var(--text-muted);
                    font-weight: 600;
                }
                .hero-visual {
                    position: relative;
                    width: 80px;
                    height: 80px;
                    display: grid;
                    place-items: center;
                }
                .visual-circle {
                    position: absolute;
                    inset: 0;
                    border: 1px solid var(--accent-teal);
                    border-radius: 50%;
                    animation: pulse 4s infinite;
                    opacity: 0.2;
                }
                @keyframes pulse {
                    0% { transform: scale(1); opacity: 0.2; }
                    50% { transform: scale(1.1); opacity: 0.05; }
                    100% { transform: scale(1); opacity: 0.2; }
                }
                .visual-icon { color: var(--accent-teal); opacity: 0.25; }

                .premium-grid-stats {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 16px;
                }
                .mini-stat-card { padding: 20px; }
                .mini-card-head {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 12px;
                }
                .mini-card-label {
                    font-size: 0.7rem;
                    font-weight: 800;
                    color: var(--text-secondary);
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                }
                .mini-value {
                    font-size: 1.25rem;
                    font-weight: 800;
                    margin-bottom: 4px;
                    letter-spacing: -0.01em;
                    color: var(--text-primary);
                }
                .mini-trend {
                    font-size: 0.7rem;
                    font-weight: 700;
                    color: var(--text-muted);
                }

                @media (max-width: 640px) {
                    .premium-grid-stats {
                        grid-template-columns: repeat(2, 1fr);
                        gap: 12px;
                    }
                    .mini-stat-card { padding: 16px; }
                    .mini-value { font-size: 1.1rem; }
                    .hero-card-vault { padding: 24px; }
                }
            `}</style>
        </div>
    );
}
