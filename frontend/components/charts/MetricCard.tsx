import React from 'react';
import { TrendingUp, TrendingDown, AlertCircle, Activity } from 'lucide-react';

interface MetricCardProps {
    title: string;
    value: string | number;
    growthRate?: number; // % tăng trưởng
    isPositive?: boolean;
    target?: number; // Mục tiêu (để báo động đỏ nếu < 50%)
}

export const MetricCard: React.FC<MetricCardProps> = ({ title, value, growthRate, isPositive, target }) => {
    
    // Check cảnh báo: Giá trị < 50% target
    const isWarning = target && typeof value === 'number' && value < (target * 0.5);

    return (
        <div className={`group relative overflow-hidden p-6 rounded-3xl transition-all duration-500 ease-out hover:-translate-y-1 hover:shadow-2xl ${
            isWarning 
                ? 'bg-gradient-to-br from-red-50 via-white to-red-50/50 border border-red-100 shadow-red-100/50' 
                : 'bg-gradient-to-br from-white via-gray-50/80 to-white/90 border border-gray-100 shadow-gray-200/40'
        } shadow-lg backdrop-blur-xl`}>
            
            {/* Background Decorative Blob */}
            <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full blur-2xl opacity-40 transition-opacity duration-500 group-hover:opacity-60 ${
                isWarning ? 'bg-red-400' : 'bg-blue-400'
            }`} />

            <div className="relative z-10 flex justify-between items-start mb-6">
                <div className="flex items-center space-x-3">
                    <div className={`p-2.5 rounded-2xl ${
                        isWarning ? 'bg-red-100 text-red-600' : 'bg-blue-50 text-blue-600'
                    } shadow-sm`}>
                        {isWarning ? <AlertCircle className="w-5 h-5" /> : <Activity className="w-5 h-5" />}
                    </div>
                    <h3 className="text-gray-500 font-semibold tracking-wide text-sm uppercase">{title}</h3>
                </div>
            </div>
            
            <div className="relative z-10 flex flex-col justify-end min-h-[4rem]">
                <h2 className={`text-4xl font-extrabold tracking-tight ${isWarning ? 'text-red-600' : 'text-slate-800'}`}>
                    {typeof value === 'number' ? new Intl.NumberFormat('vi-VN').format(value) : value}
                </h2>
                
                {growthRate !== undefined && (
                    <div className="mt-4 flex items-center">
                        <div className={`flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-bold ${
                            isPositive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                        }`}>
                            {isPositive ? <TrendingUp className="w-3.5 h-3.5 mr-1" /> : <TrendingDown className="w-3.5 h-3.5 mr-1" />}
                            <span>{Math.abs(growthRate)}%</span>
                        </div>
                        <span className="ml-2 text-xs font-medium text-gray-400">so với tháng trước</span>
                    </div>
                )}
            </div>
            
            {/* Subtle bottom gradient glow on hover */}
            <div className={`absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r ${
                isWarning ? 'from-red-400 to-rose-500' : 'from-blue-400 to-indigo-500'
            } transform scale-x-0 origin-left transition-transform duration-500 ease-out group-hover:scale-x-100`} />
        </div>
    );
};
