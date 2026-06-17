import { useState, useEffect } from 'react';
import Layout from '../../components/Layout/Layout';
import {
  Newspaper,
  Calendar,
  Clock,
  Users,
  FileText,
  Wallet,
  TrendingUp,
  Download,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import api from '../../utils/api';
import type { DailyReport } from '../../../shared/types';

export default function PrincipalDaily() {
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<DailyReport | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await api.get<any>('/reports/daily?days=7');
      if (response.success && response.reports.length > 0) {
        setReports(response.reports);
        setSelectedReport(response.reports[0]);
      }
    } catch (error) {
      console.error('Fetch daily reports error:', error);
    }
  };

  const handlePrev = () => {
    if (currentIndex < reports.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      setSelectedReport(reports[newIndex]);
    }
  };

  const handleNext = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      setSelectedReport(reports[newIndex]);
    }
  };

  const handleSelectReport = (index: number) => {
    setCurrentIndex(index);
    setSelectedReport(reports[index]);
  };

  return (
    <Layout role="principal" title="运营日报">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handlePrev}
              disabled={currentIndex >= reports.length - 1}
              className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5 text-slate-600" />
            </button>
            <div className="text-center">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Newspaper className="w-6 h-6 text-indigo-600" />
                {selectedReport?.reportDate || '加载中...'} 运营日报
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                每日自动生成，推送至校长端
              </p>
            </div>
            <button
              onClick={handleNext}
              disabled={currentIndex <= 0}
              className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5 text-slate-600" />
            </button>
          </div>

          <button className="px-4 py-2 bg-white text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 flex items-center gap-2">
            <Download className="w-4 h-4" />
            下载日报
          </button>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-white/20 rounded-lg">
                <Clock className="w-5 h-5" />
              </div>
              <span className="text-sm opacity-90">培训总学时</span>
            </div>
            <p className="text-3xl font-bold">
              {selectedReport?.totalTrainingHours || 0}
              <span className="text-lg font-normal opacity-80 ml-1">h</span>
            </p>
            <p className="text-xs opacity-70 mt-2">较前一日 +5.2h</p>
          </div>

          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-5 text-white">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-white/20 rounded-lg">
                <FileText className="w-5 h-5" />
              </div>
              <span className="text-sm opacity-90">考试预约人数</span>
            </div>
            <p className="text-3xl font-bold">
              {selectedReport?.examAppointmentCount || 0}
              <span className="text-lg font-normal opacity-80 ml-1">人</span>
            </p>
            <p className="text-xs opacity-70 mt-2">较前一日 +3人</p>
          </div>

          <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-5 text-white">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-white/20 rounded-lg">
                <Wallet className="w-5 h-5" />
              </div>
              <span className="text-sm opacity-90">退费申请</span>
            </div>
            <p className="text-3xl font-bold">
              {selectedReport?.refundRequestCount || 0}
              <span className="text-lg font-normal opacity-80 ml-1">笔</span>
            </p>
            <p className="text-xs opacity-70 mt-2">
              金额 ¥{selectedReport?.refundAmount?.toLocaleString() || 0}
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-5 text-white">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-white/20 rounded-lg">
                <Users className="w-5 h-5" />
              </div>
              <span className="text-sm opacity-90">新增学员</span>
            </div>
            <p className="text-3xl font-bold">
              {selectedReport?.newStudents || 0}
              <span className="text-lg font-normal opacity-80 ml-1">人</span>
            </p>
            <p className="text-xs opacity-70 mt-2">较前一日 +2人</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 bg-white rounded-xl border border-slate-100 p-6">
            <h3 className="font-semibold text-slate-800 text-lg mb-6">
              📊 数据详情
            </h3>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-blue-600" />
                    </div>
                    <span className="text-slate-700">考试通过率</span>
                  </div>
                  <span className="text-xl font-bold text-emerald-600">
                    {selectedReport?.passRate || 0}%
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                      <Wallet className="w-5 h-5 text-emerald-600" />
                    </div>
                    <span className="text-slate-700">当日营收</span>
                  </div>
                  <span className="text-xl font-bold text-emerald-600">
                    ¥{selectedReport?.revenue?.toLocaleString() || 0}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-100 rounded-lg">
                      <FileText className="w-5 h-5 text-amber-600" />
                    </div>
                    <span className="text-slate-700">退费金额</span>
                  </div>
                  <span className="text-xl font-bold text-rose-600">
                    ¥{selectedReport?.refundAmount?.toLocaleString() || 0}
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Users className="w-5 h-5 text-purple-600" />
                    </div>
                    <span className="text-slate-700">净增学员</span>
                  </div>
                  <span className="text-xl font-bold text-purple-600">
                    +{selectedReport?.newStudents || 0}人
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">📌 今日重点</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• 培训学时稳定增长，建议继续保持</li>
                <li>• 科目二通过率较低，建议加强培训</li>
                <li>• 退费申请较前日有所增加，需关注</li>
                <li>• 新增学员数达标，本周目标完成度良好</li>
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-100 p-5">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600" />
              近7天日报
            </h3>

            <div className="space-y-2">
              {reports.map((report, index) => (
                <div
                  key={report.id}
                  onClick={() => handleSelectReport(index)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    currentIndex === index
                      ? 'bg-indigo-50 border border-indigo-200'
                      : 'hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`font-medium ${
                        currentIndex === index
                          ? 'text-indigo-700'
                          : 'text-slate-700'
                      }`}
                    >
                      {report.reportDate}
                    </span>
                    {index === 0 && (
                      <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-600 rounded">
                        最新
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="text-slate-500">
                      培训：<span className="text-slate-700">{report.totalTrainingHours}h</span>
                    </div>
                    <div className="text-slate-500">
                      考试：<span className="text-slate-700">{report.examAppointmentCount}人</span>
                    </div>
                    <div className="text-slate-500">
                      退费：<span className="text-slate-700">{report.refundRequestCount}笔</span>
                    </div>
                    <div className="text-slate-500">
                      新增：<span className="text-slate-700">{report.newStudents}人</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
