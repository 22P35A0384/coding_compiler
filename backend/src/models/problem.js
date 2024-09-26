import { Schema as _Schema, model } from 'mongoose';
import moment from 'moment-timezone';

const Schema = _Schema;

// Define a sub-document schema for solved users
const SolvedUserSchema = new Schema({
  code: {
    type: String,
    required: true,
  },
  user_id: {
    type: String,
    required: true,
  },
  language: {
    type: String,
    required: true,
  },
  createdAt: {
    type: String, // Store timestamp as a string
    default: () => moment().tz('Asia/Kolkata').format('ddd MMM DD YYYY HH:mm:ss [GMT]ZZ'),
  },
}); // This will add `createdAt` and `updatedAt` fields

const ProblemSchema = new Schema({
  problemStatement: {
    type: String,
    required: true,
  },
  problemTitle: {
    type: String,
    required: true,
  },
  sampleInputs: [
    {
      input: {
        type: String,
        required: true,
      },
      output: {
        type: String,
        required: true,
      }
    },
  ],
  hiddenTestCases: [
    {
      input: {
        type: String,
        required: true,
      },
      output: {
        type: String,
        required: true,
      },
    },
  ],
  solved_users: [SolvedUserSchema], // Use the sub-document schema for solved users
  createdAt: {
    type: String, // Store timestamp as a string
    default: () => moment().tz('Asia/Kolkata').format('ddd MMM DD YYYY HH:mm:ss [GMT]ZZ'),
  },
});

// Create and export the model
const Problem = model('Problem', ProblemSchema);

export default Problem;