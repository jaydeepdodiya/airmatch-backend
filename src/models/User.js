const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    uid: { type: String, required: true, unique: true, index: true },
    displayName: { type: String, default: 'Traveler' },
    email: { type: String, default: '' },
    photoUrl: { type: String, default: null },
    emailVerified: { type: Boolean, default: false },
    languages: { type: [String], default: [] },
    onboardingCompleted: { type: Boolean, default: false },
    fcmTokens: { type: [String], default: [] },
    trustScore: { type: Number, default: 0.5 },
  },
  { timestamps: true },
);

module.exports = mongoose.model('User', userSchema);
