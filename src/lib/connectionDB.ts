import mongoose from "mongoose";

const connectionString = process.env.MONGODB_URI || `mongodb://localhost:27017`;

export const db = mongoose.connect(connectionString, 
    {dbName : process.env.DB_NAME}
).then(()=>{
    console.log("Connected to mongoDB")
}).catch((error: any)=>{
    console.log("🚀 ~ :8 ~ error:", error)
});
