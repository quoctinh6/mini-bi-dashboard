"use client";
import * as React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { DashboardGrid, WidgetConfig, WidgetRegistry } from './DashboardGrid';
import { KPICard } from '@/components/data/KPICard';
import { MixedChart } from '@/components/charts/MixedChart';
import { DonutChart } from '@/components/charts/DonutChart';
import { GaugeChart } from '@/components/charts/GaugeChart';
import { GeoChart } from '@/components/charts/GeoChart';
import { DataTable } from '@/components/data/DataTable';
import { DataManagementLayout } from './DataManagementLayout';
import { PermissionsSettings } from './PermissionsSettings';
import { useAuth } from '@/lib/AuthContext';
import { dashboardServices, settingsServices } from '@/services/apiService';
import { cn, formatCompactNumber } from '@/lib/utils';
import { AlertTriangle, Loader2, Filter, Calendar, X, ChevronDown, FileDown, ImageIcon } from 'lucide-react';
import { masterDataServices } from '@/services/apiService';
import html2canvas from 'html2canvas';

// ════════════════════════════════════════════════════
// Widget Registry
// ════════════════════════════════════════════════════
const widgetRegistry: WidgetRegistry = {
  KPICard,
  MixedChart,
  DonutChart,
  GaugeChart,
  GeoChart,
  DataTable,
};

// ════════════════════════════════════════════════════
// DashboardExample
// ════════════════════════════════════════════════════
export function DashboardExample({ hideSidebar }: { hideSidebar?: boolean }) {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = React.useState('dashboard');
  const [widgets, setWidgets] = React.useState<WidgetConfig[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isExporting, setIsExporting] = React.useState(false);
  const dashboardRef = React.useRef<HTMLDivElement>(null);
  
  // ── Settings State ──
  const [testEmail, setTestEmail] = React.useState('');
  const [isSendingEmail, setIsSendingEmail] = React.useState(false);
  
  // ── Filters & Master Data ──
  const [regions, setRegions] = React.useState<{ id: number; name: string; code: string }[]>([]);
  const [categories, setCategories] = React.useState<{ id: number; name: string; code: string }[]>([]);
  const [filters, setFilters] = React.useState({
    regionId: '',
    period: '2025',
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    categoryId: ''
  });
  const [isFilterOpen, setIsFilterOpen] = React.useState(false);
  const [lastUpdated, setLastUpdated] = React.useState('');

  // Set initial time on client to avoid hydration mismatch
  React.useEffect(() => {
    setLastUpdated(new Date().toLocaleTimeString('vi-VN'));
  }, []);

  // Fetch Master Data
  React.useEffect(() => {
    Promise.all([
        masterDataServices.getRegions(),
        masterDataServices.getCategories()
    ]).then(([regRes, catRes]) => {
        setRegions(regRes.data || []);
        setCategories(catRes.data || []);
    }).catch(err => console.error("Failed to load master data", err));
  }, []);

  // Fetch real aggregated data from API
  const fetchData = React.useCallback(async () => {
    try {
      setIsLoading(true);
      
      const response = await dashboardServices.getOverview({
        regionId: filters.regionId || undefined,
        categoryId: filters.categoryId || undefined,
        startDate: filters.startDate,
        endDate: filters.endDate
      });
      
      if (response.success) {
        const { kpi, charts } = response.data;

        const apiWidgets: WidgetConfig[] = [
          {
            i: 'kpi-revenue', x: 0, y: 0, w: 2, h: 1,
            component: 'KPICard',
            props: { title: 'Tổng Doanh Thu', value: kpi.totalRevenue, unit: '₫', trend: kpi.growthRate, trendDirection: kpi.growthRate >= 0 ? 'up' : 'down' },
          },
          {
            i: 'kpi-cost', x: 2, y: 0, w: 2, h: 1,
            component: 'KPICard',
            props: { title: 'Tổng chi phí', value: kpi.totalCost, unit: '₫', trend: 0, trendDirection: 'neutral' },
          },
          {
            i: 'kpi-profit', x: 4, y: 0, w: 2, h: 1,
            component: 'KPICard',
            props: { title: 'Lợi nhuận ròng', value: kpi.totalProfit, unit: '₫', trend: 0, trendDirection: 'neutral' },
          },
          {
            i: 'kpi-orders', x: 6, y: 0, w: 2, h: 1,
            component: 'KPICard',
            props: { title: 'Tổng số đơn', value: kpi.totalOrders, trend: 0, trendDirection: 'neutral' },
          },
          {
            i: 'mixed-chart', x: 0, y: 1, w: 6, h: 3,
            component: 'MixedChart',
            props: { 
              data: charts.revenueByMonth.map((d: any) => ({ month: d.month, actual: d.revenue, target: d.revenue * 0.9 })), 
              title: 'Doanh thu theo tháng', 
              totalValue: kpi.totalRevenue,
              unit: '₫', 
              trend: kpi.growthRate 
            },
          },
          {
            i: 'donut-chart', x: 6, y: 1, w: 2, h: 3,
            component: 'DonutChart',
            props: { 
              data: charts.revenueByCategory.map((d: any) => ({ label: d.label, value: d.value, categoryId: d.categoryId })),
              title: 'Cơ cấu ngành hàng', 
              totalValue: kpi.totalRevenue,
              unit: '₫', 
              size: 130, 
              top: 3,
              selectedLabel: filters.categoryId ? categories.find(c => c.id.toString() === filters.categoryId)?.name : null,
              onSegmentSelect: (label: string | null) => {
                  const cat = charts.revenueByCategory.find((d: any) => d.label === label);
                  setFilters(prev => ({ ...prev, categoryId: cat ? cat.categoryId.toString() : '' }));
              }
            },
          },
          {
            i: 'gauge-chart', x: 0, y: 4, w: 4, h: 3,
            component: 'GaugeChart',
            props: { 
              data: charts.revenueByRegion.map((d: any) => ({ label: d.label, value: d.revenue, color: d.code === 'NORTH' ? '#d946ef' : d.code === 'SOUTH' ? '#3b82f6' : '#0ea5e9' })),
              title: 'Phân bổ theo Miền', 
              totalValue: kpi.totalRevenue,
              unit: '₫'
            },
          },
          {
            i: 'geo-chart', x: 4, y: 4, w: 4, h: 3,
            component: 'GeoChart',
            props: { 
              title: 'Mật độ Doanh thu theo Tỉnh thành',
              data: charts.revenueByProvince.map((d: any) => ({
                label: d.label,
                value: d.value,
              })),
            },
          },
        ];

        setWidgets(apiWidgets);
        setLastUpdated(new Date().toLocaleTimeString('vi-VN'));
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data', error);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);


  const handleSendTestEmail = async () => {
    if (!testEmail) return;
    try {
      setIsSendingEmail(true);
      const res = await settingsServices.testEmail({ email: testEmail });
      if (res.success) {
        alert(res.message);
      } else {
        alert('Lỗi: ' + res.message);
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Có lỗi khi gửi email.');
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleExportImage = () => {
    if (!dashboardRef.current) return;
    
    setIsExporting(true);
    
    // 1. Áp dụng cách B: Thêm độ trễ 1000ms để đảm bảo ECharts render xong animation
    setTimeout(async () => {
        try {
          const element = dashboardRef.current;
          if (!element) return;

          // 2. Chụp ảnh lấy đúng thẻ bao DashboardGrid (không dùng onclone hay DOM hack phức tạp)
          const canvas = await html2canvas(element, {
            scale: 2, // Tăng độ nét
            useCORS: true, 
            backgroundColor: '#0f121b',
            logging: true, // Bật lên để xem log ở trình duyệt nếu có lỗi
            
            // 3. Bắt buộc khai báo width/height của Scroll để thư viện không cắt xén Grid Position Absolute
            width: element.scrollWidth, 
            height: element.scrollHeight,
            windowWidth: element.scrollWidth,
            windowHeight: element.scrollHeight,
            
            // Fix lỗi nếu người dùng đang cuộn trang
            scrollX: 0,
            scrollY: -window.scrollY,
          });

          // 4. Download ảnh
          const imgData = canvas.toDataURL('image/png');
          const link = document.createElement('a');
          link.href = imgData;
          link.download = `Dashboard_Report_${new Date().toISOString().split('T')[0]}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
        } catch (error) {
          console.error('Failed to export Image', error);
          alert('Có lỗi khi xuất Ảnh. Vui lòng mở console để xem log (F12).');
        } finally {
          setIsExporting(false);
        }
    }, 1000);
  };


  return (
    <div className="flex h-screen w-full bg-[#0f121b] text-slate-200 overflow-hidden font-sans">
      {!hideSidebar && (
        <Sidebar 
          className="hidden md:flex shrink-0 z-10" 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
        />
      )}
      
      {activeTab === 'dashboard' && (
        <div className="flex-1 flex flex-col overflow-y-auto w-full">
          <div className="px-8 pt-4 flex flex-col lg:flex-row lg:items-center justify-between border-b border-slate-800/50 pb-4 gap-4">
            <Header 
              title="Tổng quan Doanh nghiệp" 
              subtitle={lastUpdated ? `Cập nhật lúc: ${lastUpdated}` : 'Đang đồng bộ dữ liệu...'} 
              className="p-0 w-auto" 
            />
            
            <div className="flex items-center gap-3 bg-slate-900/40 p-1.5 rounded-xl border border-slate-800/60">
              


              <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={cn(
                    "p-2 hover:bg-slate-800 rounded-lg transition-all active:scale-95 flex items-center gap-2",
                    isFilterOpen || filters.categoryId || filters.regionId !== '' ? "text-fuchsia-400 bg-fuchsia-500/10" : "text-slate-400"
                )}
                title="Bộ lọc nâng cao"
              >
                <Filter className="h-4 w-4" />
                {(filters.categoryId || filters.regionId) && (
                    <span className="w-2 h-2 rounded-full bg-fuchsia-500 absolute top-2 right-12 animate-pulse" />
                )}
              </button>

            

              <button 
                onClick={fetchData}
                className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-fuchsia-400 transition-all active:scale-95"
                title="Làm mới dữ liệu"
              >
                <Loader2 className={cn("h-4 w-4", isLoading && "animate-spin")} />
              </button>
            </div>

            {/* Floating Advanced Filter Panel */}
            {isFilterOpen && (
                <div className="absolute top-20 right-8 z-[100] w-80 bg-[#151b36] border border-slate-700 rounded-2xl shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex items-center justify-between mb-6">
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                            <Filter className="h-3.5 w-3.5 text-fuchsia-400" />
                            Bộ lọc nâng cao
                        </h4>
                        <button onClick={() => setIsFilterOpen(false)} className="p-1 hover:bg-slate-700/50 rounded-md text-slate-500 transition-colors">
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="space-y-5">
                        <div>
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">Khoảng thời gian</label>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1">
                                    <span className="text-[10px] text-slate-400">Từ ngày</span>
                                    <input 
                                        type="date" 
                                        className="w-full bg-[#0A1128] border border-slate-700 rounded-lg px-2 py-2 text-xs text-white outline-none focus:border-fuchsia-500"
                                        value={filters.startDate}
                                        onChange={(e) => setFilters(f => ({ ...f, startDate: e.target.value }))}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[10px] text-slate-400">Đến ngày</span>
                                    <input 
                                        type="date" 
                                        className="w-full bg-[#0A1128] border border-slate-700 rounded-lg px-2 py-2 text-xs text-white outline-none focus:border-fuchsia-500"
                                        value={filters.endDate}
                                        onChange={(e) => setFilters(f => ({ ...f, endDate: e.target.value }))}
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">Khu vực</label>
                            <select 
                                value={filters.regionId}
                                onChange={(e) => setFilters(f => ({ ...f, regionId: e.target.value }))}
                                className="w-full bg-[#0A1128] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-fuchsia-500"
                            >
                                <option value="">Tất cả khu vực</option>
                                {regions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">Ngành hàng</label>
                            <select 
                                value={filters.categoryId}
                                onChange={(e) => setFilters(f => ({ ...f, categoryId: e.target.value }))}
                                className="w-full bg-[#0A1128] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-fuchsia-500"
                            >
                                <option value="">Tất cả ngành hàng</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="mt-8 flex items-center gap-3">
                        <button 
                            onClick={() => setFilters({ regionId: '', period: '2025', startDate: '2025-01-01', endDate: '2025-12-31', categoryId: '' })}
                            className="flex-1 px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 rounded-lg transition-colors border border-slate-700"
                        >
                            Mặc định
                        </button>
                        <button 
                            onClick={() => { fetchData(); setIsFilterOpen(false); }}
                            className="flex-1 px-4 py-2 text-xs font-bold text-white bg-fuchsia-600 hover:bg-fuchsia-500 rounded-lg transition-all shadow-lg shadow-fuchsia-500/20"
                        >
                            Áp dụng
                        </button>
                    </div>
                </div>
            )}
          </div>
          <main 
            id="pdf-download-target"
            ref={dashboardRef}
            className="flex-1 p-8 pt-6 pb-12 mx-auto w-full" 
            style={{ maxWidth: 1100 }}
          >
            {isLoading ? (
              <div className="flex h-64 w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-fuchsia-500" />
                <span className="ml-3 text-slate-400">Đang tải dữ liệu doanh nghiệp...</span>
              </div>
            ) : (
              <DashboardGrid 
                widgets={widgets} 
                registry={widgetRegistry} 
              />
            )}
          </main>
        </div>
      )}

      {activeTab === 'data_entry' && (
         <div className="flex-1 w-full h-full relative z-0 bg-[#0A1128]">
           <DataManagementLayout hideSidebar={true} />
         </div>
      )}

      {activeTab === 'permissions' && (
         <div className="flex-1 w-full h-full relative z-0 bg-[#0A1128] overflow-hidden">
           <PermissionsSettings />
         </div>
      )}

      {activeTab === 'settings' && (
         <div className="flex-1 flex flex-col items-start justify-start p-10 bg-[#0A1128] text-slate-200">
           <div className="mb-8">
             <h1 className="text-3xl font-semibold text-white tracking-tight">Cài đặt</h1>
             <p className="text-sm text-slate-400 mt-2">Quản lý các cấu hình chung và định dạng của hệ thống.</p>
           </div>
           
           <div className="w-full max-w-3xl bg-[#0D1530] border border-slate-800/80 rounded-xl p-8 shadow-sm">
              <h2 className="text-lg font-medium text-slate-100 mb-6">Cấu hình chung</h2>
              
              <div className="flex items-center justify-between py-5 border-b border-slate-800/80 last:border-0">
                 <div className="pr-10">
                    <div className="font-medium text-slate-200">Đơn vị tiền tệ mặc định</div>
                    <div className="text-[13px] text-slate-400 mt-1">Chọn đơn vị tiền tệ sẽ được sử dụng để hiển thị trên tất cả các biểu đồ và báo cáo.</div>
                 </div>
                 <select className="h-10 w-48 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-[14px] text-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer">
                    <option value="usd">USD ($)</option>
                    <option value="vnd">VND (₫)</option>
                    <option value="eur">EUR (€)</option>
                 </select>
              </div>
              
              <div className="flex items-center justify-between py-5 border-b border-slate-800/80 last:border-0">
                 <div className="pr-10">
                    <div className="font-medium text-slate-200">Kiểm tra Gửi Email Báo cáo</div>
                    <div className="text-[13px] text-slate-400 mt-1">Gửi một email test để kiểm tra cấu hình SMTP của hệ thống.</div>
                 </div>
                 <div className="flex items-center gap-3">
                    <input 
                      type="email"
                      value={testEmail}
                      onChange={(e) => setTestEmail(e.target.value)}
                      placeholder="Nhập email nhận báo cáo..."
                      className="w-64 h-10 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-[14px] text-slate-200 focus:outline-none focus:ring-1 focus:ring-fuchsia-500"
                    />
                    <button 
                      onClick={handleSendTestEmail}
                      disabled={!testEmail || isSendingEmail}
                      className="h-10 px-5 bg-fuchsia-600 hover:bg-fuchsia-500 rounded-lg font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[120px]"
                    >
                      {isSendingEmail ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Gửi Test'}
                    </button>
                 </div>
              </div>
              
              <div className="flex flex-col items-center justify-center py-12 mt-8 border border-dashed border-slate-700/60 rounded-xl bg-slate-800/10">
                 <div className="text-slate-500 text-sm italic font-light">Các tuỳ chọn cài đặt khác sẽ được cập nhật trong tương lai.</div>
               </div>
           </div>
         </div>
      )}
    </div>
  );
}
