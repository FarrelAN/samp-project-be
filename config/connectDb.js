import mongoose from "mongoose";

const connectDB = async (DB_URL)=>{
    const DB_OPTIONS = {
        dbName: "samp",
    }
    try{
       await mongoose.connect(DB_URL, DB_OPTIONS).then(
        console.log("connected db successfully....!")
       )
    }catch(err){
        console.log("error", err)
    }
}

export default connectDB