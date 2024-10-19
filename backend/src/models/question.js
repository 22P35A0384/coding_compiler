import { Schema, model } from 'mongoose';

const questionSchema = new Schema({
  // Define your schema fields here
  title: { type: String, required: true },
  description: { type: String, required: true },
  // Add other fields as necessary
});

const Question = model('Question', questionSchema);

export default Question;
