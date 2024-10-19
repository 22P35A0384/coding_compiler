const Test=async(req,res,next)=>{
    const id = req.params.id
    return res.status(200).json({msg:'Testing...',id:id})
}

export default Test;