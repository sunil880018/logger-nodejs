import mongoose from 'mongoose';

// Define the log schema
const logSchema = new mongoose.Schema({
  level: {
    type: String,
  },
  message: {
    type: String,
  },
  resourceId: {
    type: String,
  },
  timestamp: {
    type: Date,
  },
  traceId: {
    type: String,
  },
  spanId: {
    type: String,
  },
  commit: {
    type: String,
  }
});

const Log = mongoose.model('Log', logSchema);
export default Log;
