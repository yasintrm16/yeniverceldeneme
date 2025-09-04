import mongoose from "mongoose"

export const connectDB = async () =>{
    try{
        await mongoose.connect(process.env.MONGO_URI)
        console.log("MONGODB connect SUCCCESFUl")
    }catch(error){
        console.error("Error connecting to MongoDB",error);
        
    }
}  