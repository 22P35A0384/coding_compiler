import Problem from "../models/problem.js";
import User from "../models/user.js"; // Using PascalCase for consistency

const Getallqns = async (req, res) => {
  const { username } = req.body;
  try {
    // Find the user by username
    const userData = await User.findOne({ username });

    // Check if the user exists
    if (!userData) {
      return res.status(404).json({ error: "User not found" });
    }

    // Get the list of solved problem IDs (as strings)
    const solvedProblems = userData.solved_problems.map(problemId => problemId.toString());

    // Fetch all problems from the database
    const problems = await Problem.find();

    // Map through the problems and add the solved status
    const result = problems.map(item => ({
      id: item._id,
      problemStatement: item.problemTitle,
      solved: solvedProblems.includes(item._id.toString()) // Check if the problem is solved
    }));

    // Return the result as a JSON response
    res.status(200).json(result);
  } catch (error) {
    // Handle any errors that occur
    res.status(500).json({ error: error.message });
  }
};

export default Getallqns;
