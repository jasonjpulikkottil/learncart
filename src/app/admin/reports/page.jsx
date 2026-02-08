'use client';

import { useEffect, useState } from 'react';
import { Users, Package, TrendingUp, Download, Calendar, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminReportsPage() {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const res = await fetch('/api/admin/analytics');
            const data = await res.json();
            if (data.success) {
                setAnalytics(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const exportToCSV = (data, filename) => {
        const csv = data.map(row => Object.values(row).join(',')).join('\n');
        const header = Object.keys(data[0]).join(',') + '\n';
        const blob = new Blob([header + csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!analytics) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-600">Failed to load reports</p>
            </div>
        );
    }

    const { overview, recent } = analytics;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900">Reports & Analytics</h2>
                    <p className="text-gray-600 mt-1">Platform statistics and data exports</p>
                </div>
                <button
                    onClick={() => window.print()}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                    <Download className="w-4 h-4" />
                    Print Report
                </button>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Users"
                    value={overview.totalUsers}
                    icon={<Users className="w-6 h-6" />}
                    color="bg-blue-500"
                    subtitle={`${overview.verifiedUsers} verified`}
                />
                <StatCard
                    title="Total Listings"
                    value={overview.totalListings}
                    icon={<Package className="w-6 h-6" />}
                    color="bg-green-500"
                    subtitle={`${overview.activeListings} active`}
                />
                <StatCard
                    title="Email Verified"
                    value={overview.verifiedUsers}
                    icon={<CheckCircle className="w-6 h-6" />}
                    color="bg-purple-500"
                    subtitle={`${((overview.verifiedUsers / overview.totalUsers) * 100).toFixed(0)}% rate`}
                />
                <StatCard
                    title="Sold Items"
                    value={overview.soldListings}
                    icon={<TrendingUp className="w-6 h-6" />}
                    color="bg-orange-500"
                    subtitle="All time"
                />
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                    <Calendar className="w-5 h-5 text-indigo-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Recent Activity (Last 7 Days)</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ActivityCard
                        label="New Users"
                        value={recent.newUsers}
                        icon={<Users className="w-5 h-5" />}
                        color="text-blue-600"
                    />
                    <ActivityCard
                        label="New Listings"
                        value={recent.newListings}
                        icon={<Package className="w-5 h-5" />}
                        color="text-green-600"
                    />
                </div>
            </div>

            {/* User Statistics */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">User Statistics</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatItem label="Total Users" value={overview.totalUsers} />
                    <StatItem label="Verified Users" value={overview.verifiedUsers} />
                    <StatItem label="Unverified Users" value={overview.unverifiedUsers} />
                    <StatItem label="Verification Rate" value={`${((overview.verifiedUsers / overview.totalUsers) * 100).toFixed(1)}%`} />
                </div>
            </div>

            {/* Listing Statistics */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Listing Statistics</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatItem label="Total Listings" value={overview.totalListings} />
                    <StatItem label="Active Listings" value={overview.activeListings} />
                    <StatItem label="Sold Listings" value={overview.soldListings} />
                    <StatItem label="Success Rate" value={`${((overview.soldListings / overview.totalListings) * 100).toFixed(1)}%`} />
                </div>
            </div>

            {/* Activity Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Summary</h3>
                <div className="space-y-3">
                    <SummaryItem
                        label="Average Listings per User"
                        value={(overview.totalListings / overview.totalUsers).toFixed(1)}
                    />
                    <SummaryItem
                        label="New Users (Last 7 days)"
                        value={recent.newUsers}
                    />
                    <SummaryItem
                        label="New Listings (Last 7 days)"
                        value={recent.newListings}
                    />
                    <SummaryItem
                        label="User Growth Rate"
                        value={`${((recent.newUsers / overview.totalUsers) * 100).toFixed(1)}%`}
                    />
                </div>
            </div>

            {/* Export Section */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Data Export</h3>
                <p className="text-gray-600 text-sm mb-4">
                    Export platform data for external analysis and reporting
                </p>
                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={() => toast.info('User export feature coming soon!')}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                        <Download className="w-4 h-4" />
                        Export Users (CSV)
                    </button>
                    <button
                        onClick={() => toast.info('Listing export feature coming soon!')}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                        <Download className="w-4 h-4" />
                        Export Listings (CSV)
                    </button>
                    <button
                        onClick={() => window.print()}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                        <Download className="w-4 h-4" />
                        Print Report (PDF)
                    </button>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon, color, subtitle }) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-gray-600 text-sm font-medium">{title}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
                    {subtitle && <p className="text-gray-500 text-xs mt-1">{subtitle}</p>}
                </div>
                <div className={`${color} text-white p-3 rounded-lg`}>{icon}</div>
            </div>
        </div>
    );
}

function ActivityCard({ label, value, icon, color }) {
    return (
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
                <div className={color}>{icon}</div>
                <span className="text-gray-700 font-medium">{label}</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">{value}</span>
        </div>
    );
}

function StatItem({ label, value }) {
    return (
        <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">{label}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
    );
}

function SummaryItem({ label, value }) {
    return (
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-700">{label}</span>
            <span className="font-semibold text-gray-900">{value}</span>
        </div>
    );
}
