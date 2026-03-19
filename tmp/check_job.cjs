const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../server/.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkLastJob() {
  const { data, error } = await supabase
    .from('generation_jobs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1);

  if (error) {
    console.error('Error fetching job:', error);
    return;
  }

  if (data && data.length > 0) {
    const job = data[0];
    console.log('--- Last Job Details ---');
    console.log('ID:', job.id);
    console.log('Status:', job.status);
    console.log('Stage Previews:', JSON.stringify(job.stage_previews, null, 2));
    console.log('Created At:', job.created_at);
  } else {
    console.log('No jobs found.');
  }
}

checkLastJob();
