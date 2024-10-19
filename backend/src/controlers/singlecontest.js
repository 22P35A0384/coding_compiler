import Contest from "../models/contest.js";

const Singlecontest = async(req,res) =>{
    const id = req.params.id
    try {
        const contest = await Contest.findById(id);
        if (!contest) {
          return res.status(404).json({ message: 'Contest not found' });
        }
        res.json(contest);
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
      }
}

export default Singlecontest;