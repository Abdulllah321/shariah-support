// src/data/menuData.ts
import {
    FileText, Link, Briefcase, List, BookOpen, Activity, Shield, Users,
    TrendingUp, LogOut, LayoutDashboard, Trophy
} from 'lucide-react';

export interface MenuItem {
    key: string;
    label: string;
    href?: string;
    icon: React.ComponentType<{ className?: string }>;
    action?: () => void;
    className?: string;
}

export interface MenuSection {
    title: string | null;
    items: MenuItem[];
}

export const getMenuSections = (handleLogout: () => void): MenuSection[] => [
    { title: null, items: [{ key: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard }] },
    {
        title: "Report Items",
        items: [
            { key: 'daily-activity-record', label: 'Daily Activity Record', href: '/daily-activity', icon: FileText },
            { key: 'branch-shariah-review', label: 'Branch Shariah Review', href: '/branch-review', icon: Shield },
            { key: 'staff-interview', label: 'Staff Interview', href: '/staff-interview', icon: Users },
            { key: 'lead-360', label: 'Lead 360', href: '/leads', icon: TrendingUp },
        ]
    },
    {
        title: "Knowledge Centre",
        items: [
            { key: 'process-flow', label: 'Process Flow', href: '/process-flow', icon: Activity },
            { key: 'session-link', label: 'Session Link', href: '/session-link', icon: Link },
            { key: 'chamber-of-commerce', label: 'Chamber of Commerce', href: '/chamber-of-commerce', icon: Briefcase },
            { key: 'branches-list', label: 'Branches List', href: '/branches-list', icon: List },
            { key: 'madaris-list', label: 'Madaris List', href: '/madaris-list', icon: BookOpen },
        ]
    },
    { title: "Leaderboard", items: [{ key: 'leaderboard', label: 'Leaderboard', href: '/leaderboard', icon: Trophy }] },
    {
        title: null,
        items: [{
            key: 'logout',
            label: 'Logout',
            icon: LogOut,
            action: handleLogout,
            className: "text-danger"
        }]
    }
];
