import mongoose from 'mongoose';
const { Schema } = mongoose;

const nameserverSchema = new Schema({
  name: { type: String, required: true }, // e.g. ns1.sparrowdns.com
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  type: { type: String, enum: ['default', 'custom'], required: true }, // default or white-label
  owner: { type: Schema.Types.ObjectId, ref: 'User' }, // for custom nameserver only
}, { timestamps: true, versionKey: false });

const Nameserver = mongoose.models.Nameserver || mongoose.model('Nameserver', nameserverSchema);
export default Nameserver;
