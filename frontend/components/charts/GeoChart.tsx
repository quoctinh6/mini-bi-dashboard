import React, { useState, useMemo } from 'react';
import { BaseChart } from './BaseChart';
import * as echarts from 'echarts';
import { cn, formatCompactNumber } from '@/lib/utils';
import { Select } from '@/components/ui/Select';
import { MapPin, MoreHorizontal, CheckSquare, Square } from 'lucide-react';

// 1. Import file JSON tọa độ bản đồ Việt Nam
import vietnamGeoJson from './vn-all.geo.json';

// 2. Đăng ký bản đồ với ECharts
echarts.registerMap('vietnam', vietnamGeoJson as any);

const REGIONS = {
  'Toàn quốc': [],
  'Miền Bắc': [
    'Hà Nội', 'Hà Giang', 'Cao Bằng', 'Bắc Kạn', 'Tuyên Quang', 'Lào Cai', 'Điện Biên', 'Lai Châu', 'Sơn La', 'Yên Bái', 'Hòa Bình', 'Thái Nguyên', 'Lạng Sơn', 'Quảng Ninh', 'Bắc Giang', 'Phú Thọ', 'Vĩnh Phúc', 'Bắc Ninh', 'Hải Dương', 'Hải Phòng', 'Hưng Yên', 'Thái Bình', 'Hà Nam', 'Nam Định', 'Ninh Bình'
  ],
  'Miền Trung': [
    'Thanh Hóa', 'Nghệ An', 'Hà Tĩnh', 'Quảng Bình', 'Quảng Trị', 'Thừa Thiên Huế', 'Huế', 'Đà Nẵng', 'Quảng Nam', 'Quảng Ngãi', 'Bình Định', 'Phú Yên', 'Khánh Hòa', 'Ninh Thuận', 'Bình Thuận', 'Kon Tum', 'Gia Lai', 'Đắk Lắk', 'Đắk Nông', 'Lâm Đồng'
  ],
  'Miền Nam': [
    'Bình Phước', 'Tây Ninh', 'Bình Dương', 'Đồng Nai', 'Bà Rịa - Vũng Tàu', 'Bà Rịa-Vũng Tàu', 'Thành phố Hồ Chí Minh', 'TP. Hồ Chí Minh', 'Long An', 'Tiền Giang', 'Bến Tre', 'Trà Vinh', 'Vĩnh Long', 'Đồng Tháp', 'An Giang', 'Kiên Giang', 'Cần Thơ', 'Hậu Giang', 'Sóc Trăng', 'Bạc Liêu', 'Cà Mau'
  ]
};

// Flatten to get all unique provinces
const ALL_PROVINCES = [
  ...REGIONS['Miền Bắc'],
  ...REGIONS['Miền Trung'],
  ...REGIONS['Miền Nam']
];

interface GeoChartProps extends React.HTMLAttributes<HTMLDivElement> {
    data?: { label: string; value: number }[];
    title?: string;
    unit?: string;
}

export const GeoChart: React.FC<GeoChartProps> = ({ 
    data, 
    title = "Mật độ Doanh thu theo Tỉnh thành",
    unit = "₫",
    className,
    ...props
}) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeRegion, setActiveRegion] = useState<string>('Toàn quốc');
  const [selectedProvinces, setSelectedProvinces] = useState<Set<string>>(new Set(ALL_PROVINCES));

  // Determine which provinces to show in the dropdown based on `activeRegion`
  const provincesInRegion = activeRegion === 'Toàn quốc' ? ALL_PROVINCES : REGIONS[activeRegion as keyof typeof REGIONS];

  // Raw data mapping
  const rawChartData = data && data.length > 0 ? data.map(item => ({ name: item.label, value: item.value })) : [
      { name: 'Hà Nội', value: 8500 },
      { name: 'Thành phố Hồ Chí Minh', value: 12000 },
      { name: 'Đà Nẵng', value: 4200 },
      { name: 'Hải Phòng', value: 3100 },
      { name: 'Bình Dương', value: 5800 },
      { name: 'Đồng Nai', value: 4500 },
      { name: 'Cần Thơ', value: 2900 },
  ];
  
  const filteredChartData = rawChartData.filter(d => selectedProvinces.has(d.name) || selectedProvinces.has(d.name.replace('TP. ', 'Thành phố ')));

  const maxVal = Math.max(...filteredChartData.map(d => d.value), 1000);

  const option = useMemo(() => {
    return {
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        borderColor: '#334155',
        borderWidth: 1,
        textStyle: { color: '#f8fafc', fontSize: 12 },
        formatter: (params: any) => {
          if (!params.name) return '';
          
          const isSelected = selectedProvinces.has(params.name) || selectedProvinces.has(params.name.replace('Thành phố ', 'TP. '));
          if (!isSelected) {
             return `
              <div style="padding: 4px 8px;">
                <div style="font-weight: 600; color: #64748b; font-size: 11px; margin-bottom: 4px; text-transform: uppercase;">${params.name}</div>
                <div style="font-size: 13px; font-weight: 500; color: #94a3b8;">Không nằm trong bộ lọc</div>
              </div>
            `;
          }

          const val = params.value ? formatCompactNumber(params.value) : '0';
          return `
            <div style="padding: 4px 8px;">
              <div style="font-weight: 600; color: #94a3b8; font-size: 11px; margin-bottom: 4px; text-transform: uppercase;">${params.name}</div>
              <div style="font-size: 14px; font-weight: 700; color: #fff;">${val} ${unit}</div>
            </div>
          `;
        },
      },
      visualMap: {
        min: 0,
        max: maxVal,
        left: 'right',
        bottom: '5%',
        text: ['Cao', 'Thấp'],
        calculable: true,
        itemWidth: 15,
        itemHeight: 100,
        textStyle: { color: '#64748b', fontSize: 10 },
        inRange: {
          color: ['#1e1b4b', '#3730a3', '#4f46e5', '#818cf8', '#c084fc'], 
        },
      },
      series: [
        {
          name: 'Doanh thu',
          type: 'map',
          map: 'vietnam',
          roam: true,
          zoom: 1.1,
          label: {
              show: false
          },
          itemStyle: {
              areaColor: '#0f172a',
              borderColor: '#334155',
              borderWidth: 0.5
          },
          emphasis: {
              itemStyle: {
                  areaColor: '#6366f1',
                  borderColor: '#818cf8',
                  borderWidth: 1,
                  shadowBlur: 15,
                  shadowColor: 'rgba(99, 102, 241, 0.4)'
              },
              label: { show: false }
          },
          data: filteredChartData,
        },
      ],
    };
  }, [filteredChartData, maxVal, selectedProvinces, unit]);

  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const region = e.target.value;
    setActiveRegion(region);
    
    // Auto-select all provinces in that region
    if (region === 'Toàn quốc') {
      setSelectedProvinces(new Set(ALL_PROVINCES));
    } else {
      setSelectedProvinces(new Set(REGIONS[region as keyof typeof REGIONS]));
    }
  };

  const toggleProvince = (provinceName: string) => {
    const newSet = new Set(selectedProvinces);
    if (newSet.has(provinceName)) {
      newSet.delete(provinceName);
    } else {
      newSet.add(provinceName);
    }
    setSelectedProvinces(newSet);
  };

  return (
    <div className={cn("flex flex-col rounded-lg border border-slate-800 bg-slate-900/50 p-5 shadow-sm relative", className)} {...props}>
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-slate-500" />
                <h3 className="text-sm font-semibold text-slate-200">{title}</h3>
            </div>
            <button 
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors focus:outline-none"
            >
                <MoreHorizontal className="h-4 w-4" />
            </button>
        </div>

        {/* Settings Panel */}
        {isSettingsOpen && (
            <div className="absolute top-14 right-5 w-64 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden flex flex-col max-h-[300px]">
                <div className="p-3 border-b border-slate-700 bg-slate-800/80">
                    <h4 className="text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wide">Lọc Dữ Liệu</h4>
                    <Select 
                        value={activeRegion}
                        onChange={handleRegionChange}
                        className="h-8 text-xs w-full bg-slate-900 border-slate-700"
                    >
                        <option value="Toàn quốc">Toàn quốc</option>
                        <option value="Miền Bắc">Miền Bắc</option>
                        <option value="Miền Trung">Miền Trung</option>
                        <option value="Miền Nam">Miền Nam</option>
                    </Select>
                </div>
                
                <div className="p-2 overflow-y-auto flex-1 flex flex-col gap-1 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent">
                    {provincesInRegion.map(prov => (
                        <div 
                            key={prov} 
                            className="flex items-center justify-between px-2 py-1.5 hover:bg-slate-700/50 rounded cursor-pointer"
                            onClick={() => toggleProvince(prov)}
                        >
                            <span className={cn("text-xs transition-colors", selectedProvinces.has(prov) ? "text-slate-200" : "text-slate-500")}>
                                {prov}
                            </span>
                            {selectedProvinces.has(prov) ? (
                                <CheckSquare className="h-3.5 w-3.5 text-fuchsia-500" />
                            ) : (
                                <Square className="h-3.5 w-3.5 text-slate-600" />
                            )}
                        </div>
                    ))}
                    {provincesInRegion.length === 0 && (
                        <div className="text-xs text-slate-500 italic p-2 text-center">Không có dữ liệu tỉnh</div>
                    )}
                </div>
            </div>
        )}
        
        <div className="relative flex-1 min-h-[350px] w-full">
            <div className="absolute inset-0">
                <BaseChart option={option} height="100%" transparent />
            </div>
        </div>
    </div>
  );
};
