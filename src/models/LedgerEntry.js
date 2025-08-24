import mongoose from 'mongoose';

const ledgerEntrySchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    index: true
  },
  batteryType: {
    type: String,
    enum: ['battery', 'gutka'],
    required: true
  },
  totalWeight: {
    type: Number,
    required: true,
    min: 0
  },
  ratePerKg: {
    type: Number,
    required: true,
    min: 0
  },
  credit: {
    type: Number,
    required: true,
    min: 0
  },
  debit: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  balance: {
    type: Number,
    required: false,
    default: 0
  }
}, {
  timestamps: true
});

// Add compound index for efficient date-based queries
ledgerEntrySchema.index({ date: 1, createdAt: 1 });

const LedgerEntry = mongoose.models.LedgerEntry || mongoose.model('LedgerEntry', ledgerEntrySchema);

export default LedgerEntry;
