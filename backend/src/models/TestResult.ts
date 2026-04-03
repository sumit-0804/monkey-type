import mongoose, { Document, Schema } from "mongoose";

export interface ITestResult extends Document {
  user: mongoose.Types.ObjectId;
  wpm: number;
  accuracy: number;
  mode: string;
  testType: string; // 'time' or 'words'
  testAmount: number; // e.g. 60 or 50
  punctuation: boolean;
  numbers: boolean;
  language?: string;
  timeElapsed: number;
  createdAt: Date;
}

const TestResultSchema = new Schema<ITestResult>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    wpm: { type: Number, required: true },
    accuracy: { type: Number, required: true },
    mode: { type: String, required: true },
    testType: { type: String, required: true },
    testAmount: { type: Number, required: true },
    punctuation: { type: Boolean, default: false },
    numbers: { type: Boolean, default: false },
    language: { type: String },
    timeElapsed: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

// Compound indexes for fast querying
TestResultSchema.index({ user: 1, createdAt: -1 });
TestResultSchema.index({ mode: 1, testType: 1, testAmount: 1, wpm: -1 });
TestResultSchema.index({ wpm: -1 });

export const TestResult = mongoose.model<ITestResult>("TestResult", TestResultSchema);
