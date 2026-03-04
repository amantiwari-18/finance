import * as Icons from 'lucide-react';

export default function Icon({ name, size = 20, color = 'currentColor', className = '' }) {
    // Map of emoji/old icons to Lucide icons if any
    const iconMap = {
        '🚗': 'Car',
        '🍔': 'Utensils',
        '🛍️': 'ShoppingBag',
        '🎬': 'Film',
        '💡': 'Zap',
        '💰': 'Banknote',
        '📈': 'TrendingUp',
        '🏦': 'Landmark',
        '🏠': 'Home',
        '🏥': 'HeartPulse',
        '🎓': 'GraduationCap',
        '✈️': 'Plane',
        '📱': 'Smartphone',
        '🎮': 'Gamepad2',
        'utensils': 'Utensils',
        'car': 'Car',
        'shopping-bag': 'ShoppingBag',
        'film': 'Film',
        'zap': 'Zap',
        'banknote': 'Banknote',
        'trending-up': 'TrendingUp',
        'landmark': 'Landmark',
        'wallet': 'Wallet',
        'receipt': 'Receipt',
    };

    const iconName = iconMap[name] || name;

    // Capitalize first letter and handle kebab-case
    const formattedName = iconName
        .split('-')
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join('');

    const LucideIcon = Icons[formattedName] || Icons.HelpCircle;

    return <LucideIcon size={size} color={color} className={className} />;
}
