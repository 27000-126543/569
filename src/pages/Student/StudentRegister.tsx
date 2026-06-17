import { useState } from 'react';
import Layout from '../../components/Layout/Layout';
import {
  User,
  Car,
  Clock,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  Loader2,
} from 'lucide-react';
import api from '../../utils/api';
import { useNavigate } from 'react-router-dom';

type Step = 1 | 2 | 3 | 4;

const licenseTypes = [
  { value: 'C1', label: 'C1 手动挡', desc: '手动挡小型汽车', price: 5800 },
  { value: 'C2', label: 'C2 自动挡', desc: '自动挡小型汽车', price: 6200 },
];

const timeSlots = [
  '周一上午', '周一下午', '周一晚上',
  '周二上午', '周二下午', '周二晚上',
  '周三上午', '周三下午', '周三晚上',
  '周四上午', '周四下午', '周四晚上',
  '周五上午', '周五下午', '周五晚上',
  '周六上午', '周六下午', '周日上午', '周日下午',
];

export default function StudentRegister() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [matchedCoach, setMatchedCoach] = useState<any>(null);
  const [trainingPlans, setTrainingPlans] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    idCard: '',
    licenseType: 'C1',
    availableSlots: [] as string[],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = '请输入姓名';
    if (!formData.phone.trim()) newErrors.phone = '请输入手机号';
    else if (!/^1\d{10}$/.test(formData.phone)) newErrors.phone = '请输入正确的手机号';
    if (!formData.idCard.trim()) newErrors.idCard = '请输入身份证号';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors: Record<string, string> = {};
    if (formData.availableSlots.length === 0) {
      newErrors.slots = '请至少选择一个空闲时段';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 3 && !validateStep3()) return;

    if (step === 3) {
      matchCoach();
    }

    if (step < 4) {
      setStep((step + 1) as Step);
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      setStep((step - 1) as Step);
    }
  };

  const matchCoach = async () => {
    setIsLoading(true);
    try {
      const response = await api.post<any>('/students/register', {
        name: formData.name,
        phone: formData.phone,
        idCard: formData.idCard,
        licenseType: formData.licenseType,
        availableSlots: formData.availableSlots,
      });

      if (response.success) {
        setMatchedCoach(response.matchedCoach);
        setTrainingPlans(response.trainingPlans || []);
      }
    } catch (error) {
      console.error('Match coach error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSlotToggle = (slot: string) => {
    setFormData((prev) => ({
      ...prev,
      availableSlots: prev.availableSlots.includes(slot)
        ? prev.availableSlots.filter((s) => s !== slot)
        : [...prev.availableSlots, slot],
    }));
  };

  const handleSubmit = () => {
    navigate('/student/dashboard');
  };

  const steps = [
    { num: 1, title: '个人信息', icon: User },
    { num: 2, title: '选择车型', icon: Car },
    { num: 3, title: '空闲时段', icon: Clock },
    { num: 4, title: '报名完成', icon: CheckCircle },
  ];

  const currentPrice = licenseTypes.find((t) => t.value === formData.licenseType)?.price || 0;

  return (
    <Layout role="student" title="在线报名">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl border border-slate-100 p-8">
          <div className="flex items-center justify-between mb-8">
            {steps.map((s, index) => {
              const Icon = s.icon;
              const isActive = step === s.num;
              const isCompleted = step > s.num;

              return (
                <div key={s.num} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                        isActive
                          ? 'bg-blue-600 text-white'
                          : isCompleted
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle className="w-6 h-6" />
                      ) : (
                        <Icon className="w-5 h-5" />
                      )}
                    </div>
                    <span
                      className={`mt-2 text-sm font-medium ${
                        isActive ? 'text-blue-600' : isCompleted ? 'text-emerald-600' : 'text-slate-400'
                      }`}
                    >
                      {s.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-2 ${
                        isCompleted ? 'bg-emerald-500' : 'bg-slate-200'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>

          <div className="min-h-[350px]">
            {step === 1 && (
              <div className="space-y-5">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">
                  请填写您的个人信息
                </h3>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    姓名 <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="请输入您的姓名"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.name ? 'border-rose-500' : 'border-slate-200'
                    }`}
                  />
                  {errors.name && (
                    <p className="text-rose-500 text-sm mt-1">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    手机号 <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="请输入您的手机号"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.phone ? 'border-rose-500' : 'border-slate-200'
                    }`}
                  />
                  {errors.phone && (
                    <p className="text-rose-500 text-sm mt-1">{errors.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    身份证号 <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.idCard}
                    onChange={(e) => setFormData({ ...formData, idCard: e.target.value })}
                    placeholder="请输入您的身份证号"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.idCard ? 'border-rose-500' : 'border-slate-200'
                    }`}
                  />
                  {errors.idCard && (
                    <p className="text-rose-500 text-sm mt-1">{errors.idCard}</p>
                  )}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">
                  请选择驾照类型
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  {licenseTypes.map((type) => (
                    <div
                      key={type.value}
                      onClick={() => setFormData({ ...formData, licenseType: type.value })}
                      className={`p-5 border-2 rounded-xl cursor-pointer transition-all ${
                        formData.licenseType === type.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <Car
                          className={`w-8 h-8 ${
                            formData.licenseType === type.value
                              ? 'text-blue-600'
                              : 'text-slate-400'
                          }`}
                        />
                        <span className="font-semibold text-slate-800">{type.label}</span>
                      </div>
                      <p className="text-sm text-slate-500 mb-3">{type.desc}</p>
                      <p className="text-xl font-bold text-blue-600">¥{type.price}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-sm text-amber-800">
                    💡 提示：C1为手动挡，可驾驶手动和自动挡小型汽车；C2为自动挡，仅可驾驶自动挡小型汽车。
                  </p>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-5">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">
                  请选择您的空闲时段
                </h3>
                <p className="text-sm text-slate-500 mb-4">
                  系统将根据您选择的时段自动匹配最优教练
                </p>

                <div className="grid grid-cols-3 gap-3">
                  {timeSlots.map((slot) => {
                    const isSelected = formData.availableSlots.includes(slot);
                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => handleSlotToggle(slot)}
                        className={`py-3 px-4 rounded-lg text-sm font-medium transition-all border ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
                        }`}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>

                {errors.slots && (
                  <p className="text-rose-500 text-sm">{errors.slots}</p>
                )}

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    已选择 <strong>{formData.availableSlots.length}</strong> 个时段
                  </p>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="text-center py-8">
                {isLoading ? (
                  <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                    <p className="text-slate-600">正在为您匹配最优教练...</p>
                  </div>
                ) : matchedCoach ? (
                  <>
                    <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle className="w-10 h-10 text-emerald-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800 mb-2">
                      报名成功！
                    </h3>
                    <p className="text-slate-500 mb-6">
                      系统已为您匹配到最合适的教练
                    </p>

                    <div className="bg-slate-50 rounded-xl p-6 text-left max-w-md mx-auto">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                          {matchedCoach.name?.charAt(0) || '教'}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 text-lg">
                            {matchedCoach.name || '陈教练'}
                          </h4>
                          <p className="text-sm text-slate-500">
                            教龄 {matchedCoach.experienceYears || 8} 年
                          </p>
                          <p className="text-sm text-amber-500">
                            通过率 {matchedCoach.passRate || 92.5}%
                          </p>
                        </div>
                      </div>

                      <div className="border-t border-slate-200 pt-4 space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-500">驾照类型</span>
                          <span className="text-slate-800 font-medium">{formData.licenseType}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">培训费用</span>
                          <span className="text-slate-800 font-medium">¥{currentPrice.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">总学时</span>
                          <span className="text-slate-800 font-medium">62 学时</span>
                        </div>
                      </div>
                    </div>

                    {trainingPlans.length > 0 && (
                      <div className="mt-6 bg-slate-50 rounded-xl p-6 text-left max-w-md mx-auto">
                        <h4 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                          <Clock className="w-5 h-5 text-blue-600" />
                          初始培训计划
                          <span className="text-sm font-normal text-slate-500">
                            （共 {trainingPlans.length} 节课）
                          </span>
                        </h4>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {trainingPlans.map((plan, index) => (
                            <div
                              key={plan.id}
                              className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-100"
                            >
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-medium">
                                {index + 1}
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-slate-800 text-sm">
                                  {plan.subjectName}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {plan.planDate} {plan.startTime}-{plan.endTime}
                                </p>
                              </div>
                              <span className="px-2 py-1 text-xs bg-emerald-100 text-emerald-700 rounded-full">
                                已安排
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-rose-600">
                    暂无合适的教练，请调整时段后重试
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-between mt-8 pt-6 border-t border-slate-100">
            <button
              onClick={handlePrev}
              disabled={step === 1}
              className="px-6 py-3 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              上一步
            </button>

            {step < 4 ? (
              <button
                onClick={handleNext}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
              >
                下一步
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                进入首页
              </button>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
