const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL || 'https://uzvfatmspfonpoptldgu.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function inspectTable() {
  // Get one row to see what we have
  const { data, error } = await supabase.from('findings').select('*').limit(1);
  if (error) {
      console.error('Error fetching one row:', error.message);
      // Try to list all columns via a system query if possible, but simpler is to try selecting them 
  } else if (data && data.length > 0) {
      console.log('Available columns in findings:', Object.keys(data[0]));
  } else {
      console.log('No rows in findings to check columns. Trying a broader select...');
      const { error: err2 } = await supabase.from('findings').select('explanation').limit(1);
      console.log('Explanation test:', err2 ? 'FAILED: ' + err2.message : 'PASSED');
      
      const { error: err3 } = await supabase.from('findings').select('description').limit(1);
      console.log('Description test:', err3 ? 'FAILED: ' + err3.message : 'PASSED');
      
      const { error: err4 } = await supabase.from('findings').select('notes').limit(1);
      console.log('Notes test:', err4 ? 'FAILED: ' + err4.message : 'PASSED');
      
      const { error: err5 } = await supabase.from('findings').select('status').limit(1);
      console.log('Status test:', err5 ? 'FAILED: ' + err5.message : 'PASSED');
  }
}
inspectTable();
