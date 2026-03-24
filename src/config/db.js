const supabase = require('./supabase');

const connectDB = async () => {
  try {
    // Lightweight check to ensure the Supabase client is initialized and credentials are valid.
    const { error } = await supabase.from('users').select('id', { head: true, count: 'exact' }).limit(1);
    if (error) {
      throw error;
    }
    console.log('Supabase connection verified');
  } catch (error) {
    console.error(`Supabase connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
