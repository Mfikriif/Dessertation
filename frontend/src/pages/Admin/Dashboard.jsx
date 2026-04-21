import { TrendingUp, Banknote, Database } from "lucide-react";
import StatCard from "../../component/ui/StatCard";
import ActivityItem from "../../component/ui/ActivityItem";

const Dashboard = () => {
  // Chart Data Mock
  const chartData = [
    { day: "MON", val: 40, max: 50 },
    { day: "TUE", val: 65, max: 75 },
    { day: "WED", val: 55, max: 65 },
    { day: "THU", val: 85, max: 90 },
    { day: "FRI", val: 50, max: 65 },
    { day: "SAT", val: 95, max: 100 },
    { day: "SUN", val: 35, max: 55 },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in zoom-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
          Ringkasan Performa
          <br />
          Dessertation
        </h1>
        <p className="text-gray-500 mt-2">
          Aktifitas dan performa keseluruhan outlet
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Pendapatan"
          amount="RP 45.500.000"
          subtitle="Bulan ini"
          icon={<TrendingUp className="w-5 h-5" />}
        />
        <StatCard
          title="Total Pengeluaran"
          amount="RP 5.500.000"
          subtitle="Bulan ini"
          icon={<Banknote className="w-5 h-5" />}
        />
        <StatCard
          title="Stok Menipis"
          amount="5 Item"
          subtitle="Bahan Baku"
          icon={<Database className="w-5 h-5" />}
          alert={true}
        />
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart Area */}
        <div className="lg:col-span-2 bg-white rounded-xl p-8 shadow-sm border border-gray-100 flex flex-col">
          <h2 className="text-lg font-bold text-gray-900 mb-8">
            Performa Mingguan
          </h2>

          <div className="flex-1 flex items-end justify-between px-4 sm:px-8 pb-4 relative min-h-[300px]">
            {/* Horizontal Grid lines mock */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-10">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-full border-t border-gray-100"></div>
              ))}
              <div className="w-full border-t-2 border-gray-100"></div>
            </div>

            {/* Bars */}
            {chartData.map((data) => (
              <div
                key={data.day}
                className="flex flex-col items-center gap-4 z-10 w-full"
              >
                <div className="h-[220px] w-8 sm:w-12 md:w-16 flex flex-col justify-end group">
                  <div
                    className="w-full bg-gray-100 rounded-t-sm transition-all duration-300 group-hover:bg-gray-200"
                    style={{ height: `${data.max - data.val}%` }}
                  ></div>
                  <div
                    className="w-full bg-black rounded-b-sm transition-all duration-300 group-hover:bg-gray-800"
                    style={{ height: `${data.val}%` }}
                  ></div>
                </div>
                <span className="text-xs font-medium text-gray-400">
                  {data.day}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Area */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col">
          <h2 className="text-lg font-bold text-gray-900 mb-6">
            Aktivitas Rumah Produksi
          </h2>

          <div className="flex-1 overflow-y-auto pr-2">
            {[1, 2, 3, 4].map((item) => (
              <ActivityItem
                key={item}
                title="Memakai Coklat Batang 2kg"
                time="2 mins ago"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
