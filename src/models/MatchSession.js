const mongoose = require('mongoose');

const matchSessionSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    matchRequestId: { type: String, required: true, unique: true, index: true },
    fromTripId: { type: String, required: true },
    toTripId: { type: String, required: true },
    participantIds: { type: [String], required: true, index: true },
    status: { type: String, default: 'active' },
  },
  { timestamps: true },
);

module.exports = mongoose.model('MatchSession', matchSessionSchema);
