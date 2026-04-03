import mongoose, { Document, Schema } from 'mongoose';

export interface ISnippet extends Document {
  language: string;
  text: string;
  createdAt: Date;
}

const snippetSchema = new Schema<ISnippet>(
  {
    language: { type: String, required: true },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Add a TTL index to automatically expire snippets after 7 days
snippetSchema.index({ createdAt: 1 }, { expireAfterSeconds: 604800 });

export const Snippet = mongoose.model<ISnippet>('Snippet', snippetSchema);
