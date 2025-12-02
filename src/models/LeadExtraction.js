import mongoose from 'mongoose';

const leadExtractionSchema = new mongoose.Schema({
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
  description: {
    type: String,
    required: true,
    default: 'Battery for Lead'
  },
  batteryWeight: {
    type: Number,
    required: function() {
      return !this.isLeadReceivedOnly;
    },
    min: 0,
    default: 0
  },
  leadPercentage: {
    type: Number,
    required: function() {
      return !this.isLeadReceivedOnly;
    },
    min: 0,
    max: 100,
    default: 60
  },
  leadWeight: {
    type: Number,
    required: function() {
      return !this.isLeadReceivedOnly;
    },
    min: 0,
    default: 0
  },
  leadReceived: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  leadPending: {
    type: Number,
    required: function() {
      return !this.isLeadReceivedOnly;
    },
    min: 0,
    default: 0
  },
  percentage: {
    type: Number,
    required: function() {
      return !this.isLeadReceivedOnly;
    },
    min: 0,
    max: 100,
    default: 0
  },
  isLeadReceivedOnly: {
    type: Boolean,
    default: false
  },
  notes: {
    type: String,
    trim: true,
    default: ''
  }
}, {
  timestamps: true
});

// Add compound index for efficient date queries (customerId already has index:true)
leadExtractionSchema.index({ date: 1, createdAt: 1 });

// Virtual for customer name (will be populated)
leadExtractionSchema.virtual('customerName').get(function() {
  return this.populated('customerId') ? this.customerId.name : undefined;
});

// Ensure virtuals are included when converting to JSON
leadExtractionSchema.set('toJSON', { virtuals: true });
leadExtractionSchema.set('toObject', { virtuals: true });

const LeadExtraction = mongoose.models.LeadExtraction || mongoose.model('LeadExtraction', leadExtractionSchema);

export default LeadExtraction;
