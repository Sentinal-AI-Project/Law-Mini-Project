const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkColumns() {
  const { data, error } = await supabase.from('findings').select('*').limit(1);
  if (error) {
    console.error('Error fetching findings:', error);
    return;
  }
  if (data.length > 0) {
    console.log('Columns in findings table:', Object.keys(data[0]));
  } else {
    console.log('No findings found to check columns.');
    // Try to get table info via RPC or just try a select with the new column
    const { error: colError } = await supabase.from('findings').select('suggested_fix').limit(1);
    if (colError) {
      console.log('Column "suggested_fix" does NOT exist or error:', colError.message);
    } else {
      console.log('Column "suggested_fix" EXISTS.');
    }
  }
}

checkColumns();
