import mongoose from 'mongoose';

const leadExtractionSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  description: {
    type: String,
    required: true,
    default: 'Battery for Lead'
  },
  batteryWeight: {
    type: Number,
    required: true,
    min: 0
  },
  leadWeight: {
    type: Number,
    required: true,
    min: 0
  },
  leadReceived: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  leadPending: {
    type: Number,
    required: true,
    min: 0
  },
  percentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  }
}, {
  timestamps: true
});

const LeadExtraction = mongoose.models.LeadExtraction || mongoose.model('LeadExtraction', leadExtractionSchema);

export default LeadExtraction;
