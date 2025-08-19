import React, { useState, useEffect } from 'react';
import {
    TrendingUp,
    TrendingDown,
    Users,
    Package,
    Calendar,
    UserCheck,
    Clock,
    Eye,
    LogOut,
    Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface StatCardProps {
    title: string;
    value: string | number;
    subtitle: string;
    trend: number;
    icon: React.ReactNode;
    color: string;
}
const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, trend, icon, color }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            className={`relative overflow-hidden bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 ${isHovered ? 'bg-white/80' : ''}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <div className={`p-2 rounded-xl ${color} bg-opacity-10`}>
                            {icon}
                        </div>
                        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
                    </div>
                    <div className="mb-1">
                        <span className="text-3xl font-bold text-gray-900">{value.toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-gray-500">{subtitle}</p>
                </div>
            </div>

            <div className="flex items-center mt-4">
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${trend >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                    }`}>
                    {trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    {Math.abs(trend)}% vs last month
                </div>
            </div>

            {/* Animated background effect */}
            <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full ${color} bg-opacity-5 transition-all duration-300 ${isHovered ? 'scale-150 bg-opacity-10' : ''
                }`} />
        </div>
    );
};

const InsightCard: React.FC<{ text: string; growth?: string; type?: 'info' | 'tip' }> = ({
    text,
    growth,
    type = 'info'
}) => {
    return (
        <div className="bg-gradient-to-r from-blue-50/80 to-purple-50/80 backdrop-blur-sm rounded-xl p-4 border border-white/30 hover:shadow-md transition-all duration-300">
            <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                    {type === 'tip' ? (
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <Sparkles size={16} className="text-blue-600" />
                        </div>
                    ) : (
                        <TrendingUp size={16} className="text-green-600 mt-1" />
                    )}
                </div>
                <div className="flex-1">
                    <p className="text-gray-700 text-sm leading-relaxed">{text}</p>
                    {growth && (
                        <div className="inline-flex items-center gap-1 mt-2 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                            <TrendingUp size={10} />
                            {growth}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const DonorAnalytics
    : React.FC = () => {
        const [currentTime, setCurrentTime] = useState(new Date());
        const navigate = useNavigate();
        useEffect(() => {
            const timer = setInterval(() => setCurrentTime(new Date()), 1000);
            return () => clearInterval(timer);
        }, []);

        const stats = [
            {
                title: 'Total Donations',
                value: 156,
                subtitle: 'Items donated this month',
                trend: 12,
                icon: <Package size={20} className="text-green-600" />,
                color: 'bg-green-500'
            },
            {
                title: 'Meals Distributed',
                value: 2340,
                subtitle: 'People served through donations',
                trend: 8,
                icon: <Users size={20} className="text-orange-600" />,
                color: 'bg-orange-500'
            },
            {
                title: 'Events Participated',
                value: 24,
                subtitle: 'Food redistribution events',
                trend: 15,
                icon: <Calendar size={20} className="text-blue-600" />,
                color: 'bg-blue-500'
            },
            {
                title: 'Recipients Served',
                value: 89,
                subtitle: 'Unique recipients helped',
                trend: -3,
                icon: <UserCheck size={20} className="text-purple-600" />,
                color: 'bg-purple-500'
            }
        ];

        const handleListings = () => {
            navigate('/donor-dashboard');
        };

        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
                {/* Header */}
                <div className="bg-white/80 backdrop-blur-sm border-b border-white/20 sticky top-0 z-10">
                    <div className="max-w-7xl mx-auto px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    Donor Dashboard
                                </h1>
                                <p className="text-gray-600 text-sm mt-1">Welcome back! Track your donation impact</p>
                            </div>

                            <div className="flex items-center gap-4">
                                <button onClick={handleListings} className="flex items-center gap-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-xl transition-all duration-300 hover:scale-105">
                                    <Eye size={16} />
                                    View Listings
                                </button>
                                <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all duration-300">
                                    <LogOut size={16} />
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-6 py-8">
                    {/* Main Dashboard Section */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Analytics Dashboard</h2>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Clock size={16} />
                                Last updated: {currentTime.toLocaleTimeString()}
                            </div>
                        </div>

                        <p className="text-gray-600 mb-8">Track your donation impact and reach</p>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            {stats.map((stat, index) => (
                                <StatCard key={index} {...stat} />
                            ))}
                        </div>
                    </div>

                    {/* Insights Section */}
                    <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20 p-6 shadow-lg">
                        <div className="flex items-center gap-2 mb-6">
                            <TrendingUp size={20} className="text-green-600" />
                            <h3 className="text-lg font-semibold text-gray-900">Quick Insights</h3>
                            <div className="text-sm text-gray-500">Key trends from your recent activity</div>
                        </div>

                        <div className="space-y-4">
                            <InsightCard
                                text="Your donations helped feed 2,340 people this month"
                                growth="+14% growth"
                            />
                            <InsightCard
                                text="Peak donation time: 6-9 PM on weekdays"
                                type="tip"
                            />
                        </div>
                    </div>

                    {/* Real-time Data Badge */}
                    <div className="fixed bottom-6 right-6">
                        <div className="bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg border border-white/20 flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-sm font-medium text-gray-700">Real-time data</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

export default DonorAnalytics
    ;