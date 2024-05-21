import mongoose from "mongoose";
import type { TUser } from "../types/user";

const userSchema = new mongoose.Schema<TUser>({
    name: {
        type: String,
    },
    tweeterId: {
        type: String,
        unique: true,
    },
    avatar: {
        type: String,
        default: "none"
    },
    accessToken: {
        type: String,
    },
    refreshToken: {
        type: String,
    }

},
    { timestamps: true }
);

export default mongoose.model<TUser>('User', userSchema);