const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL || 'https://uzvfatmspfonpoptldgu.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkCols() {
  // Test which column is missing by trying them one by one or getting all
  const { data, error } = await supabase.from('findings').select('id, updated_at, notes, status').limit(1);
  if (error) {
      console.log('Error:', error.message);
  } else {
      console.log('All columns exist in the findings table!');
  }
}
checkCols();
