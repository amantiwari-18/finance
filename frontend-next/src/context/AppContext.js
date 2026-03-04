'use client';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI, categoriesAPI, subcategoriesAPI, transactionsAPI, analyticsAPI, loansAPI } from '@/lib/api';

const AppContext = createContext();

export function AppProvider({ children }) {
    const [user, setUser] = useState(null);
    const [categories, setCategories] = useState([]);
    const [subcategories, setSubcategories] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [loans, setLoans] = useState([]);
    const [loading, setLoading] = useState(true);

    // Check auth on mount
    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        const email = localStorage.getItem('userEmail');
        if (token && email) {
            setUser({ email });
            setLoading(false);
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (email, password) => {
        const data = await authAPI.login(email, password);
        localStorage.setItem('accessToken', data.access_token);
        localStorage.setItem('userEmail', email);
        setUser({ email });
    };

    const register = async (email, password) => {
        await authAPI.register(email, password);
        await login(email, password);
    };

    const logout = () => {
        authAPI.logout();
        setUser(null);
    };

    const loadCategories = useCallback(async () => {
        try {
            const cats = await categoriesAPI.getAll();
            setCategories(cats);
            const subs = await subcategoriesAPI.getAll();
            setSubcategories(subs);
        } catch (e) {
            console.error('Failed to load categories', e);
        }
    }, []);

    const loadTransactions = useCallback(async (filters = {}) => {
        try {
            const data = await transactionsAPI.getAll(filters);
            setTransactions(data);
        } catch (e) {
            console.error('Failed to load transactions', e);
        }
    }, []);

    const loadAnalytics = useCallback(async () => {
        try {
            const data = await analyticsAPI.getSummary();
            setAnalytics(data);
        } catch (e) {
            console.error('Failed to load analytics', e);
        }
    }, []);

    const loadLoans = useCallback(async () => {
        try {
            const data = await loansAPI.getAll();
            setLoans(data);
        } catch (e) {
            console.error('Failed to load loans', e);
        }
    }, []);

    const refreshAll = useCallback(async () => {
        await Promise.all([loadCategories(), loadTransactions(), loadAnalytics(), loadLoans()]);
    }, [loadCategories, loadTransactions, loadAnalytics, loadLoans]);

    return (
        <AppContext.Provider
            value={{
                user, login, register, logout, loading,
                categories, subcategories, transactions, analytics, loans,
                loadCategories, loadTransactions, loadAnalytics, loadLoans, refreshAll,
                setTransactions,
            }}
        >
            {children}
        </AppContext.Provider>
    );
}

export const useApp = () => useContext(AppContext);
