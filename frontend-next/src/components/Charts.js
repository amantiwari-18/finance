import { useEffect, useRef, useState } from 'react';
import Icon from './Icon';
import { formatCurrency } from '@/lib/format';
import {
    Chart as ChartJS,
    ArcElement,
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
    Legend,
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function Charts({ analytics, categories }) {
    if (!analytics) return null;

    const expenseBreakdown = (analytics.category_breakdown || []).filter((c) => {
        const cat = categories.find((cat) => cat.id === c.category_id);
        return cat?.type === 'expense';
    });

    const doughnutData = {
        labels: expenseBreakdown.map((c) => c.category_name),
        datasets: [
            {
                data: expenseBreakdown.map((c) => c.total_amount),
                backgroundColor: expenseBreakdown.map((c) => {
                    const cat = categories.find((cat) => cat.id === c.category_id);
                    return cat?.color || '#8b5cf6';
                }),
                borderWidth: 0,
                hoverOffset: 8,
            },
        ],
    };

    const barData = {
        labels: ['Income', 'Expenses'],
        datasets: [
            {
                label: 'Amount',
                data: [analytics.total_income, analytics.total_expense],
                backgroundColor: ['rgba(16,185,129,0.7)', 'rgba(239,68,68,0.7)'],
                borderRadius: 6,
                barThickness: 48,
            },
        ],
    };

    const commonLegend = {
        labels: {
            color: '#94a3b8',
            padding: 20,
            usePointStyle: true,
            pointStyle: 'circle',
            font: {
                family: "'Plus Jakarta Sans', sans-serif",
                size: 11,
                weight: '600'
            }
        }
    };

    return (
        <div className="luxury-charts-grid">
            <div className="luxury-card chart-card">
                <div className="chart-header">
                    <h3>Capital Allocation</h3>
                    <div className="chart-subtitle">Expense distribution by category</div>
                </div>
                {expenseBreakdown.length === 0 ? (
                    <div className="empty-state-luxury">
                        <Icon name="pie-chart" size={48} color="var(--border-gold)" />
                        <div className="empty-text">Awaiting financial data for allocation analysis.</div>
                    </div>
                ) : (
                    <div className="doughnut-wrap">
                        <Doughnut
                            data={doughnutData}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                cutout: '75%',
                                plugins: {
                                    legend: { position: 'bottom', ...commonLegend },
                                    tooltip: {
                                        backgroundColor: 'rgba(2, 6, 23, 0.95)',
                                        titleFont: { family: "'Plus Jakarta Sans', sans-serif", size: 13 },
                                        bodyFont: { family: "'Plus Jakarta Sans', sans-serif", size: 12 },
                                        padding: 12,
                                        borderColor: 'rgba(251, 191, 36, 0.2)',
                                        borderWidth: 1,
                                        callbacks: {
                                            label: (context) => {
                                                const label = context.label || '';
                                                const value = context.parsed || 0;
                                                return ` ${label}: ${formatCurrency(value)}`;
                                            }
                                        }
                                    }
                                },
                            }}
                        />
                    </div>
                )}
            </div>

            <div className="luxury-card chart-card">
                <div className="chart-header">
                    <h3>Flow Analysis</h3>
                    <div className="chart-subtitle">Comparative revenue vs expenditure</div>
                </div>
                <div className="bar-wrap">
                    <Bar
                        data={barData}
                        options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: { display: false },
                                tooltip: {
                                    backgroundColor: 'rgba(2, 6, 23, 0.95)',
                                    padding: 12,
                                    borderColor: 'rgba(251, 191, 36, 0.2)',
                                    borderWidth: 1,
                                    callbacks: {
                                        label: (context) => {
                                            const label = context.dataset.label || '';
                                            const value = context.parsed.y || 0;
                                            return ` ${label}: ${formatCurrency(value)}`;
                                        }
                                    }
                                }
                            },
                            scales: {
                                y: {
                                    beginAtZero: true,
                                    ticks: {
                                        color: '#64748b',
                                        font: { family: "'JetBrains Mono', monospace", size: 10 },
                                        callback: (value) => formatCurrency(value)
                                    },
                                    grid: { color: 'rgba(148,163,184,0.05)' },
                                },
                                x: {
                                    ticks: {
                                        color: '#94a3b8',
                                        font: { family: "'Plus Jakarta Sans', sans-serif", size: 11, weight: '600' }
                                    },
                                    grid: { display: false },
                                },
                            },
                        }}
                    />
                </div>
            </div>

            <style jsx>{`
                .luxury-charts-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
                    gap: 24px;
                    margin-top: 24px;
                }

                .chart-card {
                    padding: 32px;
                    background: var(--bg-card);
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius-lg);
                    display: flex;
                    flex-direction: column;
                }

                .chart-header {
                    margin-bottom: 30px;
                }

                .chart-header h3 {
                    font-size: 1rem;
                    font-weight: 700;
                    letter-spacing: 0.1em;
                    text-transform: uppercase;
                    color: var(--text-primary);
                    margin-bottom: 6px;
                }

                .chart-subtitle {
                    font-size: 0.8rem;
                    color: var(--text-muted);
                }

                .doughnut-wrap {
                    height: 300px;
                    position: relative;
                }

                .bar-wrap {
                    height: 300px;
                }

                .empty-state-luxury {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 16px;
                    padding: 40px;
                }

                .empty-text {
                    font-size: 0.9rem;
                    color: var(--text-muted);
                    text-align: center;
                    max-width: 240px;
                }

                @media (max-width: 640px) {
                    .luxury-charts-grid {
                        grid-template-columns: 1fr;
                    }
                    .chart-card {
                        padding: 24px;
                    }
                }
            `}</style>
        </div>
    );
}
