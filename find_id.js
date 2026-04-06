const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL || 'https://uzvfatmspfonpoptldgu.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function findID() {
  const targetId = '359515ea-cb1a-4f8f-aa97-119a278c4691';
  console.log(`Searching for ID: ${targetId}`);
  const { data, error } = await supabase.from('findings').select('id').eq('id', targetId).maybeSingle();
  if (error) console.error('Error:', error);
  if (data) {
      console.log('ID FOUND!');
  } else {
      console.log('ID NOT FOUND IN DATABASE.');
      const { data: others } = await supabase.from('findings').select('id').limit(5);
      console.log('Sample IDs from DB:', others.map(o => o.id));
  }
}
findID();
