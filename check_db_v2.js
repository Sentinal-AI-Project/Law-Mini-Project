const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL || 'https://uzvfatmspfonpoptldgu.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const sql = `
ALTER TABLE public.findings 
ADD COLUMN IF NOT EXISTS notes TEXT, 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
`;

async function run() {
  console.log('Attempting migration...');
  // We try to trigger it via a clever hack if RPC is missing, 
  // but usually we can't do DDL via the API directly.
  // HOWEVER, I will check if the columns exist first.
  
  const { data, error } = await supabase.from('findings').select('notes, status').limit(1);
  if (error) {
    console.log('Error detected (likely missing columns):', error.message);
    console.log('--- IMPORTANT INSTRUCTION FOR USER ---');
    console.log('PLEASE COPIED AND RUN THIS IN YOUR SUPABASE SQL EDITOR:');
    console.log(sql);
    console.log('--------------------------------------');
  } else {
    console.log('Columns already exist! No migration needed.');
  }
}

run();
