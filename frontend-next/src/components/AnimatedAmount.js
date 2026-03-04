'use client';
import { useState, useEffect } from 'react';
import { formatCurrency } from '@/lib/format';

export default function AnimatedAmount({ value, duration = 800, showCurrency = true }) {
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        let start = null;
        const end = parseFloat(value) || 0;
        const initial = displayValue;

        const animate = (timestamp) => {
            if (!start) start = timestamp;
            const progress = Math.min((timestamp - start) / duration, 1);

            // Ease out cubic
            const easeOut = 1 - Math.pow(1 - progress, 3);

            setDisplayValue(initial + (end - initial) * easeOut);

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        const animationFrame = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationFrame);
    }, [value]);

    return (
        <span>
            {showCurrency ? formatCurrency(displayValue) : Math.round(displayValue)}
        </span>
    );
}
