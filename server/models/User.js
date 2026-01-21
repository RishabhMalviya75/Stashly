/**
 * User Model
 * ==========
 * Defines the User schema for MongoDB using Mongoose.
 * 
 * 📚 LEARNING POINTS:
 * 
 * 1. SCHEMA DESIGN: We define the shape of our documents. Mongoose validates
 *    data before saving to ensure consistency.
 * 
 * 2. PASSWORD SECURITY: We NEVER store plain text passwords!
 *    - We use bcrypt to hash passwords (one-way encryption)
 *    - Even if database is compromised, passwords can't be reversed
 * 
 * 3. PRE-SAVE HOOKS: Mongoose middleware that runs before saving.
 *    Perfect for hashing passwords automatically.
 * 
 * 4. INSTANCE METHODS: Custom methods on each document instance.
 *    We add comparePassword() for login verification.
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    // Authentication fields
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true, // Automatically convert to lowercase
        trim: true,      // Remove whitespace
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
    },

    passwordHash: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters'],
        select: false // Don't include in queries by default (security!)
    },

    // Profile fields
    displayName: {
        type: String,
        required: [true, 'Display name is required'],
        trim: true,
        maxlength: [50, 'Display name cannot exceed 50 characters']
    },

    avatar: {
        type: String,
        default: null // URL to avatar image
    },

    // OAuth fields (for future Google/GitHub login)
    authProvider: {
        type: String,
        enum: ['local', 'google', 'github'],
        default: 'local'
    },

    authProviderId: {
        type: String,
        default: null
    },

    // User preferences
    settings: {
        theme: {
            type: String,
            enum: ['light', 'dark', 'system'],
            default: 'system'
        },
        defaultView: {
            type: String,
            enum: ['list', 'grid'],
            default: 'list'
        },
        notificationsEnabled: {
            type: Boolean,
            default: true
        }
    },

    // Storage tracking (for quotas)
    storageUsed: {
        type: Number,
        default: 0 // in bytes
    },

    storageLimit: {
        type: Number,
        default: 104857600 // 100MB in bytes
    },

    // Password reset fields
    resetPasswordToken: String,
    resetPasswordExpires: Date,

    // Timestamps
    lastLoginAt: {
        type: Date,
        default: null
    }
}, {
    // Mongoose automatically adds createdAt and updatedAt
    timestamps: true
});

/**
 * PRE-SAVE MIDDLEWARE
 * Runs before every save() operation
 * 
 * 📚 Why we check isModified('passwordHash'):
 * - Only hash if password actually changed
 * - Prevents re-hashing an already hashed password
 */
userSchema.pre('save', async function (next) {
    // 'this' refers to the document being saved
    if (!this.isModified('passwordHash')) {
        return next();
    }

    try {
        // Generate a salt (random data to make hash unique)
        // Cost factor of 12 is recommended for production
        const salt = await bcrypt.genSalt(12);

        // Hash the password with the salt
        this.passwordHash = await bcrypt.hash(this.passwordHash, salt);

        next();
    } catch (error) {
        next(error);
    }
});

/**
 * INSTANCE METHOD: Compare Password
 * Used during login to verify the entered password
 * 
 * 📚 How bcrypt.compare works:
 * - It extracts the salt from the stored hash
 * - Hashes the input password with that salt
 * - Compares the two hashes
 * - Returns true if they match, false otherwise
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
    // We need to explicitly select passwordHash since it's hidden by default
    const user = await this.constructor.findById(this._id).select('+passwordHash');
    return bcrypt.compare(candidatePassword, user.passwordHash);
};

/**
 * STATIC METHOD: Find by email
 * Convenience method to find user by email
 */
userSchema.statics.findByEmail = function (email) {
    return this.findOne({ email: email.toLowerCase() });
};

// Create and export the model
const User = mongoose.model('User', userSchema);

module.exports = User;
