import mongoose from "mongoose";

const connectionString = process.env.MONGODB_URI || `mongodb://localhost:27017`;

export const db = mongoose.connect(connectionString, 
    {dbName : process.env.DB_NAME}
).then(()=>{
    console.log("Connected to MongoDB")
}).catch((error: any)=>{
    console.log("Error connecting to MongoDB:", error)
});
