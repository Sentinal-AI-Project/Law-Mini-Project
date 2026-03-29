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
