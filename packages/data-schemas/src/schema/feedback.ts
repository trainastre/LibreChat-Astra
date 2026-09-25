import { Schema, Document } from 'mongoose';

export type FeedbackType = 'bug' | 'feedback';

export interface IFeedback extends Document {
  userId?: string;
  type?: FeedbackType;
  message?: string;
  screenshotData?: string;
  pageUrl?: string;
  userAgent?: string;
  tenantId?: string;
}

const feedbackSchema: Schema<IFeedback> = new Schema<IFeedback>(
  {
    userId: {
      type: String,
      index: true,
    },
    type: {
      type: String,
      enum: ['bug', 'feedback'],
      index: true,
    },
    message: {
      type: String,
    },
    screenshotData: {
      type: String,
    },
    pageUrl: {
      type: String,
    },
    userAgent: {
      type: String,
    },
    tenantId: {
      type: String,
      index: true,
    },
  },
  { timestamps: true },
);

export default feedbackSchema;
