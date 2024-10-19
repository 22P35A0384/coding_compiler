// models/Contest.js
import { Schema, model } from 'mongoose';

const contestSchema = new Schema({
  name: { type: String, required: true },
  questions: [{ type: Schema.Types.ObjectId, ref: 'Question' }],
}, { timestamps: true });

const Contest = model('Contest', contestSchema);

export default Contest;
