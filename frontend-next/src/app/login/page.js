'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI } from '@/lib/api';
import Icon from '@/components/Icon';
import { toast } from 'react-hot-toast';

export default function LoginPage() {
    const router = useRouter();
    const [isRegister, setIsRegister] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (isRegister && password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setBusy(true);
        const tId = toast.loading(isRegister ? 'Provisioning new account...' : 'Authenticating access...');
        try {
            if (isRegister) {
                await authAPI.register(email, password);
                toast.success('Account provisioned.', { id: tId });
            }
            const data = await authAPI.login(email, password);
            localStorage.setItem('accessToken', data.access_token);
            localStorage.setItem('userEmail', email);
            toast.success('Access granted to Vault.', { id: tId });
            router.push('/');
        } catch (err) {
            toast.error(err.message || 'Authentication failed.', { id: tId });
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="auth-page-luxury">
            <div className="auth-mesh-background" />
            <div className="auth-card-premium slide-up">
                <div className="auth-header-luxury">
                    <div className="auth-logo-frame">
                        <img src="/logo.png" alt="PPSJ Financial Solutions" className="auth-main-logo" />
                    </div>
                    <p className="auth-subtitle">
                        {isRegister ? 'Join the Sovereign Financial Circle' : 'PPSJ Financial Solutions | Access Vault'}
                    </p>
                </div>

                {error && (
                    <div className="luxury-error-alert fade-in">
                        <Icon name="alert-circle" size={16} />
                        <span>{error}</span>
                    </div>
                )}

                <form className="auth-form-luxury" onSubmit={handleSubmit}>
                    <div className="luxury-input-group">
                        <label>Email Address</label>
                        <div className="input-wrapper-luxury">
                            <Icon name="mail" size={18} color="var(--text-muted)" />
                            <input
                                type="email"
                                placeholder="Enter your email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="luxury-input-group">
                        <label>Password</label>
                        <div className="input-wrapper-luxury">
                            <Icon name="lock" size={18} color="var(--text-muted)" />
                            <input
                                type="password"
                                placeholder="••••••••"
                                required
                                minLength={6}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    {isRegister && (
                        <div className="luxury-input-group">
                            <label>Confirm Password</label>
                            <div className="input-wrapper-luxury">
                                <Icon name="check-circle" size={18} color="var(--text-muted)" />
                                <input
                                    type="password"
                                    placeholder="Confirm your password"
                                    required
                                    minLength={6}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                            </div>
                        </div>
                    )}

                    <button type="submit" className="luxury-auth-btn" disabled={busy}>
                        {busy ? <div className="platinum-spinner" /> : (isRegister ? 'Create Account' : 'Login')}
                    </button>
                </form>

                <div className="auth-foot-luxury">
                    <span>{isRegister ? 'Already have an account?' : "Don't have an account?"}</span>
                    <button className="text-toggle-luxury" onClick={() => { setIsRegister(!isRegister); setError(''); }}>
                        {isRegister ? 'Login Instead' : 'Sign Up Now'}
                    </button>
                </div>
            </div>

            <style jsx>{`
                .auth-page-luxury {
                    min-height: 100vh;
                    display: grid;
                    place-items: center;
                    background: var(--bg-primary);
                    position: relative;
                    overflow: hidden;
                    padding: 20px;
                }
                .auth-mesh-background {
                    position: absolute;
                    inset: 0;
                    background-image: 
                        radial-gradient(circle at 2px 2px, rgba(226, 232, 240, 0.05) 1px, transparent 0);
                    background-size: 40px 40px;
                    opacity: 0.5;
                }
                .auth-card-premium {
                    width: 100%;
                    max-width: 440px;
                    background: rgba(18, 18, 20, 0.8);
                    backdrop-filter: blur(24px);
                    border: 1px solid var(--border-platinum);
                    border-radius: 32px;
                    padding: 48px;
                    box-shadow: 0 40px 100px rgba(0,0,0,0.6);
                    position: relative;
                    z-index: 10;
                }
                .auth-header-luxury {
                    text-align: center;
                    margin-bottom: 40px;
                }
                .auth-logo-frame {
                    width: 140px;
                    margin: 0 auto 24px;
                    padding: 12px;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid var(--border-platinum);
                    border-radius: 20px;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.4);
                }
                .auth-main-logo {
                    width: 100%;
                    height: auto;
                    border-radius: 12px;
                }
                .auth-subtitle {
                    color: var(--text-secondary);
                    font-size: 0.95rem;
                    font-weight: 600;
                }
                .luxury-error-alert {
                    background: rgba(239, 68, 68, 0.1);
                    border: 1px solid rgba(239, 68, 68, 0.2);
                    color: #ff8a8a;
                    padding: 12px 16px;
                    border-radius: 14px;
                    font-size: 0.85rem;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 24px;
                }
                .auth-form-luxury {
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                }
                .luxury-input-group label {
                    display: block;
                    font-size: 0.75rem;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    color: var(--text-muted);
                    margin-bottom: 8px;
                    padding-left: 4px;
                }
                .input-wrapper-luxury {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    background: #000;
                    border: 1px solid var(--border-color);
                    border-radius: 16px;
                    padding: 0 16px;
                    height: 56px;
                    transition: all 0.3s ease;
                }
                .input-wrapper-luxury:focus-within {
                    border-color: var(--accent-teal);
                    box-shadow: 0 0 20px rgba(0, 209, 255, 0.1);
                }
                .input-wrapper-luxury input {
                    background: none;
                    border: none;
                    color: var(--text-primary);
                    font-size: 1rem;
                    width: 100%;
                    outline: none;
                }
                .input-wrapper-luxury input::placeholder {
                    color: #4b5563;
                }
                .luxury-auth-btn {
                    height: 56px;
                    margin-top: 12px;
                    background: var(--accent-gradient);
                    border: none;
                    border-radius: 16px;
                    color: #000;
                    font-weight: 800;
                    font-size: 1.05rem;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    display: grid;
                    place-items: center;
                }
                .luxury-auth-btn:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 30px rgba(226, 232, 240, 0.2);
                    filter: brightness(1.1);
                }
                .luxury-auth-btn:active {
                    transform: scale(0.98);
                }
                .luxury-auth-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
                .platinum-spinner {
                    width: 24px;
                    height: 24px;
                    border: 3px solid rgba(0,0,0,0.1);
                    border-top-color: #000;
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                }
                @keyframes spin { to { transform: rotate(360deg); } }
                .auth-foot-luxury {
                    margin-top: 32px;
                    text-align: center;
                    font-size: 0.9rem;
                    color: var(--text-muted);
                }
                .text-toggle-luxury {
                    border: none;
                    background: none;
                    color: var(--accent-teal);
                    font-weight: 700;
                    margin-left: 8px;
                    cursor: pointer;
                    text-decoration: underline;
                }
            `}</style>
        </div>
    );
}
