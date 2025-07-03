import mongoose from "mongoose";

const url = process.env.MONGODB_URI || "mongodb://localhost:27017/user";

let conn: typeof mongoose | null = null;

export async function getConnection() {
  if (!conn) {
    conn = await mongoose.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    } as any);
    console.log("MongoDB connection successful");
  }
  return conn;
}

// User schema and model
const Userschema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  gender: { type: String },
  phoneNumber: { type: String, default: "" },
  profilePictureUrl: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
  type: { type: String, default: "user" }, // Default type is 'user'
  isVerified: { type: Boolean, default: false }, // Default verification status
  verificationToken: { type: String, default: "" } // Token for email verification
});

const User = mongoose.models.User || mongoose.model("User", Userschema);

export { User as UserModel };
