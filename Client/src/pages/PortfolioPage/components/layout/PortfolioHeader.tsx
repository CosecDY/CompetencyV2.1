import React from "react";
import {
  FaUser,
  FaEnvelope,
  FaCalendar,
  FaSync,
  FaExclamationTriangle,
  FaChartLine,
  FaGraduationCap,
} from "react-icons/fa";

interface PortfolioHeaderProps {
  userEmail: string;
  isDataStale?: boolean;
  loading?: boolean;
  onRefresh?: () => void;
  lastUpdated?: Date;
}

const PortfolioHeader: React.FC<PortfolioHeaderProps> = ({
  userEmail,
  isDataStale = false,
  loading = false,
  onRefresh,
  lastUpdated,
}) => {
  const formatThaiDate = (date: Date) => {
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const currentDate = lastUpdated
    ? formatThaiDate(lastUpdated)
    : formatThaiDate(new Date());

  return (
    <div className="bg-gradient-to-br from-slate-50 via-white to-slate-50 border border-slate-200 rounded-3xl shadow-lg overflow-hidden">
      {/* Background Pattern */}
      
      <div className="relative max-w-7xl mx-auto p-6 sm:p-8 lg:p-10">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-slate-700 to-slate-800 rounded-2xl shadow-lg mb-4">
            <FaGraduationCap className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light text-slate-800 mb-3 tracking-wide">
            พอร์ตโฟลิโอวิชาชีพ
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 font-light max-w-2xl mx-auto">
            รายงานการประเมินและพัฒนาความสามารถทางวิชาชีพ
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* User Information Card */}
          <div className="lg:col-span-2">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-slate-200 p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-start space-x-5">
                <div className="relative flex-shrink-0">
                  <div className="bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl p-4 shadow-sm border border-slate-300">
                    <FaUser className="h-6 w-6 text-slate-600" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white shadow-sm"></div>
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-medium text-slate-800 mb-4">
                    ข้อมูลผู้ใช้งาน
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="flex-shrink-0 w-8 h-8 bg-slate-200 rounded-lg flex items-center justify-center">
                        <FaEnvelope className="h-3 w-3 text-slate-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-500 mb-1">อีเมล</p>
                        <p className="text-sm font-medium text-slate-700 truncate">
                          {userEmail}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="flex-shrink-0 w-8 h-8 bg-slate-200 rounded-lg flex items-center justify-center">
                        <FaCalendar className="h-3 w-3 text-slate-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-500 mb-1">วันที่อัปเดต</p>
                        <p className="text-sm font-medium text-slate-700">
                          {currentDate}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Status and Actions Card */}
          <div className="space-y-4">
            {/* Assessment Status */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-slate-200 p-6 shadow-md">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <FaChartLine className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <h4 className="text-lg font-medium text-slate-800">สถานะการประเมิน</h4>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-xl p-4 border border-emerald-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-emerald-800">ระดับมืออาชีพ</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-emerald-700">ใช้งานอยู่</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Warning Banner */}
            {isDataStale && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 shadow-sm">
                <div className="flex items-center space-x-3">
                  <FaExclamationTriangle className="h-4 w-4 text-amber-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-amber-800">
                      มีข้อมูลใหม่พร้อมอัปเดต
                    </p>
                    <p className="text-xs text-amber-600 mt-1">
                      คลิกปุ่มรีเฟรชเพื่อดูข้อมูลล่าสุด
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Refresh Button */}
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={loading}
                className="w-full group flex items-center justify-center space-x-3 bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 disabled:from-slate-400 disabled:to-slate-500 text-white p-4 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl disabled:shadow-md hover:-translate-y-0.5"
              >
                <FaSync
                  className={`h-4 w-4 transition-transform duration-300 ${
                    loading ? "animate-spin" : "group-hover:rotate-180"
                  }`}
                />
                <span className="text-sm">
                  {loading ? "กำลังอัปเดต..." : "รีเฟรชข้อมูล"}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Bottom Decorative Element */}
        <div className="mt-8 pt-6 border-t border-slate-200">
          <div className="flex items-center justify-center space-x-6 text-slate-400">
            <div className="w-12 h-0.5 bg-slate-300 rounded"></div>
            <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
            <div className="w-12 h-0.5 bg-slate-300 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioHeader;
