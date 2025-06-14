import mongoose from "mongoose";
import { MONGODB_URL } from "../../Shared/constants/env";


const connectToDatabase = async () => {
    try {
        await mongoose.connect(MONGODB_URL);
    } catch (error) {
        console.log('Error connecting to database', error)
        process.exit(1)
    }
}
export default connectToDatabase;
