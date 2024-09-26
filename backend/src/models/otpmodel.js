import mongoose from "mongoose";
const schema = mongoose.Schema;

let Otpmodel = new schema({
    email:{
        type:String
    },
    otp:{
        type:Number,
    }
});

export default mongoose.model('Otp Verification',Otpmodel)