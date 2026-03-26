import mongoose, { Document, Schema } from "mongoose";

export interface ITestResult extends Document {
  user: mongoose.Types.ObjectId;
  wpm: number;
  accuracy: number;
  mode: string;
  language?: string;
  createdAt: Date;
}

const TestResultSchema = new Schema<ITestResult>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    wpm: { type: Number, required: true },
    accuracy: { type: Number, required: true },
    mode: { type: String, required: true },
    language: { type: String },
  },
  { timestamps: true }
);

// Compound indexes for fast querying
TestResultSchema.index({ user: 1, createdAt: -1 });
TestResultSchema.index({ wpm: -1 });

export const TestResult = mongoose.model<ITestResult>("TestResult", TestResultSchema);
