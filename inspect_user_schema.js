const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function inspectProfile() {
  const { data: userData, error: userError } = await supabase.from('users').select('*').limit(1);
  if (userError) console.error('Users Error:', userError.message);
  else console.log('Users columns:', Object.keys(userData[0] || {}));

  const { data: profileData, error: profileError } = await supabase.from('profiles').select('*').limit(1);
  if (profileError) console.error('Profiles Error:', profileError.message);
  else console.log('Profiles columns:', Object.keys(profileData[0] || {}));
}
inspectProfile();
