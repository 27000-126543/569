import { useState, useEffect } from 'react';
import Layout from '../../components/Layout/Layout';
import {
  QrCode,
  Scan,
  Clock,
  User,
  CheckCircle,
  Play,
  Square,
  ChevronDown,
  BookOpen,
  RefreshCw,
} from 'lucide-react';
import { useAuthStore } from '../../store/useStore';
import api from '../../utils/api';
import type { TrainingRecord, Student } from '../../../shared/types';

export default function CoachSignIn() {
  const { coach, user } = useAuthStore();
  const [mode, setMode] = useState<'scan' | 'manual'>('scan');
  const [isScanning, setIsScanning] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<TrainingRecord | null>(null);
  const [todayRecords, setTodayRecords] = useState<TrainingRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [studentCode, setStudentCode] = useState('');

  useEffect(() => {
    if (coach) {
      fetchStudents();
      fetchTodayRecords();
      checkInProgress();
    }
  }, [coach]);

  const fetchStudents = async () => {
    try {
      const response = await api.get<any>(`/coaches/${coach?.id}/students`);
      if (response.success) {
        setStudents(response.students || []);
      }
    } catch (error) {
      console.error('Fetch students error:', error);
    }
  };

  const fetchTodayRecords = async () => {
    try {
      const response = await api.get<any>(`/coaches/${coach?.id}/training-records`);
      if (response.success) {
        const today = new Date().toISOString().split('T')[0];
        const todayList = (response.records || []).filter(
          (r: TrainingRecord) => r.trainingDate === today
        );
        setTodayRecords(todayList);
      }
    } catch (error) {
      console.error('Fetch records error:', error);
    }
  };

  const checkInProgress = async () => {
    try {
      const response = await api.get<any>(`/coaches/${coach?.id}/training-records`);
      if (response.success) {
        const inProgress = (response.records || []).find(
          (r: TrainingRecord) => r.status === 'in_progress'
        );
        if (inProgress) {
          setCurrentRecord(inProgress);
          const student = students.find(s => s.id === inProgress.studentId);
          if (student) {
            setSelectedStudent(student);
            setSelectedSubject(inProgress.subject);
          }
        }
      }
    } catch (error) {
      console.error('Check in progress error:', error);
    }
  };

  const handleScan = () => {
    if (!selectedStudent || !selectedSubject) {
      alert('请先选择学员和科目');
      return;
    }

    if (currentRecord) {
      handleSignOut();
      return;
    }

    setIsScanning(true);

    setTimeout(() => {
      setIsScanning(false);
      handleSignIn();
    }, 1500);
  };

  const handleSignIn = async () => {
    if (!selectedStudent || !selectedSubject) return;

    setIsLoading(true);
    try {
      const subjectInfo = selectedStudent.subjects.find(s => s.subject === selectedSubject);
      const response = await api.post<any>('/training/signin', {
        coachId: coach?.id,
        studentId: selectedStudent.id,
        subject: selectedSubject,
        subjectName: subjectInfo?.subjectName || '',
        hours: 2,
      });

      if (response.success) {
        setCurrentRecord(response.record);
        fetchTodayRecords();
      }
    } catch (error) {
      console.error('Sign in error:', error);
      alert('签到失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    if (!currentRecord) return;

    setIsLoading(true);
    try {
      const response = await api.post<any>('/training/signout', {
        recordId: currentRecord.id,
      });

      if (response.success) {
        setCurrentRecord(null);
        fetchStudents();
        fetchTodayRecords();
        alert('签退成功！学时已更新。');
      }
    } catch (error) {
      console.error('Sign out error:', error);
      alert('签退失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualSignIn = async () => {
    if (!studentCode.trim() || !selectedSubject) {
      alert('请输入学员编号并选择科目');
      return;
    }

    const student = students.find(s => s.id.includes(studentCode));
    if (!student) {
      alert('未找到该学员');
      return;
    }

    setSelectedStudent(student);
    handleSignIn();
  };

  const subjectOptions = selectedStudent
    ? selectedStudent.subjects.filter(s => s.status !== 'passed' && s.status !== 'completed')
    : [];

  const getSubjectName = (subjectKey: string) => {
    const subjectMap: Record<string, string> = {
      'subject-1': '科目一',
      'subject-2': '科目二',
      'subject-3': '科目三',
      'subject-4': '科目四',
    };
    return subjectMap[subjectKey] || subjectKey;
  };

  return (
    <Layout role="coach" title="扫码签到">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-white rounded-xl border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <Play className="w-5 h-5 text-blue-600" />
              {currentRecord ? '当前培训' : '开始培训'}
            </h3>
            {currentRecord && (
              <span className="px-3 py-1 bg-amber-100 text-amber-700 text-sm rounded-full animate-pulse">
                进行中
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                选择学员
              </label>
              <div className="relative">
                <button
                  onClick={() => setShowStudentDropdown(!showStudentDropdown)}
                  disabled={!!currentRecord}
                  className="w-full px-4 py-3 text-left border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-50 disabled:cursor-not-allowed flex items-center justify-between"
                >
                  {selectedStudent ? (
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-medium">
                        学
                      </div>
                      <span className="font-medium text-slate-800">
                        {(selectedStudent as any).name || '学员'}
                      </span>
                    </div>
                  ) : (
                    <span className="text-slate-400">请选择学员</span>
                  )}
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                {showStudentDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                    {students.map((student) => (
                      <div
                        key={student.id}
                        onClick={() => {
                          setSelectedStudent(student);
                          setSelectedSubject('');
                          setShowStudentDropdown(false);
                        }}
                        className="px-4 py-3 hover:bg-blue-50 cursor-pointer flex items-center gap-3 border-b border-slate-50 last:border-0"
                      >
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-medium">
                          学
                        </div>
                        <div>
                          <p className="font-medium text-slate-800 text-sm">
                            {(student as any).name || '学员'}
                          </p>
                          <p className="text-xs text-slate-500">{student.id}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                培训科目
              </label>
              <div className="relative">
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  disabled={!selectedStudent || !!currentRecord}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-50 disabled:cursor-not-allowed appearance-none"
                >
                  <option value="">请选择科目</option>
                  {subjectOptions.map((subject) => (
                    <option key={subject.subject} value={subject.subject}>
                      {subject.subjectName} ({subject.completedHours}/{subject.requiredHours}h)
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {currentRecord && selectedStudent && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-5 h-5 text-amber-600" />
                <span className="font-medium text-amber-800">培训进行中</span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-amber-600 mb-1">学员</p>
                  <p className="font-medium text-amber-900">
                    {(selectedStudent as any).name || '学员'}
                  </p>
                </div>
                <div>
                  <p className="text-amber-600 mb-1">科目</p>
                  <p className="font-medium text-amber-900">
                    {getSubjectName(currentRecord.subject)}
                  </p>
                </div>
                <div>
                  <p className="text-amber-600 mb-1">签到时间</p>
                  <p className="font-medium text-amber-900">
                    {currentRecord.signInTime}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleScan}
              disabled={isLoading || (!currentRecord && (!selectedStudent || !selectedSubject))}
              className={`flex-1 py-4 font-medium rounded-xl flex items-center justify-center gap-2 text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                currentRecord
                  ? 'bg-rose-600 text-white hover:bg-rose-700'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isScanning ? (
                <>
                  <Scan className="w-6 h-6 animate-pulse" />
                  扫描中...
                </>
              ) : isLoading ? (
                <>
                  <RefreshCw className="w-6 h-6 animate-spin" />
                  处理中...
                </>
              ) : currentRecord ? (
                <>
                  <Square className="w-6 h-6" />
                  结束培训并签退
                </>
              ) : (
                <>
                  <Play className="w-6 h-6" />
                  开始培训签到
                </>
              )}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-slate-800">今日培训记录</h3>
          </div>

          {todayRecords.length > 0 ? (
            <div className="space-y-3">
              {todayRecords.map((record) => (
                <div
                  key={record.id}
                  className={`p-4 rounded-xl border ${
                    record.status === 'in_progress'
                      ? 'bg-amber-50 border-amber-200'
                      : 'bg-slate-50 border-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        record.status === 'in_progress'
                          ? 'bg-amber-200'
                          : 'bg-emerald-200'
                      }`}>
                        {record.status === 'in_progress' ? (
                          <Clock className="w-5 h-5 text-amber-700" />
                        ) : (
                          <CheckCircle className="w-5 h-5 text-emerald-700" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">
                          {record.subjectName}
                        </p>
                        <p className="text-sm text-slate-500">
                          {(record as any).studentName || '学员'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-slate-800">
                        {record.hours} 学时
                      </p>
                      <p className="text-xs text-slate-500">
                        {record.signInTime} - {record.signOutTime || '进行中'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400">
              <Clock className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">今日暂无培训记录</p>
            </div>
          )}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
          <h4 className="font-medium text-blue-800 mb-3">扫码签到说明</h4>
          <ul className="text-sm text-blue-700 space-y-1.5">
            <li>• 选择学员和培训科目后点击开始培训</li>
            <li>• 系统自动记录培训开始时间</li>
            <li>• 培训结束后点击「结束培训」完成签退</li>
            <li>• 签退后自动累加学员对应科目学时</li>
            <li>• 科目学时达标后状态自动更新</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
}
