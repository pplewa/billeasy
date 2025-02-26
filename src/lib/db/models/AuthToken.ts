import mongoose, { Document, Schema } from "mongoose";

export interface IAuthToken extends Document {
  token: string;
  email: string;
  expires: Date;
  used: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AuthTokenSchema = new Schema<IAuthToken>(
  {
    token: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    expires: {
      type: Date,
      required: true,
    },
    used: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes to improve query performance and auto-expire old tokens
AuthTokenSchema.index({ token: 1 });
AuthTokenSchema.index({ email: 1 });
AuthTokenSchema.index({ expires: 1 }, { expireAfterSeconds: 0 }); // Auto-delete expired tokens

// Check if the model already exists to prevent overwriting it during hot reloads
const AuthToken =
  (mongoose.models.AuthToken as mongoose.Model<IAuthToken>) ||
  mongoose.model<IAuthToken>("AuthToken", AuthTokenSchema);

export default AuthToken;
