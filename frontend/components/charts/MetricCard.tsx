import React from 'react';
import { TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';

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
        <div className={`p-6 rounded-2xl shadow-sm border ${isWarning ? 'bg-red-50 border-red-200' : 'bg-white border-gray-100'} transition-all hover:shadow-md`}>
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-gray-500 font-medium text-sm">{title}</h3>
                {isWarning && (
                    <div className="bg-red-100 p-1.5 rounded-full" title="Dưới 50% mục tiêu">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                    </div>
                )}
            </div>
            
            <div className="flex items-baseline space-x-3">
                <h2 className={`text-3xl font-bold ${isWarning ? 'text-red-600' : 'text-gray-900'}`}>
                    {typeof value === 'number' ? new Intl.NumberFormat('vi-VN').format(value) : value}
                </h2>
            </div>
            
            {growthRate !== undefined && (
                <div className={`mt-4 flex items-center text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {isPositive ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                    <span>{Math.abs(growthRate)}% so với kỳ trước</span>
                </div>
            )}
        </div>
    );
};
