import { useState } from 'react';
import Layout from '../../components/Layout/Layout';
import { QrCode, Scan, Clock, User, CheckCircle } from 'lucide-react';
import { useAuthStore } from '../../store/useStore';
import api from '../../utils/api';

export default function CoachSignIn() {
  const { coach, user } = useAuthStore();
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<null | {
    success: boolean;
    studentName: string;
    subject: string;
    time: string;
  }>(null);
  const [studentCode, setStudentCode] = useState('');

  const handleScan = () => {
    setIsScanning(true);
    setScanResult(null);

    setTimeout(() => {
      setIsScanning(false);
      setScanResult({
        success: true,
        studentName: '张明',
        subject: '科目二',
        time: new Date().toLocaleTimeString('zh-CN', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      });
    }, 2000);
  };

  const handleManualSignIn = async () => {
    if (!studentCode.trim()) return;

    try {
      const response = await api.post<any>('/training/signin', {
        coachId: coach?.id,
        studentId: 'student-1',
        subject: 'subject-2',
        subjectName: '科目二',
        hours: 2,
      });

      if (response.success) {
        setScanResult({
          success: true,
          studentName: '张明',
          subject: '科目二',
          time: new Date().toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit',
          }),
        });
      }
    } catch (error) {
      console.error('Sign in error:', error);
    }
  };

  return (
    <Layout role="coach" title="扫码签到">
      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-xl border border-slate-100 p-8 text-center">
          <div className="mb-8">
            <div
              className={`w-48 h-48 mx-auto border-4 border-dashed rounded-2xl flex items-center justify-center relative ${
                isScanning
                  ? 'border-blue-500 bg-blue-50'
                  : scanResult
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-slate-200 bg-slate-50'
              }`}
            >
              {isScanning ? (
                <div className="text-center">
                  <Scan className="w-12 h-12 text-blue-500 mx-auto animate-pulse" />
                  <p className="text-sm text-blue-600 mt-2">扫描中...</p>
                </div>
              ) : scanResult ? (
                <div className="text-center">
                  <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
                  <p className="text-sm text-emerald-600 mt-2">签到成功</p>
                </div>
              ) : (
                <QrCode
                  className={`w-20 h-20 ${
                    isScanning ? 'text-blue-400' : 'text-slate-300'
                  }`}
                />
              )}

              {isScanning && (
                <div className="absolute left-2 right-2 top-1/2 h-0.5 bg-blue-500 animate-scan" />
              )}
            </div>
          </div>

          {scanResult && (
            <div className="mb-6 p-4 bg-emerald-50 rounded-lg text-left">
              <h4 className="font-medium text-emerald-800 mb-3">签到信息</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-emerald-600" />
                  <span className="text-slate-600">学员：</span>
                  <span className="text-slate-800 font-medium">
                    {scanResult.studentName}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-emerald-600" />
                  <span className="text-slate-600">科目：</span>
                  <span className="text-slate-800 font-medium">
                    {scanResult.subject}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  <span className="text-slate-600">签到时间：</span>
                  <span className="text-slate-800 font-medium">
                    {scanResult.time}
                  </span>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={handleScan}
            disabled={isScanning}
            className="w-full py-4 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
          >
            <Scan className="w-6 h-6" />
            {isScanning ? '扫描中...' : scanResult ? '再次扫码' : '扫描学员二维码'}
          </button>

          <div className="mt-6 pt-6 border-t border-slate-100">
            <p className="text-sm text-slate-500 mb-3">手动输入学员编号签到</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={studentCode}
                onChange={(e) => setStudentCode(e.target.value)}
                placeholder="请输入学员编号"
                className="flex-1 px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleManualSignIn}
                className="px-6 py-3 bg-slate-800 text-white rounded-lg hover:bg-slate-900"
              >
                签到
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-5">
          <h4 className="font-medium text-blue-800 mb-2">扫码签到说明</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• 请学员出示培训二维码进行扫码签到</li>
            <li>• 系统自动记录培训开始时间</li>
            <li>• 培训结束后请再次扫码签退</li>
            <li>• 签到后系统自动计算学时</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
}
