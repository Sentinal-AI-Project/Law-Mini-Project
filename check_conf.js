const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL || 'https://uzvfatmspfonpoptldgu.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkConfidence() {
  const { data: findings } = await supabase.from('findings').select('confidence, severity');
  if (!findings) return console.log('No findings');
  
  const total = findings.length;
  const highConf = findings.filter(f => f.confidence >= 0.7).length;
  const lowConf = findings.filter(f => f.confidence < 0.7).length;

  console.log(`Total Findings in DB: ${total}`);
  console.log(`Findings with Confidence >= 0.7: ${highConf}`);
  console.log(`Findings with Confidence < 0.7: ${lowConf}`);
  
  const confs = findings.map(f => f.confidence).sort((a,b) => b-a);
  console.log('Top 10 Confidence values:', confs.slice(0, 10));
}
checkConfidence();
