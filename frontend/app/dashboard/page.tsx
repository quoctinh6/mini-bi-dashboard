"use client";

import React, { useState, useEffect, useRef } from 'react';
import GridLayout from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Download, Save } from 'lucide-react';

import { GlobalFilter } from '../../components/GlobalFilter';
import { MetricCard } from '../../components/charts/MetricCard';
import { MixedChart } from '../../components/charts/MixedChart';
import { PieChart } from '../../components/charts/PieChart';
import { GeoChart } from '../../components/charts/GeoChart';
import { analyticsServices } from '../../services/apiService';

// Default layout cho react-grid-layout
const defaultLayout = [
    { i: 'metric1', x: 0, y: 0, w: 3, h: 1 },
    { i: 'metric2', x: 3, y: 0, w: 3, h: 1 },
    { i: 'metric3', x: 6, y: 0, w: 3, h: 1 },
    { i: 'metric4', x: 9, y: 0, w: 3, h: 1 },
    { i: 'mixedChart', x: 0, y: 1, w: 8, h: 4 },
    { i: 'pieChart', x: 8, y: 1, w: 4, h: 4 },
    { i: 'geoChart', x: 0, y: 5, w: 12, h: 5 },
];

export default function DashboardPage() {
    const dashboardRef = useRef<HTMLDivElement>(null);
    const [layout, setLayout] = useState(defaultLayout);
    
    // States for data
    const [metrics, setMetrics] = useState<any>({});
    const [salesByDate, setSalesByDate] = useState([]);
    const [salesByDept, setSalesByDept] = useState([]);
    const [salesByProvince, setSalesByProvince] = useState([]);
    
    // Cross-filtering state: Khi click vào Pie chart (bộ phận), ta lọc lại MixedChart
    const [crossFilterDept, setCrossFilterDept] = useState<string | null>(null);

    // Global Filters
    const [globalFilters, setGlobalFilters] = useState({ startDate: '', endDate: '', department: 'All' });

    // Fetch dữ liệu mỗi khi globalFilter hoặc crossFilter thay đổi
    useEffect(() => {
        fetchData();
    }, [globalFilters, crossFilterDept]);

    const fetchData = async () => {
        try {
            // 1. Fetch Metrics
            const metricsRes = await analyticsServices.getMetrics();
            if (metricsRes.success) setMetrics(metricsRes.data);

            // Xây dựng params có bao gồm Cross-Filter
            const baseParams = {
                ...globalFilters,
                // Nếu đang cross filter bộ phận thì ghi đè filter chung
                department: crossFilterDept || globalFilters.department 
            };

            // 2. Fetch Sales by Date cho Mixed Chart (chịu ảnh hưởng bởi Cross Filter)
            const dateRes = await analyticsServices.getSales({ ...baseParams, groupBy: 'Date' });
            if (dateRes.success) setSalesByDate(dateRes.data);

            // 3. Fetch Data gốc cho Pie (không bị lọc ngươc bởi nó tự)
            const deptRes = await analyticsServices.getSales({ ...globalFilters, groupBy: 'Department' });
            if (deptRes.success) setSalesByDept(deptRes.data);

            // 4. Fetch Geo Data
            const geoRes = await analyticsServices.getSales({ ...baseParams, groupBy: 'Province' });
            if (geoRes.success) setSalesByProvince(geoRes.data);

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        }
    };

    const handleFilterChange = (newFilters: any) => {
        setGlobalFilters(newFilters);
        setCrossFilterDept(null); // Reset cross filter khi đổi global filter
    };

    const handlePieSliceClick = (departmentName: string) => {
        console.log("Cross filtering applied for department:", departmentName);
        // Drill-down hoặc Cross-filter: Click vào pie -> update global sales charts
        // Nếu click lại cái đang chọn thì bỏ filter
        setCrossFilterDept(prev => prev === departmentName ? null : departmentName);
    };

    const handleLayoutChange = (newLayout: any) => {
        setLayout(newLayout);
    };

    const saveTemplate = () => {
        // Gọi API lưu config layout vào DB
        console.log('Template saved:', layout);
        alert('Đã lưu cấu hình layout dashboard thành công!');
    };

    const exportToPDF = async () => {
        if (!dashboardRef.current) return;
        
        try {
            // Dùng html2canvas chụp lại node dashboard
            const canvas = await html2canvas(dashboardRef.current, { scale: 2 });
            const imgData = canvas.toDataURL('image/png');
            
            // Xây dựng jsPDF
            const pdf = new jsPDF('l', 'mm', 'a4'); // khổ ngang
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save('dashboard-report.pdf');

        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Lỗi xuất PDF!');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6 font-sans">
            <div className="max-w-7xl mx-auto">
                {/* Header Actions */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Mini BI Dashboard</h1>
                        <p className="text-gray-500 mt-1">Báo cáo tổng hợp doanh nghiệp</p>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={saveTemplate} className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition">
                            <Save className="w-4 h-4" /> Lưu Layout
                        </button>
                        <button onClick={exportToPDF} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition shadow-sm">
                            <Download className="w-4 h-4" /> Xuất PDF
                        </button>
                    </div>
                </div>

                {/* Global Filters */}
                <GlobalFilter onFilterChange={handleFilterChange} />

                {/* Dashboard Grid - Ref for PDF Export */}
                <div ref={dashboardRef} className="bg-gray-50 pb-10">
                    
                    {crossFilterDept && (
                        <div className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg mb-4 text-sm font-medium border border-indigo-100 max-w-lg">
                            Đang lọc chéo theo phòng ban: <span className="font-bold">{crossFilterDept}</span>
                            <button onClick={() => setCrossFilterDept(null)} className="ml-3 underline text-indigo-500 hover:text-indigo-900">Xóa</button>
                        </div>
                    )}

                    {/* Vùng chứa các tiện ích linh hoạt (React Grid Layout) */}
                    <div className="layout-container" style={{ width: '100%', overflowX: 'hidden' }}>
                        <GridLayout
                            className="layout"
                            layout={layout}
                            cols={12}
                            rowHeight={100}
                            width={1200} // Custom cho demo width
                            onLayoutChange={handleLayoutChange}
                            isDraggable={true}
                            isResizable={true}
                            margin={[20, 20]} // Khoảng cách giữa các widgets
                        >
                            {/* 4 Thẻ chỉ số */}
                            <div key="metric1" className="bg-transparent"><MetricCard title="Tổng Doanh Thu" value={metrics.totalRevenue || 0} growthRate={metrics.growthRate} isPositive={metrics.isPositive} target={metrics.target}/></div>
                            <div key="metric2" className="bg-transparent"><MetricCard title="Đơn Hàng Mới" value={2145} growthRate={12.5} isPositive={true}/></div>
                            <div key="metric3" className="bg-transparent"><MetricCard title="Khách Hàng Kích Hoạt" value={842} growthRate={4.2} isPositive={false}/></div>
                            <div key="metric4" className="bg-transparent"><MetricCard title="Lợi Nhuận Ròng" value={"34%"} /></div>

                            {/* Mixed Chart: Bar + Line */}
                            <div key="mixedChart" className="bg-transparent h-full">
                                <MixedChart data={salesByDate} title="Thay đổi doanh thu theo thời gian" color="#6366f1" />
                            </div>

                            {/* Pie Chart cho Cross-Filtering */}
                            <div key="pieChart" className="bg-transparent h-full">
                                <PieChart data={salesByDept} title="Tỷ trọng Phòng Ban" onSliceClick={handlePieSliceClick} />
                            </div>

                            {/* Geo Chart VN Heatmap */}
                            <div key="geoChart" className="bg-transparent h-full">
                                <GeoChart data={salesByProvince} />
                            </div>
                        </GridLayout>
                    </div>
                </div>
            </div>
        </div>
    );
}
