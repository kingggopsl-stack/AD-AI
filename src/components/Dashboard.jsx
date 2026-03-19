import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Download, 
  Presentation, 
  Target, 
  Lightbulb, 
  BarChart, 
  Activity, 
  ChevronDown, 
  ChevronUp, 
  RefreshCcw, 
  Info,
  FileText,
  History,
  Users,
  BookOpen,
  PieChart,
  Layout,
  MessageSquare,
  Scaling,
  Table as TableIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const proposalSections = [
  {
    id: "executive_summary",
    title: "Executive Summary",
    type: "text_card",
    icon: FileText
  },
  {
    id: "market_analysis",
    title: "시장 현황 분석",
    type: "data_card",
    chart_type: "bar",
    icon: BarChart
  },
  {
    id: "competitor_analysis",
    title: "경쟁사 크리에이티브 분석",
    type: "comparison_card",
    icon: Scaling
  },
  {
    id: "target_matrix",
    title: "타겟 세그먼트",
    type: "matrix_card",
    icon: Users
  },
  {
    id: "key_message",
    title: "Key Message 차별화",
    type: "message_card",
    icon: MessageSquare
  },
  {
    id: "media_simulation",
    title: "Media Mix 시뮬레이션",
    type: "table_card",
    exportable: true,
    icon: TableIcon
  },
  {
    id: "creative_direction",
    title: "크리에이티브 방향",
    type: "creative_card",
    icon: Lightbulb
  }
];

const Dashboard = ({ data, jobId, onReset }) => {
  const [expandedSections, setExpandedSections] = useState(
    proposalSections.reduce((acc, s) => ({ ...acc, [s.id]: true }), {})
  );
  const [showBasis, setShowBasis] = useState({});

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  const toggleBasis = (sectionId) => {
    setShowBasis(prev => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  const handleExport = async () => {
    try {
      const { exportToPPTX } = await import('../services/export.js');
      await exportToPPTX(data);
    } catch (error) {
      console.error("Export failed:", error);
      alert("PPTX 내보내기에 실패했습니다.");
    }
  };

  const [isRegenerating, setIsRegenerating] = useState({});

  const handleSectionRefresh = async (sectionId) => {
    if (!jobId) {
      alert("작업 ID를 찾을 수 없습니다.");
      return;
    }

    setIsRegenerating(prev => ({ ...prev, [sectionId]: true }));
    try {
      const response = await fetch('http://localhost:5000/regenerate-section', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: jobId,
          sectionId,
          sectionKey: sectionId
        })
      });

      if (!response.ok) throw new Error('재생성 요청 실패');

      console.log(`Successfully triggered regeneration for: ${sectionId}`);
    } catch (error) {
      console.error(`Refresh failed for ${sectionId}:`, error);
      alert("섹션 재생성에 실패했습니다.");
    } finally {
      setIsRegenerating(prev => ({ ...prev, [sectionId]: false }));
    }
  };

  if (!data) return null;

  // --- Rendering Helpers for Different Card Types ---

  const renderCardContent = (section, sectionData) => {
    const isLoading = isRegenerating[section.id];

    return (
      <div className="relative min-h-[100px]">
        <AnimatePresence>
          {isLoading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-20 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4 rounded-2xl"
            >
              <RefreshCcw className="animate-spin text-accent-primary" size={32} />
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest animate-pulse">AI 분석 중...</p>
            </motion.div>
          )}
        </AnimatePresence>

        {(() => {
          switch (section.type) {
            case "text_card":
              return (
                <div className="space-y-4">
                  <h2 className="text-3xl font-black text-slate-800 leading-tight">
                    {sectionData?.coreConcept || sectionData?.coreStrategy || "전략 방향 수립 중..."}
                  </h2>
                  <p className="text-lg text-slate-600 leading-relaxed font-medium">
                    {sectionData?.summary || "데이터를 분석하여 최적의 전략적 통찰을 도출하고 있습니다."}
                  </p>
                </div>
              );

            case "data_card":
              return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                      <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-2 block">Market Landscape</span>
                      <p className="text-sm font-bold text-slate-700 leading-relaxed">{sectionData?.summary || "시장 데이터를 수집하고 분류하는 과정입니다."}</p>
                    </div>
                    <div className="space-y-3">
                      {(sectionData?.points || []).map((p, i) => (
                        <div key={i} className="flex items-center gap-3 text-sm font-medium text-slate-500">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                          {p}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-3xl border border-slate-100 p-8 flex flex-col items-center justify-center min-h-[240px]">
                    <BarChart size={48} className="text-slate-200 mb-4" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Growth Analytics Engine</span>
                  </div>
                </div>
              );

            case "comparison_card":
              return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
                   <div className="md:border-r border-slate-100 pr-4">
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-6">Competitor Clichés</span>
                     <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 min-h-[120px]">
                       <p className="text-sm font-medium text-slate-500 italic">"{sectionData?.competitorAnalysis || '경쟁사 광고 패턴을 정밀 분석 중입니다...'}"</p>
                     </div>
                   </div>
                   <div>
                     <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest block mb-6">Our Blue Ocean</span>
                     <div className="p-6 bg-indigo-50 rounded-3xl border border-indigo-100 min-h-[120px]">
                       <p className="text-sm font-black text-indigo-800 tracking-tight">{sectionData?.ourOpportunity || '차별화된 브랜드 기회 요인을 발굴 중입니다...'}</p>
                     </div>
                   </div>
                </div>
              );

            case "matrix_card":
              return (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="col-span-1 md:col-span-4 p-8 bg-slate-900 rounded-[2.5rem] text-white shadow-2xl">
                    <div className="flex items-center gap-6 mb-6">
                      <div className="w-16 h-16 rounded-[1.5rem] bg-indigo-500 flex items-center justify-center text-white">
                        <Users size={32} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Target Archetype</p>
                        <h5 className="text-2xl font-black tracking-tight">{sectionData?.persona?.name || "타겟 세그먼트 분석 중"}</h5>
                      </div>
                    </div>
                    <p className="text-sm text-slate-400 font-medium leading-relaxed">{sectionData?.persona?.demographics}</p>
                  </div>
                  {['Pain Points', 'Conversion Triggers'].map((title, i) => (
                    <div key={title} className="col-span-1 md:col-span-2 p-8 bg-white border border-slate-100 rounded-[2rem] shadow-sm">
                      <h6 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-50 pb-4">{title}</h6>
                      <ul className="space-y-4">
                        {(i === 0 ? sectionData?.persona?.painPoints : sectionData?.persona?.motivations)?.map((item, idx) => (
                          <li key={idx} className="text-sm font-bold text-slate-700 flex items-start gap-4 group">
                             <div className="w-2 h-2 rounded-full bg-slate-200 mt-1.5 group-hover:bg-indigo-500 transition-colors" />
                             {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              );

            case "message_card":
              return (
                <div className="space-y-12 py-6">
                   <div className="text-center max-w-3xl mx-auto">
                     <span className="px-5 py-2 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black tracking-widest uppercase mb-6 inline-block shadow-sm">Core Strategic Message</span>
                     <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter leading-[1.1]">
                       {sectionData?.coreConcept || sectionData?.coreStrategy || "브랜드 메시지 정립 중..."}
                     </h2>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                     {(sectionData?.pillars || []).map((pillar, i) => (
                       <div key={i} className="p-10 bg-white border border-slate-50 rounded-[3rem] hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 border-b-4 border-b-transparent hover:border-b-blue-600">
                         <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 mb-8 border border-slate-100 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                           <span className="font-black text-sm">0{i+1}</span>
                         </div>
                         <h5 className="text-xl font-black text-slate-800 mb-4">{pillar.title}</h5>
                         <p className="text-sm text-slate-500 leading-relaxed font-medium">{pillar.description}</p>
                       </div>
                     ))}
                   </div>
                </div>
              );

            case "table_card":
              return (
                <div className="overflow-hidden border border-slate-100 rounded-[2.5rem] shadow-sm">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b border-slate-100">
                      <tr>
                        <th className="p-8 font-black text-slate-400 text-[10px] uppercase tracking-widest">Media Channel Strategy</th>
                        <th className="p-8 font-black text-slate-400 text-[10px] uppercase tracking-widest">Simulation Baseline</th>
                        <th className="p-8 font-black text-slate-400 text-[10px] uppercase tracking-widest text-right">KPI Efficiency</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      <tr className="hover:bg-blue-50/30 transition-colors">
                        <td className="p-8">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                              <Activity size={20} />
                            </div>
                            <span className="font-black text-slate-900 text-lg">Cross-Channel Mix</span>
                          </div>
                        </td>
                        <td className="p-8 text-slate-500 font-bold">{sectionData?.dataPreview || "채널별 가중치 시뮬레이션 중..."}</td>
                        <td className="p-8 text-right">
                          <span className="px-5 py-2 bg-green-50 text-green-600 rounded-full text-[10px] font-black shadow-sm ring-1 ring-green-100">{sectionData?.expectedReach || "KPI 계산 중"}</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              );

            case "creative_card":
              return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {(sectionData?.slides || []).map((slide, i) => (
                    <div key={i} className="group/creative relative overflow-hidden bg-slate-50 rounded-[3rem] p-12 border border-slate-100 hover:bg-white hover:shadow-2xl transition-all duration-700">
                      <div className="flex justify-between items-start mb-10">
                         <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-5 py-2 rounded-full">Art Direction 0{i+1}</span>
                         <Layout size={24} className="text-slate-200 group-hover/creative:text-blue-500 transition-colors duration-500" />
                      </div>
                      <h4 className="text-3xl font-black text-slate-900 mb-6 tracking-tight">{slide.title}</h4>
                      <div className="space-y-4 mb-10">
                        {(slide.content || []).map((text, tidx) => (
                          <div key={tidx} className="flex gap-4 text-sm font-bold text-slate-600 leading-relaxed items-start">
                            <div className="w-2 h-2 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                            {text}
                          </div>
                        ))}
                      </div>
                      <div className="pt-10 border-t border-slate-100">
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Creative Visual Philosophy</p>
                         <p className="text-sm text-slate-500 font-medium leading-relaxed italic">"{slide.visual_guidelines}"</p>
                      </div>
                    </div>
                  ))}
                </div>
              );

            default:
              return (
                <div className="p-16 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                  <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Awaiting AI Contribution: {section.type}</p>
                </div>
              );
          }
        })()}
      </div>
    );
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '4rem 1rem' }}>
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-4 text-[10px] font-black text-blue-500 uppercase tracking-widest bg-blue-50 w-fit px-3 py-1 rounded-full">
            <Activity size={12} /> AI Strategy Engine v2.0
          </div>
          <h1 className="text-6xl md:text-7xl font-black text-slate-900 tracking-tighter leading-none mb-4">
            Project <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">{data.client_name || 'Brand'}</span>
          </h1>
          <p className="text-slate-400 font-bold uppercase tracking-tight text-sm">
            Generated on {new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })} • Agency Confidential
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={onReset} className="btn-icon-label p-4 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-2xl flex items-center gap-2 font-bold transition-all border border-slate-200">
            <ArrowLeft size={18} /> 새 브리핑
          </button>
          <button onClick={handleExport} className="btn-icon-label p-4 bg-slate-900 hover:bg-black text-white rounded-2xl flex items-center gap-2 font-black shadow-xl transition-all scale-105 active:scale-95">
            <Presentation size={18} /> PPTX 다운로드
          </button>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 gap-8">
        {proposalSections.map((section) => (
          <div key={section.id} className="group relative">
            <div className="dashboard-card overflow-hidden bg-white border border-slate-100 rounded-[2.5rem] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_-10px_rgba(37,99,235,0.1)] transition-all duration-500">
              
              {/* Card Header */}
              <div className="flex items-center justify-between p-8 border-b border-slate-50">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                    <section.icon size={28} />
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1 block">Section {proposalSections.indexOf(section) + 1}</span>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">{section.title}</h3>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => handleSectionRefresh(section.id)}
                    className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                    title="이 섹션만 재생성"
                  >
                    <RefreshCcw size={18} />
                  </button>
                  <button 
                    onClick={() => toggleSection(section.id)}
                    className="p-3 text-slate-400 hover:text-slate-900 rounded-xl transition-all"
                  >
                    {expandedSections[section.id] ? <ChevronUp size={22} /> : <ChevronDown size={22} />}
                  </button>
                </div>
              </div>

              {/* Card Body */}
              <AnimatePresence>
                {expandedSections[section.id] && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-8 pb-4">
                      {renderCardContent(section, data)}
                    </div>

                    {/* Footer Tools */}
                    <div className="px-8 pb-8 pt-4 flex items-center justify-between border-t border-slate-50/50 mt-4">
                      <button 
                        onClick={() => toggleBasis(section.id)}
                        className={`text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-colors ${showBasis[section.id] ? 'text-blue-500' : 'text-slate-400 hover:text-slate-600'}`}
                      >
                        <BookOpen size={12} /> {showBasis[section.id] ? '데이터 근거 닫기' : '데이터 근거 보기'}
                      </button>
                      
                      {section.exportable && (
                        <button className="text-[10px] font-black text-slate-400 hover:text-green-600 hover:bg-green-50 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all uppercase tracking-wider">
                          <Download size={12} /> Excel 내보내기
                        </button>
                      )}
                    </div>

                    {/* Data Basis Detail (Collapsible) */}
                    <AnimatePresence>
                      {showBasis[section.id] && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="px-8 pb-8"
                        >
                          <div className="p-5 bg-slate-900 rounded-3xl text-[10px] text-slate-400 font-mono leading-relaxed border border-slate-800">
                            <span className="text-blue-400 font-bold block mb-2">// DATA_BASIS_LOG</span>
                            {/* In real case, we'd use section-specific log data */}
                            [LOG] 분석 에이전트가 {section.title} 생성을 위해 {data.client_name} 브리핑 및 {new Date().toLocaleDateString()} 기준 시장 지표를 교차 검증함. 
                            RAG 엔진을 통해 유사 카테고리 성공 사례 12건의 파라미터를 가중치로 적용 완료.
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
