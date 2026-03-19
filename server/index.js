const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');
const { OpenAI } = require('openai');

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.use(cors());
app.use(express.json());

// Helper to update job status in Supabase
async function updateJobProgress(jobId, status, { preview = null, result = null, error = null } = {}) {
  try {
    // First, get the current job data to preserve stage_previews
    const { data: job, error: fetchError } = await supabase
      .from('generation_jobs')
      .select('stage_previews')
      .eq('id', jobId)
      .single();

    if (fetchError) {
      console.error(`[Supabase Fetch Error] Job ID ${jobId}:`, fetchError.message);
    }

    const currentPreviews = job?.stage_previews || {};
    const updateData = {
      status,
      updated_at: new Date().toISOString()
    };

    if (preview) {
      updateData.stage_previews = {
        ...currentPreviews,
        [status]: preview
      };
    }

    if (result) {
      updateData.final_proposal = result;
    }

    if (error) {
      updateData.error_message = error;
    }

    const { error: updateError } = await supabase
      .from('generation_jobs')
      .update(updateData)
      .eq('id', jobId);

    if (updateError) {
      console.error(`[Supabase Update Error] Job ID ${jobId}:`, updateError.message);
    }
  } catch (err) {
    console.error('Unexpected error in updateJobProgress:', err);
  }
}

async function callAI(prompt, systemPrompt = "당신은 전문 광고 전략 기획자입니다. 모든 응답은 JSON 형식으로만 출력하세요.") {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: prompt }
    ],
    response_format: { type: "json_object" }
  });
  return JSON.parse(response.choices[0].message.content);
}

app.post('/generate-strategy', async (req, res) => {
  const briefData = req.body;
  const jobId = briefData.job_id;

  if (!jobId) {
    return res.status(400).json({ error: 'Job ID is required' });
  }

  // Acknowledge the request immediately
  res.json({ success: true, message: 'Strategy generation started' });

  // Save input_briefing at the start so we can use it for regeneration later
  supabase.from('generation_jobs').update({ input_briefing: briefData }).eq('id', jobId).then(({ error }) => {
    if (error) console.error(`[Supabase Save Brief Error] Job ID ${jobId}:`, error.message);
  });

  // Start background processing
  (async () => {
    try {
      const { 
        client_name, 
        category, 
        sub_category, 
        campaign_objective, 
        monthly_budget, 
        campaign_period,
        target_age,
        target_gender,
        available_channels,
        special_notes,
        required_deliverables
      } = briefData;

      const context = `
클라이언트: ${client_name}
카테고리: ${category} (${sub_category})
목표: ${campaign_objective}
예산: 월 ${monthly_budget}만원
기간: ${campaign_period}
타겟: ${target_age} (${target_gender})
가용 채널: ${available_channels}
주요 요청사항: ${special_notes}
필요 산출물: ${required_deliverables}
      `;

      // --- STAGE 1: Market Research ---
      console.log(`[Job ${jobId}] Stage 1: Market Research`);
      await updateJobProgress(jobId, 'market_research', { preview: '시장 트렌드 및 지표 분석 중...' });
      
      const marketResult = await callAI(`
        다음 브리핑 내용을 바탕으로 시장 분석을 수행하세요.
        ${context}
        
        응답 형식:
        {
          "summary": "시장 상황 한 줄 요약",
          "dataPreview": "사용자에게 보여줄 구체적인 데이터 수집 결과 (예: '2024년 1분기 카테고리 검색량 전년 대비 18.5% 증가 확인')",
          "points": ["핵심 지표 1", "핵심 지표 2", "핵심 지표 3"]
        }
      `);
      await updateJobProgress(jobId, 'market_research', { preview: marketResult.dataPreview || marketResult.summary });

      // --- STAGE 2: Competitor Analysis ---
      console.log(`[Job ${jobId}] Stage 2: Competitor Analysis`);
      await updateJobProgress(jobId, 'competitor_analysis', { preview: '경쟁사 광고 전략 및 점유율 분석 중...' });
      
      const competitorResult = await callAI(`
        다음 브리핑 및 시장 상황을 바탕으로 경쟁사 분석을 수행하세요.
        브리핑: ${context}
        시장상황: ${marketResult.summary}
        
        응답 형식:
        {
          "directCompetitors": ["경쟁사A", "경쟁사B"],
          "competitorAnalysis": "주요 경쟁사들의 전략 패턴 분석 내용",
          "dataPreview": "사용자에게 보여줄 구체적인 경쟁 분석 데이터 (예: '상위 3개사 평균 SOV 65% 점유 중, 공격적 BS 소재 확인')",
          "ourOpportunity": "우리의 기회 요인 및 차별화 지점"
        }
      `);
      await updateJobProgress(jobId, 'competitor_analysis', { preview: competitorResult.dataPreview || `기회 요인: ${competitorResult.ourOpportunity?.substring(0, 30)}...` });

      // --- STAGE 3: Target Analysis ---
      console.log(`[Job ${jobId}] Stage 3: Target Analysis`);
      await updateJobProgress(jobId, 'target_analysis', { preview: '페르소나 설계 및 라이프스타일 분석 중...' });
      
      const targetResult = await callAI(`
        다음 데이터를 바탕으로 세부 타겟 페르소나를 설계하세요.
        브리핑: ${context}
        
        응답 형식:
        {
          "statement": "타겟에 대한 한 줄 인사이트",
          "dataPreview": "사용자에게 보여줄 구체적인 타겟 인사이트 (예: '3040 직장인 남성, 주말 야외활동 빈도 42% 증가 페르소나 도출')",
          "targetPersona": {
            "name": "페르소나 이름",
            "demographics": "인구통계학적 특성",
            "painPoints": ["고민점 1", "고민점 2"],
            "motivations": ["구매 동기 1", "구매 동기 2"]
          }
        }
      `);
      await updateJobProgress(jobId, 'target_analysis', { preview: targetResult.dataPreview || `핵심 타겟: ${targetResult.targetPersona.name}` });

      // --- STAGE 4: Media Simulation ---
      console.log(`[Job ${jobId}] Stage 4: Media Simulation`);
      await updateJobProgress(jobId, 'media_simulation', { preview: '매체 도달 범위 및 예산 최적 배분 중...' });
      
      const mediaResult = await callAI(`
        가용 채널(${Array.isArray(available_channels) ? available_channels.join(', ') : available_channels})과 예산(월 ${monthly_budget}만원)을 바탕으로 미디어 믹스를 시뮬레이션하세요.
        목표: ${campaign_objective}
        
        응답 형식:
        {
          "distribution": "예산 배분 전략 설명",
          "dataPreview": "사용자에게 보여줄 미디어 효율 데이터 (예: '예산 배분 최적화로 예상 CPC 15% 절감 및 도달 범위 120만 명 확보')",
          "expectedReach": "예상 도달 범위"
        }
      `);
      await updateJobProgress(jobId, 'media_simulation', { preview: mediaResult.dataPreview || `예상 도달: ${mediaResult.expectedReach}` });

      // --- STAGE 5: Narrative Generation ---
      console.log(`[Job ${jobId}] Stage 5: Narrative Generation`);
      await updateJobProgress(jobId, 'narrative_generation', { preview: '제안서 슬라이드 및 KPI 설정 중...' });
      
      const finalResult = await callAI(`
        모든 분석을 종합하여 최종 제안서 슬라이드(최소 6개)와 KPI를 생성하세요.
        브리핑: ${context}
        시장: ${marketResult.summary}
        경쟁: ${competitorResult.ourOpportunity}
        인사이트: ${targetResult.statement}
        
        응답 형식:
        {
          "coreStrategy": "핵심 캠페인 슬로건/컨셉",
          "dataPreview": "최종 제안 구성 완료 (슬라이드 6장 및 핵심 KPI 수립 완료)",
          "pillars": [
            {"title": "전략축 1", "description": "설명"},
            {"title": "전략축 2", "description": "설명"},
            {"title": "전략축 3", "description": "설명"}
          ],
          "proposalSlides": [
            {"title": "슬라이드 제목", "content": ["내용 1", "내용 2"], "visual_guidelines": "이미지/톤앤매너 가이드"}
          ],
          "kpi": {
            "primary": "최우선 목표 수치",
            "secondaryMetrics": ["보조 지표 1", "보조 지표 2"]
          }
        }
      `);

      // Final Assembly
      const fullProposal = {
        client_name,
        executive_summary: {
          coreStrategy: finalResult.coreStrategy,
          pillars: finalResult.pillars,
          summary: marketResult.summary
        },
        market_analysis: marketResult,
        competitor_analysis: competitorResult,
        target_matrix: {
          insight: targetResult.statement,
          persona: targetResult.targetPersona
        },
        key_message: {
          pillars: finalResult.pillars
        },
        media_simulation: mediaResult,
        creative_direction: {
          slides: finalResult.proposalSlides
        },
        generated_at: new Date().toISOString()
      };

      await updateJobProgress(jobId, 'done', { result: fullProposal, preview: '모든 전략 수립 완료' });
      console.log(`[Job ${jobId}] Processing completed successfully.`);

    } catch (error) {
      console.error(`[Job ${jobId}] Error during processing:`, error);
      await updateJobProgress(jobId, 'error', { error: error.message });
    }
  })();
});

app.post('/regenerate-section', async (req, res) => {
  const { jobId, sectionId } = req.body;

  if (!jobId || !sectionId) {
    return res.status(400).json({ error: 'Job ID and Section ID are required' });
  }

  try {
    // 1. Fetch current job (briefing + existing proposal)
    const { data: job, error: fetchError } = await supabase
      .from('generation_jobs')
      .select('input_briefing, final_proposal')
      .eq('id', jobId)
      .single();

    if (fetchError || !job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const briefData = job.input_briefing;
    const currentProposal = job.final_proposal;

    if (!briefData) {
      return res.status(400).json({ error: 'Original briefing data not found. Cannot regenerate.' });
    }

    res.json({ success: true, message: `Regenerating ${sectionId}...` });

    // 2. Perform background regeneration for the specific section
    (async () => {
      try {
        const context = `
클라이언트: ${briefData.client_name}
카테고리: ${briefData.category} (${briefData.sub_category})
전체 목표: ${briefData.campaign_objective}
        `;

        let sectionPrompt = "";
        let sectionKey = sectionId;

        // Map sectionId to specific AI prompts
        switch (sectionId) {
          case 'market_analysis':
            sectionPrompt = `다음 브리핑을 바탕으로 시장 분석을 새롭고 더 깊이 있게 수행하세요.\n${context}`;
            break;
          case 'competitor_analysis':
            sectionPrompt = `다음 브리핑을 바탕으로 경쟁사 분석을 더 공격적이고 차별화되게 수행하세요.\n${context}`;
            break;
          case 'target_matrix':
            sectionPrompt = `다음 브리핑을 바탕으로 타겟 페르소나와 세그먼트 매트릭스를 더 정교하게 재구성하세요.\n${context}`;
            break;
          default:
            sectionPrompt = `다음 브리핑을 바탕으로 '${sectionId}' 섹션에 대한 새로운 전략적 제안을 생성하세요.\n${context}`;
        }

        const newSectionData = await callAI(`${sectionPrompt}\n결과는 해당 섹션의 기존 데이터 구조와 동일한 JSON 형식으로 응답하세요.`);
        
        // 3. Update only the targeted section in the proposal
        const updatedProposal = {
          ...currentProposal,
          [sectionKey]: newSectionData,
          updated_at: new Date().toISOString()
        };

        await supabase
          .from('generation_jobs')
          .update({ final_proposal: updatedProposal })
          .eq('id', jobId);
          
        console.log(`[Job ${jobId}] Section ${sectionId} regenerated and updated successfully.`);
      } catch (err) {
        console.error(`[Job ${jobId}] Failed to regenerate section ${sectionId}:`, err);
      }
    })();

  } catch (error) {
    console.error('Error in regenerate-section:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Backend server running at http://localhost:${port}`);
});
