import React from 'react';
import {
    X,
    TrendingUp,
    TrendingDown,
    Calendar,
    Users,
    Package,
    Truck,
    MapPin,
    Clock,
    BarChart3,
    PieChart,
    Target,
    Award,
    Heart
} from 'lucide-react';

interface DetailedAnalyticsModalProps {
    isOpen: boolean;
    onClose: () => void;
    analyticsType: 'donations' | 'people-served' | 'active-listings' | 'pickup-requests' | null;
}

interface ChartDataPoint {
    label: string;
    value: number;
    trend?: number;
}

const DetailedAnalyticsModal: React.FC<DetailedAnalyticsModalProps> = ({
    isOpen,
    onClose,
    analyticsType
}) => {
    if (!isOpen || !analyticsType) return null;

    const getAnalyticsData = () => {
        switch (analyticsType) {
            case 'donations':
                return {
                    title: 'Total Donations Analytics',
                    icon: <Package className="w-6 h-6 text-blue-600" />,
                    color: 'from-blue-500 to-blue-600',
                    mainMetric: '156',
                    mainLabel: 'Total Donations',
                    trend: '+12%',
                    trendDirection: 'up',
                    chartData: [
                        { label: 'Week 1', value: 38, trend: 15 },
                        { label: 'Week 2', value: 42, trend: 10 },
                        { label: 'Week 3', value: 35, trend: -5 },
                        { label: 'Week 4', value: 41, trend: 8 }
                    ],
                    insights: [
                        'Peak donation day: Tuesday (28% of weekly donations)',
                        'Most popular food type: Fresh produce (45%)',
                        'Average donation size: 15-20 servings',
                        'Best performing location: Downtown Campus'
                    ],
                    breakdown: [
                        { category: 'Fresh Produce', count: 70, percentage: 45 },
                        { category: 'Prepared Meals', count: 46, percentage: 29 },
                        { category: 'Baked Goods', count: 31, percentage: 20 },
                        { category: 'Beverages', count: 9, percentage: 6 }
                    ]
                };
            case 'people-served':
                return {
                    title: 'People Served Analytics',
                    icon: <Users className="w-6 h-6 text-green-600" />,
                    color: 'from-green-500 to-green-600',
                    mainMetric: '2,340',
                    mainLabel: 'People Served',
                    trend: '+8%',
                    trendDirection: 'up',
                    chartData: [
                        { label: 'Week 1', value: 580, trend: 12 },
                        { label: 'Week 2', value: 620, trend: 8 },
                        { label: 'Week 3', value: 540, trend: -3 },
                        { label: 'Week 4', value: 600, trend: 15 }
                    ],
                    insights: [
                        'Average meals per person: 2.3',
                        'Return rate: 68% (people served multiple times)',
                        'Peak serving time: 6-8 PM',
                        'Most active pickup location: Student Center'
                    ],
                    breakdown: [
                        { category: 'Students', count: 1404, percentage: 60 },
                        { category: 'Families', count: 702, percentage: 30 },
                        { category: 'Seniors', count: 234, percentage: 10 }
                    ]
                };
            case 'active-listings':
                return {
                    title: 'Active Listings Analytics',
                    icon: <Calendar className="w-6 h-6 text-orange-600" />,
                    color: 'from-orange-500 to-orange-600',
                    mainMetric: '8',
                    mainLabel: 'Active Listings',
                    trend: '+25%',
                    trendDirection: 'up',
                    chartData: [
                        { label: 'Mon', value: 6, trend: 0 },
                        { label: 'Tue', value: 8, trend: 33 },
                        { label: 'Wed', value: 7, trend: -12 },
                        { label: 'Thu', value: 9, trend: 28 }
                    ],
                    insights: [
                        'Average listing duration: 4.2 hours',
                        'Average views per listing: 15.3',
                        'Success rate: 95% (picked up)',
                        '2 listings expiring in next 4 hours'
                    ],
                    breakdown: [
                        { category: 'Fresh Food', count: 5, percentage: 62 },
                        { category: 'Prepared Meals', count: 2, percentage: 25 },
                        { category: 'Event Surplus', count: 1, percentage: 13 }
                    ]
                };
            case 'pickup-requests':
                return {
                    title: 'Pickup Requests Analytics',
                    icon: <Truck className="w-6 h-6 text-purple-600" />,
                    color: 'from-purple-500 to-purple-600',
                    mainMetric: '23',
                    mainLabel: 'Pickup Requests',
                    trend: '+15%',
                    trendDirection: 'up',
                    chartData: [
                        { label: 'Week 1', value: 5, trend: 25 },
                        { label: 'Week 2', value: 7, trend: 40 },
                        { label: 'Week 3', value: 6, trend: -14 },
                        { label: 'Week 4', value: 5, trend: -16 }
                    ],
                    insights: [
                        'Average response time: 1.2 hours',
                        'Completion rate: 96%',
                        'Peak request day: Friday',
                        '5 new requests today'
                    ],
                    breakdown: [
                        { category: 'Same Day', count: 15, percentage: 65 },
                        { category: 'Next Day', count: 6, percentage: 26 },
                        { category: 'Scheduled', count: 2, percentage: 9 }
                    ]
                };
            default:
                return null;
        }
    };

    const data = getAnalyticsData();
    if (!data) return null;

    const maxValue = Math.max(...data.chartData.map(d => d.value));

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className={`bg-gradient-to-r ${data.color} p-6 text-white`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/20 rounded-xl">
                                {data.icon}
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">{data.title}</h2>
                                <p className="text-white/80 text-sm">Detailed insights and trends</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(95vh-120px)] sm:max-h-[calc(90vh-120px)]">
                    {/* Main Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                        <div className="col-span-1 md:col-span-2">
                            <div className="bg-gray-50/80 rounded-2xl p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900">Trend Analysis</h3>
                                    <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                                        data.trendDirection === 'up' 
                                            ? 'bg-green-100 text-green-700' 
                                            : 'bg-red-100 text-red-700'
                                    }`}>
                                        {data.trendDirection === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                        {data.trend} vs last month
                                    </div>
                                </div>
                                
                                {/* Chart */}
                                <div className="space-y-3">
                                    {data.chartData.map((point, index) => (
                                        <div key={index} className="flex items-center gap-4">
                                            <div className="w-16 text-sm font-medium text-gray-600">
                                                {point.label}
                                            </div>
                                            <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                                                <div 
                                                    className={`h-full bg-gradient-to-r ${data.color} transition-all duration-1000 ease-out`}
                                                    style={{ width: `${(point.value / maxValue) * 100}%` }}
                                                />
                                            </div>
                                            <div className="w-16 text-sm font-semibold text-gray-900 text-right">
                                                {point.value.toLocaleString()}
                                            </div>
                                            {point.trend !== undefined && (
                                                <div className={`w-16 text-xs ${
                                                    point.trend >= 0 ? 'text-green-600' : 'text-red-600'
                                                }`}>
                                                    {point.trend > 0 ? '+' : ''}{point.trend}%
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50/80 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
                            <div className="w-20 h-20 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center mb-4">
                                <Target className="w-10 h-10 text-gray-600" />
                            </div>
                            <div className="text-3xl font-bold text-gray-900 mb-2">{data.mainMetric}</div>
                            <div className="text-sm text-gray-600 mb-3">{data.mainLabel}</div>
                            <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                                data.trendDirection === 'up' 
                                    ? 'bg-green-100 text-green-700' 
                                    : 'bg-red-100 text-red-700'
                            }`}>
                                {data.trendDirection === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                {data.trend}
                            </div>
                        </div>
                    </div>

                    {/* Breakdown */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="bg-gray-50/80 rounded-2xl p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <PieChart className="w-5 h-5 text-gray-600" />
                                <h3 className="font-semibold text-gray-900">Breakdown</h3>
                            </div>
                            <div className="space-y-3">
                                {data.breakdown.map((item, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div 
                                                className={`w-3 h-3 rounded-full bg-gradient-to-r ${data.color}`}
                                                style={{ opacity: 1 - (index * 0.2) }}
                                            />
                                            <span className="text-sm font-medium text-gray-700">{item.category}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-semibold text-gray-900">{item.count}</span>
                                            <span className="text-xs text-gray-500">({item.percentage}%)</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-gray-50/80 rounded-2xl p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <BarChart3 className="w-5 h-5 text-gray-600" />
                                <h3 className="font-semibold text-gray-900">Key Insights</h3>
                            </div>
                            <div className="space-y-3">
                                {data.insights.map((insight, index) => (
                                    <div key={index} className="flex items-start gap-3">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                                        <p className="text-sm text-gray-700 leading-relaxed">{insight}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Impact Summary */}
                    <div className="bg-gradient-to-r from-blue-50/80 to-purple-50/80 rounded-2xl p-6 border border-blue-200/50">
                        <div className="flex items-center gap-2 mb-4">
                            <Heart className="w-5 h-5 text-blue-600" />
                            <h3 className="font-semibold text-gray-900">Impact Summary</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-blue-600 mb-1">98%</div>
                                <div className="text-sm text-gray-600">Success Rate</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-green-600 mb-1">4.8★</div>
                                <div className="text-sm text-gray-600">Average Rating</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-purple-600 mb-1">2.1h</div>
                                <div className="text-sm text-gray-600">Avg Response Time</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DetailedAnalyticsModal;
