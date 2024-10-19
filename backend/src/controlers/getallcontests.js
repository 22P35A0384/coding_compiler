import Contest from '../models/contest.js'; // Adjust path as necessary
import Question from '../models/question.js'; // Adjust path as necessary

const Getcontests = async (req, res) => {
  try {
    const contests = await Contest.find().populate('questions'); // Ensure 'questions' field is populated
    res.status(200).json(contests);
  } catch (error) {
    console.error('Error fetching contests:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export default Getcontests;
