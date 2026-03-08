"use client";

import React, { useState } from 'react';

// Dựa vào Tailwind CSS
// Nhận props là onFilterChange để báo cho page cha mỗi khi người dùng đổi filter
export const GlobalFilter = ({ onFilterChange }: { onFilterChange: (filters: any) => void }) => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [department, setDepartment] = useState('All');

    const handleApplyFilter = () => {
        onFilterChange({
            startDate,
            endDate,
            department
        });
    };

    return (
        <div className="bg-white p-4 rounded-xl shadow-sm mb-6 flex flex-wrap gap-4 items-end">
            <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600 font-medium">Từ ngày:</label>
                <input 
                    type="date" 
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" 
                />
            </div>
            
            <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600 font-medium">Đến ngày:</label>
                <input 
                    type="date" 
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" 
                />
            </div>

            <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600 font-medium">Phòng ban:</label>
                <select 
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none min-w-[150px]"
                >
                    <option value="All">Tất cả phòng ban</option>
                    <option value="Sales">Sales</option>
                    <option value="Marketing">Marketing</option>
                    <option value="IT">IT</option>
                    <option value="HR">HR</option>
                </select>
            </div>

            <button 
                onClick={handleApplyFilter}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-5 py-2 rounded-lg transition-colors ml-auto"
            >
                Áp dụng bộ lọc
            </button>
        </div>
    );
};