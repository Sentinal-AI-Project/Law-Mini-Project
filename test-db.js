require('dotenv').config();
const supabase = require('./src/config/supabase');

async function check() {
  console.log('--- Database Check ---');
  try {
    const { data: users, error: userError } = await supabase.from('users').select('*').limit(1);
    if (userError) throw userError;
    console.log('✅ Connection Sucessful! Found:', users.length, 'users');
    
    const { data: docs, error: docError } = await supabase.from('documents').select('*').limit(1);
    if (docError) throw docError;
    console.log('✅ Documents table accessible. Found:', docs.length, 'docs');
    
    // Flush if needed? User asked: "flush and check"
    // Caution: I'll clear findings for test but not users.
    const { error: flushError } = await supabase.from('findings').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (flushError) console.error('❌ Flush failed:', flushError.message);
    else console.log('✅ Findings table flushed.');
  } catch (err) {
    console.error('❌ Database Test Failed:', err.message);
  }
}

check();
