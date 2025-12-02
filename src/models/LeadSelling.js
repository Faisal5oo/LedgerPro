import mongoose from 'mongoose';

const leadSellingSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
    index: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  commuteRent: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  weight: {
    type: Number,
    required: true,
    min: 0
  },
  rate: {
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
  credit: {
    type: Number,
    required: true,
    min: 0
  },
  balance: {
    type: Number,
    required: false,
    default: 0
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
leadSellingSchema.index({ date: 1, createdAt: 1 });

// Virtual for customer name (will be populated)
leadSellingSchema.virtual('customerName').get(function() {
  return this.populated('customerId') ? this.customerId.name : undefined;
});

// Ensure virtuals are included when converting to JSON
leadSellingSchema.set('toJSON', { virtuals: true });
leadSellingSchema.set('toObject', { virtuals: true });

const LeadSelling = mongoose.models.LeadSelling || mongoose.model('LeadSelling', leadSellingSchema);

export default LeadSelling;
