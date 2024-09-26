import Contest from "../models/contest.js";

const Newcontest = async (req, res) => {
    try {
      const { name, questions } = req.body;
  
      // Validate input
      if (!name || !questions || !Array.isArray(questions)) {
        return res.status(400).json({ error: 'Invalid input' });
      }
  
      // Create a new contest
      const newContest = new Contest({
        name,
        questions
      });
  
      // Save the contest to the database
      await newContest.save();
  
      // Send a response
      res.status(201).json(newContest);
    } catch (error) {
      console.error('Error creating contest:', error);
      res.status(500).json({ error: 'Server error' });
    }
}

export default Newcontest;