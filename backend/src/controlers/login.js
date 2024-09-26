import user from "../models/user.js";
import bcrypt from 'bcryptjs';

const Login=async(req,res)=>{
    const {username, password} = req.body;
    try{
        const Data = await user.findOne({username:username})  
        if(!Data){
            return res.status(200).json({msg:false})
        }else{
            const isPasswordCorrect = bcrypt.compareSync(password, Data.password);
            if(!isPasswordCorrect){
                return res.status(200).send(false)
            }else{
                return res.status(200).json(true)
            }
        }
    }catch(err){
        console.log(err)
        return res.status(500).json({msg:"Internal Server Error"})
    }
}

export default Login;