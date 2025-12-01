import mongoose from 'mongoose';

const weightLogSchema = new mongoose.Schema({
  weight: {
    type: Number,
    required: true,
    min: 0
  },
  time: {
    type: Date,
    required: true,
    default: Date.now
  }
}, { _id: false });

const ledgerEntrySchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
    index: true
  },
  date: {
    type: Date,
    required: true,
    index: true
  },
  batteryType: {
    type: String,
    enum: ['battery', 'gutka'],
    required: function() {
      return !this.isPaymentOnly;
    }
  },
  totalWeight: {
    type: Number,
    required: function() {
      return !this.isPaymentOnly;
    },
    min: 0,
    default: 0
  },
  ratePerKg: {
    type: Number,
    required: function() {
      return !this.isPaymentOnly;
    },
    min: 0,
    default: 0
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
  },
  weightLogs: {
    type: [weightLogSchema],
    default: []
  },
  notes: {
    type: String,
    trim: true,
    default: ''
  },
  isPaymentOnly: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Add compound index for efficient date queries (customerId already has index:true)
ledgerEntrySchema.index({ date: 1, createdAt: 1 });

// Virtual for customer name (will be populated)
ledgerEntrySchema.virtual('customerName').get(function() {
  return this.populated('customerId') ? this.customerId.name : undefined;
});

// Ensure virtuals are included when converting to JSON
ledgerEntrySchema.set('toJSON', { virtuals: true });
ledgerEntrySchema.set('toObject', { virtuals: true });

const LedgerEntry = mongoose.models.LedgerEntry || mongoose.model('LedgerEntry', ledgerEntrySchema);

export default LedgerEntry;
