import otpmodel from "../models/otpmodel.js";

const Otpverification = async(req,res) =>{
    const {otp,email} = req.body;
    const Temp = parseInt(otp)
    try{
        const Data = await otpmodel.findOne({email:email})
        if(Data.otp===Temp){
            return res.status(200).send(true)
        }else{
            return res.status(200).send(false)
        }
    }catch(err){
        return res.status(500).json({msg:"Internal Server Error!!!"})
    }
}

export default Otpverification;