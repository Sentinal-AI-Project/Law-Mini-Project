const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const supabase = require('../config/supabase');

const normalizeUser = (row) => ({
    id: row.id,
    _id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    created_at: row.created_at,
});

/**
 * POST /api/auth/register
 * Register a new user
 */
exports.register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        const normalizedEmail = String(email || '').trim().toLowerCase();
        const { data: existingUser, error: findError } = await supabase
            .from('users')
            .select('id')
            .eq('email', normalizedEmail)
            .maybeSingle();

        if (findError) {
            throw findError;
        }

        if (existingUser) {
            return res.status(409).json({ message: 'Email already registered' });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const allowedRoles = ['admin', 'analyst', 'viewer'];
        const userRole = allowedRoles.includes(role) ? role : 'analyst';

        const { data: user, error: insertError } = await supabase
            .from('users')
            .insert({
                name,
                email: normalizedEmail,
                password_hash: passwordHash,
                role: userRole,
            })
            .select('id, name, email, role, created_at')
            .single();

        if (insertError) {
            throw insertError;
        }

        // 2. Automatically initialize public.profiles (Profile Sync)
        const { error: profileError } = await supabase
            .from('profiles')
            .insert({
                id: user.id,
                full_name: name,
                email: normalizedEmail,
                avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
            });

        if (profileError) {
            console.warn('Profile initialization failed, but user was created:', profileError);
            // We don't throw here to avoid blocking registration if profiles table is missing/restricted
        }


        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            token,
            user: normalizeUser(user),
        });
    } catch (err) {
        if (String(err.message || '').toLowerCase().includes('duplicate')) {
            return res.status(409).json({ message: 'Email already registered' });
        }
        res.status(500).json({ message: 'Registration failed', error: err.message });
    }
};

/**
 * POST /api/auth/login
 * Login and receive JWT
 */
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const normalizedEmail = String(email).trim().toLowerCase();
        const { data: user, error } = await supabase
            .from('users')
            .select('id, name, email, role, password_hash, created_at')
            .eq('email', normalizedEmail)
            .maybeSingle();

        if (error) {
            throw error;
        }

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            token,
            user: normalizeUser(user),
        });
    } catch (err) {
        res.status(500).json({ message: 'Login failed', error: err.message });
    }
};

/**
 * GET /api/auth/me
 * Get current authenticated user's profile
 */
exports.getMe = async (req, res) => {
    try {
        const { data: user, error } = await supabase
            .from('users')
            .select('id, name, email, role, created_at')
            .eq('id', req.user.id)
            .maybeSingle();

        if (error) {
            throw error;
        }

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ user: normalizeUser(user) });
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch profile', error: err.message });
    }
};
/**
 * POST /api/auth/change-password
 * Change current user's password
 */
exports.changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return res.status(400).json({ message: 'Current and new passwords are required' });
        }

        // Fetch current user with password hash
        const { data: user, error: findError } = await supabase
            .from('users')
            .select('id, password_hash')
            .eq('id', req.user.id)
            .maybeSingle();

        if (findError) throw findError;
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Verify old password
        const isMatch = await bcrypt.compare(oldPassword, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Incorrect current password' });
        }

        // Hash and update new password
        const newHash = await bcrypt.hash(newPassword, 10);
        const { error: updateError } = await supabase
            .from('users')
            .update({ password_hash: newHash })
            .eq('id', req.user.id);

        if (updateError) throw updateError;

        // Log password change activity
        const userController = require('./user.controller');
        await userController.logActivity(req.user.id, 'Password Changed');

        res.json({ message: 'Password updated successfully' });

    } catch (err) {
        res.status(500).json({ message: 'Failed to change password', error: err.message });
    }
};

/**
 * DELETE /api/auth/account
 * Delete current user's account and all associated data (including storage files)
 */
exports.deleteAccount = async (req, res) => {
    try {
        const userId = req.user.id;

        // 1. Log account deletion activity (Log BEFORE deletion to avoid FK constraint issues)
        const userController = require('./user.controller');
        try {
            await userController.logActivity(userId, 'Account Deletion Requested');
        } catch (logErr) {
            console.warn('Final activity log failed, continuing with deletion:', logErr.message);
        }

        // 2. Fetch all documents to clean up Supabase storage
        // Even though DB records cascade delete, we must manually remove physical files from buckets
        const { data: docs, error: fetchDocsError } = await supabase
            .from('documents')
            .select('source_url')
            .eq('upload_user_id', userId);

        if (!fetchDocsError && docs && docs.length > 0) {
            const storagePaths = docs
                .map(doc => {
                    const urlParts = doc.source_url?.split('/documents/');
                    return urlParts && urlParts.length > 1 ? decodeURIComponent(urlParts[1]) : null;
                })
                .filter(path => path !== null);

            if (storagePaths.length > 0) {
                const { error: storageError } = await supabase.storage
                    .from('documents')
                    .remove(storagePaths);
                
                if (storageError) {
                    console.warn(`Failed to cleanup storage for user ${userId}:`, storageError.message);
                }
            }
        }

        // 3. Delete the user (This triggers ON DELETE CASCADE in the database for docs, findings, reports)
        const { error } = await supabase
            .from('users')
            .delete()
            .eq('id', userId);

        if (error) throw error;

        res.json({ message: 'Account and all associated documents and reports deleted successfully' });

    } catch (err) {
        console.error('Delete Account Error:', err);
        res.status(500).json({ message: 'Failed to delete account', error: err.message });
    }
};
