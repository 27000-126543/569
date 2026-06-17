import { useState, useEffect } from 'react';
import Layout from '../../components/Layout/Layout';
import {
  DoorOpen,
  Users,
  Search,
  Pencil,
  Settings,
} from 'lucide-react';
import api from '../../utils/api';
import type { ExamRoom } from '../../../shared/types';

export default function ExamRooms() {
  const [rooms, setRooms] = useState<ExamRoom[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await api.get<any>('/exam/rooms');
      if (response.success) {
        setRooms(response.rooms || []);
      }
    } catch (error) {
      console.error('Fetch rooms error:', error);
    }
  };

  const filteredRooms = rooms.filter(
    (room) =>
      room.name.includes(searchQuery) ||
      room.subject.includes(searchQuery)
  );

  const subjectNames: Record<string, string> = {
    'subject-1': '科目一',
    'subject-2': '科目二',
    'subject-3': '科目三',
    'subject-4': '科目四',
  };

  return (
    <Layout role="exam_admin" title="考场管理">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索考场..."
              className="pl-10 pr-4 py-2 w-64 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <DoorOpen className="w-4 h-4" />
            新增考场
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {filteredRooms.map((room) => {
            const usageRate = Math.round(
              (room.currentCount / room.capacity) * 100
            );

            return (
              <div
                key={room.id}
                className="bg-white rounded-xl border border-slate-100 p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-3 rounded-xl ${
                        room.status === 'active'
                          ? 'bg-emerald-100'
                          : 'bg-slate-100'
                      }`}
                    >
                      <DoorOpen
                        className={`w-6 h-6 ${
                          room.status === 'active'
                            ? 'text-emerald-600'
                            : 'text-slate-400'
                        }`}
                      />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-800 text-lg">
                        {room.name}
                      </h4>
                      <p className="text-sm text-slate-500">
                        {subjectNames[room.subject] || room.subject}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                      <Settings className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                      <Pencil className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500 flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      容量
                    </span>
                    <span className="font-medium text-slate-800">
                      {room.capacity} 人
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">当前预约</span>
                    <span className="font-medium text-blue-600">
                      {room.currentCount} 人
                    </span>
                  </div>

                  <div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          usageRate > 80
                            ? 'bg-rose-500'
                            : usageRate > 50
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${usageRate}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-400 mt-1 text-right">
                      使用率 {usageRate}%
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span
                    className={`px-3 py-1 text-sm rounded-full ${
                      room.status === 'active'
                        ? 'bg-emerald-100 text-emerald-600'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {room.status === 'active' ? '运行中' : '已关闭'}
                  </span>
                  <button className="text-sm text-blue-600 hover:text-blue-700">
                    查看详情 →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
