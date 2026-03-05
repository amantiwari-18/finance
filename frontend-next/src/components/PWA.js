'use client';
import { useEffect } from 'react';

export default function PWA() {
    useEffect(() => {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js').then(
                    (registration) => {
                        console.log('PWA ServiceWorker registration successful with scope: ', registration.scope);
                    },
                    (err) => {
                        console.log('PWA ServiceWorker registration failed: ', err);
                    }
                );
            });
        }
    }, []);

    return null;
}
