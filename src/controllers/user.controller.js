const supabase = require('../config/supabase');

/**
 * GET /api/user/activity
 * Get current user's activity logs
 */
exports.getActivity = async (req, res) => {
    try {
        const { data: logs, error } = await supabase
            .from('audit_logs')
            .select('*')
            .eq('user_id', req.user.id)
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) {
            // If the table doesn't exist, we'll return an empty list or a specific message
            if (error.code === '42P01') { // undefined_table
                return res.json({ 
                    activity: [], 
                    message: 'Audit logs table not found. Please run the SQL migration.',
                    needsMigration: true 
                });
            }
            throw error;
        }

        res.json({ activity: logs || [] });
    } catch (err) {
        console.error('getActivity Error:', err);
        res.status(500).json({ 
            message: 'Failed to fetch activity logs', 
            error: err.message,
            details: err.details 
        });
    }
};


/**
 * POST /api/user/activity
 * Log a new activity (Internal use or specific actions)
 */
exports.logActivity = async (userId, action, details) => {
    try {
        await supabase
            .from('audit_logs')
            .insert({
                user_id: userId,
                action,
                details,
                created_at: new Date().toISOString()
            });
    } catch (err) {
        console.error('Audit Log Error:', err.message);
    }
};
