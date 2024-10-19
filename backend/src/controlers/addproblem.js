import Problem from "../models/problem.js";

const Addproblem = async (req, res) => {
  try {
    const {
      problemStatement,
      sampleInputs,
      hiddenTestCases,
      problemTitle
    } = req.body;

    // Create a new problem instance
    const newProblem = new Problem({
      problemStatement,
      sampleInputs,
      hiddenTestCases,
      problemTitle
    });

    // Save the problem to the database
    const result = await newProblem.save();
    console.log(result);

    // Send success response
    res.status(200).json(true);
  } catch (error) {
    console.error('Error saving problem:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: error.message,
    });
  }
};

export default Addproblem;