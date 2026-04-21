import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  invoiceId: {
    type: String,
    required: true // Stripe/Razorpay invoice/payment reference
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'USD'
  },
  status: {
    type: String,
    enum: ['paid', 'pending', 'failed', 'cancelled'],
    default: 'pending'
  },
  issuedAt: {
    type: Date,
    default: Date.now
  },
  paidAt: Date,
  details: Object // Store extra metadata if needed
}, { timestamps: true });

export default mongoose.model('Invoice', invoiceSchema);

