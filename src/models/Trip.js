const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    airportIata: { type: String, required: true },
    terminal: { type: String, default: null },
    arrivalAt: { type: Date, required: true },
    destinationLabel: { type: String, required: true },
    destinationLat: { type: Number, required: true },
    destinationLng: { type: Number, required: true },
    partySize: { type: Number, required: true },
    luggage: { type: String, default: 'carry_on' },
    vehiclePref: { type: String, default: 'economy' },
    status: { type: String, default: 'SEARCHING', index: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Trip', tripSchema);
