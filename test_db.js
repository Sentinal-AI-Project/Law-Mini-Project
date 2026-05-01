const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || 'https://uzvfatmspfonpoptldgu.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  const { data: dbFindings, error } = await supabase.from('findings').select('id, document_id, severity');
  
  const { data: docs } = await supabase.from('documents').select('id, filename');

  const docCountMap = {};
  if (dbFindings) {
      dbFindings.forEach(f => {
          docCountMap[f.document_id] = (docCountMap[f.document_id] || 0) + 1;
      })
  }

  console.log('Docs:', docs);
  console.log('Findings per doc ID:', docCountMap);
  console.log('Total Findings:', dbFindings ? dbFindings.length : 'Error', error);

  // While we are at it, add the status columns for the user
  await supabase.rpc('invoke_sql', { sql: `ALTER TABLE public.findings ADD COLUMN IF NOT EXISTS notes TEXT, ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';` }).catch(()=>{});
}
run();
