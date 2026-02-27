import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String }, // Only required for email/password auth
    googleId: { type: String }, // Only for Google OAuth
    isVerified: { type: Boolean, default: false }, // Email verification flag
    authProvider: { type: String, enum: ["email", "google"], required: true },
    phone: { type: String }, // Added from formData
    dateOfBirth: { type: Date }, // Added from formData
    gender: { type: String, enum: ["male", "female", "other"], default: "male" }, // Added
    medicalHistory: { type: [String], default: [] }, // Added
    lifestyle: {
      smoking: { type: Boolean, default: false },
      drinking: { type: Boolean, default: false },
      exercise: { type: String, enum: ["low", "moderate", "high"], default: "moderate" },
      sleep: { type: Number, default: 8 },
    },
    role: { type: String, enum: ["patient", "clinic", "both"], default: "patient" },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;