import Problem from "../models/problem.js";

const Singleqn = async (req, res) => {
  const id = req.params.id;
  try {
    console.log(id);
    const question = await Problem.findById(id);
    if (!question) {
      return res.status(404).json({ message: 'Problem not found' });
    }
    const {problemStatement } = question;
    res.json({problemStatement });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export default Singleqn;