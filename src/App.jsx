import React, { useState } from 'react';
import BriefForm from './components/BriefForm';
import Dashboard from './components/Dashboard';
import LoadingProgress from './components/LoadingProgress';
import { supabase } from './services/supabase';

function App() {
  const [step, setStep] = useState('form'); // 'form' | 'loading' | 'dashboard'
  const [currentJobId, setCurrentJobId] = useState(null);
  const [jobData, setJobData] = useState(null);

  // Multi-Step Realtime Sync
  React.useEffect(() => {
    if (!currentJobId) return;

    const subscription = supabase
      .channel(`job-sync-${currentJobId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'generation_jobs',
        filter: `id=eq.${currentJobId}`
      }, (payload) => {
        const newData = payload.new;
        setJobData(newData);
        
        if (newData.status === 'done' && step === 'loading') {
          setStep('dashboard');
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [currentJobId, step]);

  const handleGenerate = async (briefData) => {
    setStep('loading');
    setJobData({ status: 'pending' });
    
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id || null;

      const { data, error } = await supabase
        .from('generation_jobs')
        .insert([{
          user_id: userId,
          status: 'pending',
          input_briefing: briefData
        }])
        .select()
        .single();

      if (error) throw error;
      
      setCurrentJobId(data.id);
      setJobData(data);

      const { generateStrategy } = await import('./services/ai.js');
      await generateStrategy({
        ...briefData,
        job_id: data.id 
      });

    } catch (error) {
      handleError(error);
    }
  };

  const handleReset = () => {
    setJobData(null);
    setCurrentJobId(null);
    setStep('form');
  };

  const handleError = (error) => {
    console.error('Core Error:', error);
    alert(error.message || '오류가 발생했습니다.');
    setStep('form');
  };

  return (
    <div className="app-container">
      {step === 'form' && (
        <BriefForm onSubmit={handleGenerate} />
      )}
      
      {step === 'loading' && currentJobId && (
        <LoadingProgress 
          jobId={currentJobId} 
          jobData={jobData}
          onError={handleError} 
        />
      )}

      {step === 'dashboard' && jobData?.final_proposal && (
        <Dashboard 
          data={jobData.final_proposal} 
          jobId={currentJobId}
          onReset={handleReset} 
        />
      )}
    </div>
  );
}

export default App;
