const mongoose = require('mongoose');

const matchRequestSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    fromTripId: { type: String, required: true, index: true },
    toTripId: { type: String, required: true, index: true },
    fromUserId: { type: String, required: true, index: true },
    toUserId: { type: String, required: true, index: true },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined'],
      default: 'pending',
      index: true,
    },
    score: { type: Number, default: 0 },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model('MatchRequest', matchRequestSchema);
