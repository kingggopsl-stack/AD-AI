import React, { useState } from 'react';
import { 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  Building2, 
  Target, 
  Users, 
  MessageSquare, 
  Hash,
  Instagram,
  Youtube,
  Search,
  Monitor,
  CheckCircle2,
  Calendar,
  CreditCard,
  Briefcase,
  TrendingUp,
  FileText
} from 'lucide-react';

const CATEGORIES = [
  '금융', '보험', '뷰티', '식음료', 'IT', '유통', '기타'
];

const SUB_CATEGORIES = {
  '금융': ['저축은행', '캐피탈', '카드', '보험', '증권', '기타'],
  '보험': ['생명보험', '손해보험', '화재보험', '제3보험', '기타'],
  '식음료': ['프랜차이즈', '주류', '가공식품', '기타'],
  'IT': ['모바일/앱', '가전제품', '소프트웨어/SaaS', '기타']
};

const OBJECTIVES = [
  '전환수 극대화', 'CPA 최소화', '브랜드 인지도', '복합'
];

const CHANNELS = [
  { id: 'sa', name: 'SA', icon: <Search size={24} /> },
  { id: 'da', name: 'DA', icon: <Monitor size={24} /> },
  { id: 'bs', name: 'BS', icon: <Target size={24} /> },
  { id: 'sns', name: 'SNS', icon: <Instagram size={24} /> },
  { id: 'app', name: 'App', icon: <Hash size={24} /> },
];

const AGE_GROUPS = [
  '20대 초반', '20대 후반', '30대 초반', '30대 후반', '40대 초반', '40대 후반', '50대 이상'
];

const CREDIT_GRADES = ['1-3등급', '4-6등급', '7등급 이하', '정보 없음'];
const LOAN_PURPOSES = ['생활비', '주택', '사업자금', '대환대출', '기타'];

const BriefForm = ({ onSubmit }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: 기본 정보
    client_name: '',
    category: '',
    sub_category: '',
    
    // Step 2: 캠페인 목표
    campaign_objective: '',
    monthly_budget: 5000, // 1천만 ~ 10억 (단위: 만원)
    campaign_period: '',
    
    // Step 3: 타겟
    target_age: [],
    target_gender: '전체',
    target_credit_grade: '',
    target_loan_purpose: '',
    
    // Step 4: 채널
    available_channels: [],
    current_running_channels: '',
    
    // Step 5: 기타 정모
    competitor_names: [], 
    required_deliverables: '',
    special_notes: '',
    
    // 임시 입력용
    tempComp: ''
  });

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 5));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleBudgetChange = (e) => {
    setFormData(prev => ({ ...prev, monthly_budget: parseInt(e.target.value) }));
  };

  const toggleAge = (age) => {
    setFormData(prev => ({
      ...prev,
      target_age: prev.target_age.includes(age) 
        ? prev.target_age.filter(a => a !== age)
        : [...prev.target_age, age]
    }));
  };

  const toggleChannel = (channelId) => {
    setFormData(prev => ({
      ...prev,
      available_channels: prev.available_channels.includes(channelId)
        ? prev.available_channels.filter(id => id !== channelId)
        : [...prev.available_channels, channelId]
    }));
  };

  const addCompetitor = (e) => {
    if (e.key === 'Enter' && formData.tempComp.trim() && formData.competitor_names.length < 5) {
      e.preventDefault();
      setFormData(prev => ({
        ...prev,
        competitor_names: [...prev.competitor_names, prev.tempComp.trim()],
        tempComp: ''
      }));
    }
  };

  const removeCompetitor = (name) => {
    setFormData(prev => ({
      ...prev,
      competitor_names: prev.competitor_names.filter(n => n !== name)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formattedData = {
      client_name: formData.client_name,
      category: formData.category,
      sub_category: formData.sub_category,
      campaign_objective: formData.campaign_objective,
      monthly_budget: formData.monthly_budget,
      campaign_period: formData.campaign_period,
      target_age: formData.target_age,
      target_gender: formData.target_gender,
      target_credit_grade: formData.target_credit_grade,
      target_loan_purpose: formData.target_loan_purpose,
      available_channels: formData.available_channels,
      current_running_channels: formData.current_running_channels,
      competitor_names: formData.competitor_names,
      required_deliverables: formData.required_deliverables,
      special_notes: formData.special_notes,
      raw_details: formData // 원본 데이터 보존
    };
    onSubmit(formattedData);
  };

  const steps = [
    { id: 1, label: '기본 정보', icon: <Building2 size={18} /> },
    { id: 2, label: '목표/예산', icon: <Target size={18} /> },
    { id: 3, label: '타겟 설정', icon: <Users size={18} /> },
    { id: 4, label: '미디어 채널', icon: <Hash size={18} /> },
    { id: 5, label: '기타 정보', icon: <Sparkles size={18} /> },
  ];

  const formatBudget = (val) => {
    if (val >= 10000) {
      const gok = Math.floor(val / 10000);
      const remain = val % 10000;
      return `${gok}억 ${remain > 0 ? remain.toLocaleString() + '만' : ''}`;
    }
    return `${val.toLocaleString()}만원`;
  };

  return (
    <div className="container" style={{ padding: '2rem 1rem', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="glass-panel w-full" style={{ maxWidth: '850px', padding: '3rem' }}>
        
        {/* Wizard Steps Header */}
        <div className="wizard-steps mb-12">
          {steps.map((step) => (
            <div key={step.id} className={`step-item ${currentStep === step.id ? 'active' : ''} ${currentStep > step.id ? 'completed' : ''}`}>
              <div className="step-dot">
                {currentStep > step.id ? <CheckCircle2 size={20} /> : step.id}
              </div>
              <span className="step-label">{step.label}</span>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {/* Step 1: 기본 정보 */}
          {currentStep === 1 && (
            <div className="animate-fade-in space-y-8">
              <h2 className="text-3xl font-black mb-10 flex items-center gap-4">
                <Building2 className="text-accent-primary" size={32} /> 
                <span className="bg-gradient-to-r from-slate-900 to-slate-500 bg-clip-text text-transparent">클라이언트 기본 정보</span>
              </h2>
              <div className="form-group">
                <label className="form-label font-bold text-xs tracking-widest text-slate-400 mb-3 block">클라이언트명 / 브랜드명</label>
                <input
                  type="text"
                  name="client_name"
                  className="form-control"
                  placeholder="예: 현대카드, 아모레퍼시픽 등"
                  value={formData.client_name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="form-group">
                  <label className="form-label font-bold text-xs tracking-widest text-slate-400 mb-3 block">카테고리</label>
                  <select name="category" className="form-control" value={formData.category} onChange={handleChange} required>
                    <option value="">대분류 선택 (금융/보험/뷰티/식음료/IT/유통/기타)</option>
                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                {SUB_CATEGORIES[formData.category] && (
                  <div className="form-group animate-slide-up">
                    <label className="form-label font-bold text-xs tracking-widest text-slate-400 mb-3 block">세부 카테고리</label>
                    <select name="sub_category" className="form-control" value={formData.sub_category} onChange={handleChange}>
                      <option value="">소분류 선택</option>
                      {SUB_CATEGORIES[formData.category].map(sub => <option key={sub} value={sub}>{sub}</option>)}
                    </select>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 2: 캠페인 목표 */}
          {currentStep === 2 && (
            <div className="animate-fade-in space-y-10">
              <h2 className="text-3xl font-black mb-10 flex items-center gap-4">
                <Target className="text-accent-primary" size={32} /> 
                <span>캠페인 목표 및 예산</span>
              </h2>
              <div className="form-group">
                <label className="form-label font-bold text-xs tracking-widest text-slate-400 mb-3 block">목표 (전환수 극대화/CPA 최소화/브랜드 인지도/복합)</label>
                <div className="grid grid-cols-2 gap-4">
                  {OBJECTIVES.map(obj => (
                    <button
                      key={obj}
                      type="button"
                      className={`selection-card p-4 h-auto text-left flex-col items-start gap-1 ${formData.campaign_objective === obj ? 'selected' : ''}`}
                      onClick={() => setFormData(prev => ({ ...prev, campaign_objective: obj }))}
                    >
                      <span className="text-sm font-bold">{obj}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <div className="flex justify-between items-end mb-4">
                  <label className="form-label font-bold text-xs tracking-widest text-slate-400 mb-0">월 광고 예산 (단위: 만원)</label>
                  <span className="text-2xl font-black text-accent-primary">{formatBudget(formData.monthly_budget)}</span>
                </div>
                <input
                  type="range"
                  min="1000"
                  max="100000"
                  step="500"
                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                  style={{ accentColor: 'var(--accent-primary)' }}
                  value={formData.monthly_budget}
                  onChange={handleBudgetChange}
                />
                <div className="flex justify-between mt-3 text-[10px] font-black tracking-widest text-slate-400 uppercase">
                  <span>1,000만원</span>
                  <span>10억원</span>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label font-bold text-xs tracking-widest text-slate-400 mb-3 block">캠페인 기간</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input
                    type="text"
                    name="campaign_period"
                    className="form-control !pl-12"
                    placeholder="예: 2024년 4월 ~ 6월"
                    value={formData.campaign_period}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: 타겟 설정 */}
          {currentStep === 3 && (
            <div className="animate-fade-in space-y-8">
              <h2 className="text-3xl font-black mb-10 flex items-center gap-4">
                <Users className="text-accent-primary" size={32} /> 
                <span>핵심 타겟 그룹</span>
              </h2>
              <div className="form-group">
                <label className="form-label font-bold text-xs tracking-widest text-slate-400 mb-4 block">연령대 (멀티선택)</label>
                <div className="tags-container !gap-3">
                  {AGE_GROUPS.map(age => (
                    <button
                      key={age}
                      type="button"
                      className={`tag-btn px-5 py-2.5 rounded-xl border-2 font-bold transition-all ${
                        formData.target_age.includes(age) 
                          ? 'bg-slate-900 border-slate-900 text-white shadow-lg scale-105' 
                          : 'bg-white border-slate-100 text-slate-400'
                      }`}
                      onClick={() => toggleAge(age)}
                    >
                      {age}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-8">
                <div className="form-group">
                  <label className="form-label font-bold text-xs tracking-widest text-slate-400 mb-4 block">성별</label>
                  <div className="flex gap-2 p-1.5 bg-slate-50 rounded-2xl border border-slate-100">
                    {['전체', '남성', '여성'].map(g => (
                      <button
                        key={g}
                        type="button"
                        className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${
                          formData.target_gender === g ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'
                        }`}
                        onClick={() => setFormData(prev => ({ ...prev, target_gender: g }))}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {formData.category === '금융' && (
                <div className="animate-slide-up space-y-8 pt-4 border-t border-slate-100">
                  <div className="grid grid-cols-2 gap-8">
                    <div className="form-group">
                      <label className="form-label flex items-center gap-2 font-bold text-xs tracking-widest text-slate-400 mb-3"><CreditCard size={14} /> 신용등급 (1-3등급/4-6등급/7등급 이하)</label>
                      <select name="target_credit_grade" className="form-control" value={formData.target_credit_grade} onChange={handleChange}>
                        <option value="">등급 선택 (금융 전용)</option>
                        {CREDIT_GRADES.map(grade => <option key={grade} value={grade}>{grade}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label flex items-center gap-2 font-bold text-xs tracking-widest text-slate-400 mb-3"><Briefcase size={14} /> 대출목적 (생활비/주택/사업자금/기타)</label>
                      <select name="target_loan_purpose" className="form-control" value={formData.target_loan_purpose} onChange={handleChange}>
                        <option value="">목적 선택 (금융 전용)</option>
                        {LOAN_PURPOSES.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 4: 채널 */}
          {currentStep === 4 && (
            <div className="animate-fade-in space-y-10">
              <h2 className="text-3xl font-black mb-10 flex items-center gap-4">
                <Hash className="text-accent-primary" size={32} /> 
                <span>사용 가능 미디어 채널</span>
              </h2>
              <div className="form-group">
                <label className="form-label font-bold text-xs tracking-widest text-slate-400 mb-6 block">사용 가능 채널 (카드 멀티선택: SA/DA/BS/SNS/App)</label>
                <div className="selection-grid grid-cols-5 h-48">
                  {CHANNELS.map(channel => (
                    <div
                      key={channel.id}
                      className={`selection-card flex-col py-6 ${formData.available_channels.includes(channel.id) ? 'selected' : ''}`}
                      onClick={() => toggleChannel(channel.id)}
                    >
                      <div className={`mb-3 transition-transform duration-300 ${formData.available_channels.includes(channel.id) ? 'scale-110' : ''}`}>
                        {channel.icon}
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-tight">{channel.name}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="form-group mt-12 bg-slate-50 p-8 rounded-3xl border border-dashed border-slate-200">
                <label className="form-label font-bold text-xs tracking-widest text-slate-500 mb-4 block">현재 집행 중인 채널</label>
                <textarea
                  name="current_running_channels"
                  className="form-control !bg-white !min-h-[100px]"
                  placeholder="현재 진행 중이거나 과거에 집행했던 매체 정보를 입력해 주세요"
                  value={formData.current_running_channels}
                  onChange={handleChange}
                />
              </div>
            </div>
          )}

          {/* Step 5: 기타 정모 */}
          {currentStep === 5 && (
            <div className="animate-fade-in space-y-8">
              <h2 className="text-3xl font-black mb-10 flex items-center gap-4">
                <Sparkles className="text-accent-primary" size={32} /> 
                <span>기타 정보 및 요청사항</span>
              </h2>

              <div className="form-group">
                <label className="form-label font-black uppercase text-xs tracking-widest text-slate-400 mb-3 block">경쟁사 (태그 입력)</label>
                <div className="flex flex-wrap gap-2 mb-4">
                  {formData.competitor_names.map(name => (
                    <span key={name} className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm">
                      {name}
                      <button type="button" onClick={() => removeCompetitor(name)} className="hover:text-accent-primary">×</button>
                    </span>
                  ))}
                  {formData.competitor_names.length < 5 && (
                    <input
                      type="text"
                      className="bg-accent-secondary !border-none !ring-0 text-xs px-4 py-2 rounded-xl w-32 placeholder:text-slate-400"
                      placeholder="+ 이름 입력 후 Enter"
                      name="tempComp"
                      value={formData.tempComp}
                      onChange={handleChange}
                      onKeyDown={addCompetitor}
                    />
                  )}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label font-black uppercase text-xs tracking-widest text-slate-400 mb-3 block flex items-center gap-2"><FileText size={14} /> 필요 산출물 (마스터영상/숏폼/배너/카피 등)</label>
                <input
                  type="text"
                  name="required_deliverables"
                  className="form-control"
                  placeholder="예: 마스터 영상 1종, 숏폼 3종, GDN 배너 등"
                  value={formData.required_deliverables}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label font-black uppercase text-xs tracking-widest text-slate-400 mb-3 block flex items-center gap-2"><MessageSquare size={14} /> 기타 요청사항</label>
                <textarea
                  name="special_notes"
                  className="form-control !min-h-[120px]"
                  placeholder="제안서에 반드시 반영되어야 할 사항이나 기타 요청을 입력해 주세요"
                  value={formData.special_notes}
                  onChange={handleChange}
                />
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-16 gap-6 pt-10 border-t border-slate-100">
            {currentStep > 1 && (
              <button type="button" onClick={prevStep} className="btn-secondary px-8 py-4 rounded-2xl flex items-center gap-3 font-bold hover:bg-slate-50 transition-colors">
                <ArrowLeft size={18} /> 이전
              </button>
            )}
            
            {currentStep < 5 ? (
              <button 
                type="button" 
                onClick={nextStep} 
                className="btn-primary ml-auto flex items-center gap-3 px-10 py-5 rounded-3xl font-black tracking-widest shadow-2xl shadow-accent-primary/20 hover:scale-105 active:scale-95 transition-all"
                disabled={currentStep === 1 && !formData.client_name}
                style={{ background: 'var(--text-primary)', color: 'white' }}
              >
                저장 및 계속하기 <ArrowRight size={18} />
              </button>
            ) : (
              <button 
                type="submit" 
                className="btn-primary ml-auto flex items-center gap-4 px-12 py-5 rounded-3xl font-black tracking-widest shadow-2xl shadow-accent-primary/50 hover:scale-105 active:scale-95 transition-all"
                style={{ background: 'var(--accent-primary)', color: 'white' }}
              >
                전략 제안 생성하기 <Sparkles size={18} />
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default BriefForm;
