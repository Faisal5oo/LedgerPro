import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    index: true
  }
}, {
  timestamps: true
});

// Index is already defined on the field (unique + index)

const Customer = mongoose.models.Customer || mongoose.model('Customer', customerSchema);

export default Customer;
