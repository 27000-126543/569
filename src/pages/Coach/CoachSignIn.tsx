import { useState, useEffect } from 'react';
import Layout from '../../components/Layout/Layout';
import {
  Scan,
  Clock,
  CheckCircle,
  Play,
  Square,
  ChevronDown,
  BookOpen,
  RefreshCw,
  PenLine,
  Search,
  UserCheck,
  Timer,
  AlertCircle,
} from 'lucide-react';
import { useAuthStore } from '../../store/useStore';
import api from '../../utils/api';
import type { TrainingRecord, Student } from '../../../shared/types';

export default function CoachSignIn() {
  const { coach, user } = useAuthStore();
  const [signInMode, setSignInMode] = useState<'scan' | 'manual'>('scan');
  const [isScanning, setIsScanning] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<TrainingRecord | null>(null);
  const [todayRecords, setTodayRecords] = useState<TrainingRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [studentCode, setStudentCode] = useState('');
  const [studentSearch, setStudentSearch] = useState('');
  const [hoursBefore, setHoursBefore] = useState<number | null>(null);
  const [subjectHoursBefore, setSubjectHoursBefore] = useState<number | null>(null);
  const [completedRecord, setCompletedRecord] = useState<TrainingRecord | null>(null);
  const [showHoursChange, setShowHoursChange] = useState(false);
  const [completedSubject, setCompletedSubject] = useState<string>('');

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
        const newStudents = response.students || [];
        setStudents(newStudents);
        return newStudents;
      }
      return [];
    } catch (error) {
      console.error('Fetch students error:', error);
      return [];
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
        return todayList;
      }
      return [];
    } catch (error) {
      console.error('Fetch records error:', error);
      return [];
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
          } else {
            const allStudentsResp = await api.get<any>(`/coaches/${coach?.id}/students`);
            if (allStudentsResp.success) {
              const found = (allStudentsResp.students || []).find(
                (s: Student) => s.id === inProgress.studentId
              );
              if (found) setSelectedStudent(found);
            }
          }
          setSelectedSubject(inProgress.subject);
        }
      }
    } catch (error) {
      console.error('Check in progress error:', error);
    }
  };

  const handleScanSignIn = () => {
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
      performSignIn();
    }, 1500);
  };

  const performSignIn = async () => {
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
        alert('签到成功！培训已开始。');
      }
    } catch (error) {
      console.error('Sign in error:', error);
      alert('签到失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualSignIn = async () => {
    if (!selectedStudent) {
      alert('请先选择或搜索学员');
      return;
    }
    if (!selectedSubject) {
      alert('请选择培训科目');
      return;
    }
    if (currentRecord) {
      alert('已有进行中的培训，请先签退');
      return;
    }

    performSignIn();
  };

  const handleSignOut = async () => {
    if (!currentRecord || !selectedStudent) return;

    const recordSubject = currentRecord.subject;
    const recordHours = currentRecord.hours;
    setHoursBefore(selectedStudent.completedHours);
    const subj = selectedStudent.subjects.find(s => s.subject === recordSubject);
    setSubjectHoursBefore(subj?.completedHours ?? null);
    setCompletedSubject(recordSubject);

    setIsLoading(true);
    try {
      const response = await api.post<any>('/training/signout', {
        recordId: currentRecord.id,
      });

      if (response.success) {
        setCompletedRecord(response.record);
        setCurrentRecord(null);
        setSelectedSubject('');
        setStudentCode('');
        setStudentSearch('');
        setShowHoursChange(true);
        
        await Promise.all([fetchStudents(), fetchTodayRecords()]).then(([newStudents]) => {
          const updatedStudent = newStudents.find(s => s.id === selectedStudent.id);
          if (updatedStudent) {
            setSelectedStudent(updatedStudent);
          }
        });
        
        setTimeout(() => setShowHoursChange(false), 8000);
      }
    } catch (error) {
      console.error('Sign out error:', error);
      alert('签退失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStudentCodeSearch = () => {
    if (!studentCode.trim()) return;

    const found = students.find(
      s => s.id === studentCode.trim() || s.id.includes(studentCode.trim())
    );
    if (found) {
      setSelectedStudent(found);
      setSelectedSubject('');
    } else {
      alert('未找到该学员，请检查学员编号');
    }
  };

  const filteredStudents = studentSearch.trim()
    ? students.filter(s =>
        (s as any).name?.includes(studentSearch.trim()) ||
        s.id.includes(studentSearch.trim())
      )
    : students;

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

  const getStudentNameById = (studentId: string) => {
    const s = students.find(st => st.id === studentId);
    return (s as any)?.name || '学员';
  };

  const subjectHoursAfter = completedSubject && selectedStudent
    ? selectedStudent.subjects.find(s => s.subject === completedSubject)?.completedHours
    : null;

  return (
    <Layout role="coach" title="扫码签到">
      <div className="max-w-2xl mx-auto space-y-6">
        {showHoursChange && completedRecord && selectedStudent && (
          <div className="bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-200 rounded-xl overflow-hidden animate-fade-in">
            <div className="bg-emerald-600 px-6 py-3">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                签退成功！学时已更新
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-white rounded-lg p-4 border border-emerald-100">
                <p className="text-sm text-slate-500 mb-2">学员</p>
                <p className="text-lg font-bold text-slate-800">
                  {(selectedStudent as any).name || '学员'}
                </p>
                <p className="text-xs text-slate-400">{selectedStudent.id}</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-emerald-100">
                <p className="text-sm text-slate-500 mb-2">培训科目</p>
                <p className="text-lg font-bold text-slate-800">
                  {completedRecord.subjectName || getSubjectName(completedRecord.subject)}
                </p>
                <p className="text-xs text-slate-400">
                  {completedRecord.signInTime} - {completedRecord.signOutTime}
                </p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-emerald-100">
                <p className="text-sm text-slate-500 mb-2">总学时</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-emerald-600">
                    {selectedStudent.completedHours}h
                  </span>
                  {hoursBefore !== null && (
                    <span className="text-sm text-emerald-500">
                      (↑ +{selectedStudent.completedHours - hoursBefore}h)
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400">
                  {selectedStudent.completedHours}/{selectedStudent.totalHours}h
                </p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-emerald-100">
                <p className="text-sm text-slate-500 mb-2">
                  {completedRecord.subjectName || getSubjectName(completedRecord.subject)} 已完成
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-blue-600">
                    {subjectHoursAfter}h
                  </span>
                  {subjectHoursBefore !== null && subjectHoursAfter !== null && (
                    <span className="text-sm text-blue-500">
                      (↑ +{(subjectHoursAfter || 0) - (subjectHoursBefore || 0)}h)
                    </span>
                  )}
                </div>
                {(() => {
                  const subj = selectedStudent.subjects.find(s => s.subject === completedSubject);
                  return subj ? (
                    <p className="text-xs text-slate-400">
                      {subj.completedHours}/{subj.requiredHours}h
                    </p>
                  ) : null;
                })()}
              </div>
            </div>
              {(() => {
                const subj = selectedStudent.subjects.find(s => s.subject === completedSubject);
                if (subj && subj.completedHours >= subj.requiredHours) {
                  return (
                    <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <p className="text-sm font-medium text-amber-800 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        恭喜！{subj.subjectName}学时已达标，可以预约考试了！
                      </p>
                    </div>
                  );
                }
                return null;
              })()}
            </div>
          </div>
        )}

        {currentRecord ? (
          <div className="bg-white rounded-xl border border-amber-200 overflow-hidden">
            <div className="bg-amber-50 border-b border-amber-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-amber-800 flex items-center gap-2">
                  <Timer className="w-5 h-5 text-amber-600" />
                  当前培训进行中
                </h3>
                <span className="px-3 py-1 bg-amber-500 text-white text-sm rounded-full animate-pulse">
                  进行中
                </span>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-sm text-slate-500 mb-1">学员姓名</p>
                  <p className="text-lg font-semibold text-slate-800">
                    {selectedStudent ? (selectedStudent as any).name : getStudentNameById(currentRecord.studentId)}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    编号：{currentRecord.studentId}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-sm text-slate-500 mb-1">培训科目</p>
                  <p className="text-lg font-semibold text-slate-800">
                    {currentRecord.subjectName || getSubjectName(currentRecord.subject)}
                  </p>
                  {selectedStudent && (() => {
                    const subj = selectedStudent.subjects.find(s => s.subject === currentRecord.subject);
                    return subj ? (
                      <p className="text-xs text-slate-400 mt-1">
                        已完成 {subj.completedHours}/{subj.requiredHours} 学时
                      </p>
                    ) : null;
                  })()}
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-sm text-slate-500 mb-1">签到时间</p>
                  <p className="text-lg font-semibold text-slate-800">
                    {currentRecord.signInTime}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    培训日期：{currentRecord.trainingDate}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-sm text-slate-500 mb-1">预计学时</p>
                  <p className="text-lg font-semibold text-slate-800">
                    {currentRecord.hours} 学时
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    签退后自动累加
                  </p>
                </div>
              </div>

              <button
                onClick={handleSignOut}
                disabled={isLoading}
                className="w-full py-4 bg-rose-600 text-white font-medium rounded-xl flex items-center justify-center gap-2 text-lg hover:bg-rose-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-6 h-6 animate-spin" />
                    处理中...
                  </>
                ) : (
                  <>
                    <Square className="w-6 h-6" />
                    结束培训并签退
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <Play className="w-5 h-5 text-blue-600" />
                开始培训
              </h3>
            </div>

            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setSignInMode('scan')}
                className={`flex-1 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors ${
                  signInMode === 'scan'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Scan className="w-5 h-5" />
                扫码签到
              </button>
              <button
                onClick={() => setSignInMode('manual')}
                className={`flex-1 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors ${
                  signInMode === 'manual'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <PenLine className="w-5 h-5" />
                手动签到
              </button>
            </div>

            {signInMode === 'scan' ? (
              <>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      选择学员
                    </label>
                    <div className="relative">
                      <button
                        onClick={() => setShowStudentDropdown(!showStudentDropdown)}
                        className="w-full px-4 py-3 text-left border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent flex items-center justify-between"
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
                        disabled={!selectedStudent}
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

                <button
                  onClick={handleScanSignIn}
                  disabled={isLoading || !selectedStudent || !selectedSubject}
                  className="w-full py-4 bg-blue-600 text-white font-medium rounded-xl flex items-center justify-center gap-2 text-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                  ) : (
                    <>
                      <Play className="w-6 h-6" />
                      扫码签到开始培训
                    </>
                  )}
                </button>
              </>
            ) : (
              <>
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      输入学员编号
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={studentCode}
                        onChange={(e) => {
                          setStudentCode(e.target.value);
                          setSelectedStudent(null);
                          setSelectedSubject('');
                        }}
                        placeholder="请输入学员编号"
                        className="flex-1 px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                      <button
                        onClick={handleStudentCodeSearch}
                        disabled={!studentCode.trim()}
                        className="px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        <Search className="w-4 h-4" />
                        查找
                      </button>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200" />
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="bg-white px-3 text-slate-400">或从列表选择</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      搜索选择学员
                    </label>
                    <input
                      type="text"
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                      placeholder="输入姓名或编号搜索..."
                      className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                    {studentSearch.trim() && (
                      <div className="mt-2 bg-white border border-slate-200 rounded-lg shadow-lg max-h-40 overflow-auto">
                        {filteredStudents.length > 0 ? (
                          filteredStudents.map((student) => (
                            <div
                              key={student.id}
                              onClick={() => {
                                setSelectedStudent(student);
                                setStudentCode(student.id);
                                setSelectedSubject('');
                                setStudentSearch('');
                              }}
                              className={`px-4 py-3 cursor-pointer flex items-center gap-3 border-b border-slate-50 last:border-0 ${
                                selectedStudent?.id === student.id
                                  ? 'bg-emerald-50'
                                  : 'hover:bg-slate-50'
                              }`}
                            >
                              <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 text-sm font-medium">
                                学
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-slate-800 text-sm">
                                  {(student as any).name || '学员'}
                                </p>
                                <p className="text-xs text-slate-500">{student.id}</p>
                              </div>
                              {selectedStudent?.id === student.id && (
                                <UserCheck className="w-5 h-5 text-emerald-600" />
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="px-4 py-3 text-sm text-slate-400 text-center">
                            未找到匹配学员
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {selectedStudent && (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <UserCheck className="w-5 h-5 text-emerald-600" />
                        <span className="font-medium text-emerald-800">已选择学员</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-emerald-600">姓名：</span>
                          <span className="font-medium text-emerald-900">
                            {(selectedStudent as any).name}
                          </span>
                        </div>
                        <div>
                          <span className="text-emerald-600">编号：</span>
                          <span className="font-medium text-emerald-900">
                            {selectedStudent.id}
                          </span>
                        </div>
                        <div>
                          <span className="text-emerald-600">驾照类型：</span>
                          <span className="font-medium text-emerald-900">
                            {selectedStudent.licenseType}
                          </span>
                        </div>
                        <div>
                          <span className="text-emerald-600">已完成学时：</span>
                          <span className="font-medium text-emerald-900">
                            {selectedStudent.completedHours}/{selectedStudent.totalHours}h
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      培训科目
                    </label>
                    <div className="relative">
                      <select
                        value={selectedSubject}
                        onChange={(e) => setSelectedSubject(e.target.value)}
                        disabled={!selectedStudent}
                        className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:bg-slate-50 disabled:cursor-not-allowed appearance-none"
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

                <button
                  onClick={handleManualSignIn}
                  disabled={isLoading || !selectedStudent || !selectedSubject}
                  className="w-full py-4 bg-emerald-600 text-white font-medium rounded-xl flex items-center justify-center gap-2 text-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-6 h-6 animate-spin" />
                      处理中...
                    </>
                  ) : (
                    <>
                      <PenLine className="w-6 h-6" />
                      手动签到开始培训
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        )}

        <div className="bg-white rounded-xl border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-slate-800">今日培训记录</h3>
            </div>
            <button
              onClick={() => { fetchTodayRecords(); fetchStudents(); }}
              className="p-1 text-slate-400 hover:text-slate-600"
              title="刷新"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
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
                          {record.subjectName || getSubjectName(record.subject)}
                        </p>
                        <p className="text-sm text-slate-500">
                          {(record as any).studentName || getStudentNameById(record.studentId)}
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
          <h4 className="font-medium text-blue-800 mb-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            签到说明
          </h4>
          <ul className="text-sm text-blue-700 space-y-1.5">
            <li>• <strong>扫码签到</strong>：从列表选择学员和科目，点击扫码签到</li>
            <li>• <strong>手动签到</strong>：输入学员编号或搜索选择学员，选科目后签到</li>
            <li>• 进入页面如有进行中培训，会直接显示详情</li>
            <li>• 培训结束后点击「结束培训」完成签退</li>
            <li>• 签退后自动累加学员对应科目学时</li>
            <li>• 科目学时达标后状态自动更新</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
}
