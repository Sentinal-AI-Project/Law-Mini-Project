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
 * PUT /api/user/profile
 * Update current user's profile details
 */
exports.updateProfile = async (req, res) => {
    try {
        const { name, phone, department } = req.body;
        
        const updates = {};
        if (name) updates.name = name;
        if (phone) updates.phone = phone;
        if (department) updates.department = department;

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ message: 'No fields to update' });
        }

        const { data: user, error } = await supabase
            .from('users')
            .update(updates)
            .eq('id', req.user.id)
            .select('id, name, email, role, phone, department, created_at')
            .single();

        if (error) throw error;

        // Log the change
        try {
            await exports.logActivity(req.user.id, 'Profile Updated', {
                fields: Object.keys(updates),
                at: new Date().toISOString()
            });
        } catch (logErr) {
            console.warn('Logging failed but profile updated:', logErr.message);
            // We return success for the profile but include the log warning
            return res.json({ 
                message: 'Profile updated, but activity log failed. Check backend console.', 
                user,
                logWarning: logErr.message
            });
        }

        res.json({ message: 'Profile updated and logged successfully', user });
    } catch (err) {
        console.error('updateProfile Error:', err);
        res.status(500).json({ message: 'Failed to update profile', error: err.message });
    }
};

/**
 * POST /api/user/activity
 * Log a new activity (Internal use or specific actions)
 */
exports.logActivity = async (userId, action, details) => {
    try {
        const { error } = await supabase
            .from('audit_logs')
            .insert({
                user_id: userId,
                action,
                details: typeof details === 'object' ? details : { info: details },
                created_at: new Date().toISOString()
            });
        
        if (error) {
            console.error('LogActivity Insert Error:', error.message, error.details);
            throw new Error(`Failed to log activity: ${error.message}`);
        }
    } catch (err) {
        console.error('Audit Log Runtime Error:', err.message);
        throw err;
    }
};

