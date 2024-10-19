import mongoose from "mongoose";
const schema = mongoose.Schema;

let User = new schema({
    username:{
        type:String
    },
    email:{
        type:String
    },
    password:{
        type:String
    },
    solved_problems:{
        type:Array
    },
    type_of_user:{
        type:String
    }
});

export default mongoose.model('Users',User)