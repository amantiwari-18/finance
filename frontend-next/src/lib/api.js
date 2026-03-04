const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

function getToken() {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('accessToken');
}

async function request(path, options = {}) {
    const token = getToken();
    const headers = { ...options.headers };

    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

    if (res.status === 401) {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('userEmail');
            window.location.href = '/login';
        }
        throw new Error('Unauthorized');
    }

    if (res.status === 204) return null;

    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Request failed');
    return data;
}

// ---------- Auth ----------
export const authAPI = {
    async register(email, password) {
        return request('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
    },

    async login(email, password) {
        const form = new URLSearchParams();
        form.append('username', email);
        form.append('password', password);

        const res = await fetch(`${API_BASE}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: form,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || 'Login failed');
        return data;
    },

    logout() {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userEmail');
        window.location.href = '/login';
    },
};

// ---------- Categories ----------
export const categoriesAPI = {
    getAll: () => request('/api/categories'),
    create: (data) => request('/api/categories', { method: 'POST', body: JSON.stringify(data) }),
    delete: (id) => request(`/api/categories/${id}`, { method: 'DELETE' }),
};

// ---------- Subcategories ----------
export const subcategoriesAPI = {
    getAll: (categoryId) =>
        request(`/api/subcategories${categoryId ? `?category_id=${categoryId}` : ''}`),
    create: (data) => request('/api/subcategories', { method: 'POST', body: JSON.stringify(data) }),
    delete: (id) => request(`/api/subcategories/${id}`, { method: 'DELETE' }),
};

// ---------- Transactions ----------
export const transactionsAPI = {
    getAll(filters = {}) {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([k, v]) => {
            if (v !== undefined && v !== null && v !== '') params.append(k, v);
        });
        return request(`/api/transactions?${params}`);
    },
    create: (data) => request('/api/transactions', { method: 'POST', body: JSON.stringify(data) }),
    createBulk: (transactions) =>
        request('/api/transactions/bulk', { method: 'POST', body: JSON.stringify({ transactions }) }),
    update: (id, data) =>
        request(`/api/transactions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => request(`/api/transactions/${id}`, { method: 'DELETE' }),
    async exportExcel(rangeType = 'all', method = 'download') {
        const token = getToken();
        const url = `${API_BASE}/api/export/transactions?range_type=${rangeType}&method=${method}`;
        const res = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.detail || 'Export failed');
        }

        if (method === 'email') {
            return res.json(); // Assuming email method returns JSON confirmation
        }
        return res.blob(); // For download, return the blob
    },
};

// ---------- Budgets ----------
export const budgetsAPI = {
    getAll: () => request('/api/budgets'),
    create: (data) => request('/api/budgets', { method: 'POST', body: JSON.stringify(data) }),
    delete: (id) => request(`/api/budgets/${id}`, { method: 'DELETE' }),
};

// ---------- Analytics ----------
export const analyticsAPI = {
    getSummary: (params = {}) => {
        const q = new URLSearchParams();
        Object.entries(params).forEach(([k, v]) => {
            if (v) q.append(k, v);
        });
        return request(`/api/analytics/summary?${q}`);
    },
};

// ---------- Loans ----------
export const loansAPI = {
    getAll: () => request('/api/loans'),
    create: (data) => request('/api/loans', { method: 'POST', body: JSON.stringify(data) }),
    delete: (id) => request(`/api/loans/${id}`, { method: 'DELETE' }),
};

// ---------- Import ----------
export const importAPI = {
    async importExcel(file) {
        const form = new FormData();
        form.append('file', file);
        return request('/api/import/excel', { method: 'POST', body: form });
    },
};
