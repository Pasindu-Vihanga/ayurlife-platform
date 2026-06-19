import User from '../models/User.js';
import Doctor from '../models/Doctor.js';
import Patient from '../models/Patient.js';
import LoginActivity from '../models/LoginActivity.js';
import generateToken from '../utils/generateToken.js';
import bcrypt from 'bcryptjs';

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
        // Record login activity for doctors
        if (user.role === 'doctor') {
            try {
                await LoginActivity.create({
                    user: user._id,
                    role: user.role,
                    ipAddress: req.ip || req.connection?.remoteAddress || 'Unknown',
                    deviceInfo: req.headers['user-agent'] ? 
                        (req.headers['user-agent'].includes('Expo') || req.headers['user-agent'].includes('okhttp') ? 'Mobile App' : 'Web Browser') 
                        : 'Unknown Device',
                    loginTime: new Date(),
                    status: 'success'
                });
            } catch (logError) {
                console.error('Failed to log login activity:', logError);
            }
        }

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });
    } else {
        // Record failed login attempt if user exists but wrong password
        if (user && user.role === 'doctor') {
            try {
                await LoginActivity.create({
                    user: user._id,
                    role: user.role,
                    ipAddress: req.ip || req.connection?.remoteAddress || 'Unknown',
                    deviceInfo: req.headers['user-agent'] ? 
                        (req.headers['user-agent'].includes('Expo') || req.headers['user-agent'].includes('okhttp') ? 'Mobile App' : 'Web Browser') 
                        : 'Unknown Device',
                    loginTime: new Date(),
                    status: 'failed'
                });
            } catch (logError) {
                console.error('Failed to log failed login activity:', logError);
            }
        }
        res.status(401).json({ message: 'Invalid email or password' });
    }
};

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = async (req, res) => {
    const { name, email, password, role } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400).json({ message: 'User already exists' });
        return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
        name,
        email,
        password: hashedPassword,
        role
    });

    if (user) {
        // Auto-create relevant profile
        if (role === 'doctor') {
            await Doctor.create({
                user: user._id,
                licenseNumber: 'PENDING-' + Math.floor(Math.random() * 10000),
                specialization: 'Ayurveda General'
            });
        } else if (role === 'patient') {
            await Patient.create({
                user: user._id,
                prakruthi: 'Unknown'
            });
        } else if (role === 'supplier' || role === 'producer' || role === 'wellness_staff') {
            // These might need specific profile models later
            // For now, ensuring the user role is saved is enough
            console.log(`Professional user created: ${role}`);
        }

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });
    } else {
        res.status(400).json({ message: 'Invalid user data' });
    }
};

export { loginUser, registerUser };
