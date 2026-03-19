const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'server/.env' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkSchema() {
  const { data, error } = await supabase
    .from('generation_jobs')
    .select('*')
    .limit(1);
  
  if (error) {
    console.error('Error fetching job:', error);
    return;
  }
  
  console.log('Columns in generation_jobs:', Object.keys(data[0] || {}));
}

checkSchema();
