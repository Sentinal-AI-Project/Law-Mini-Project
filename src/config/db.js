const supabase = require('./supabase');

const connectDB = async () => {
  try {
    console.log('Verifying Supabase connectivity...');
    const { error } = await supabase.from('users').select('id', { head: true, count: 'exact' }).limit(1);
    if (error) {
      throw new Error(`Database check failed: ${error.message}`);
    }
    console.log('✅ Supabase connection verified');
  } catch (error) {
    console.error(`❌ CRITICAL: Supabase connection error: ${error.message}`);
    // Optional: process.exit(1); 
  }
};

module.exports = connectDB;
