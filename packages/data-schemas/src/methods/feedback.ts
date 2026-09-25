import type { FeedbackType, IFeedback } from '~/schema/feedback';

export interface CreateFeedbackInput {
  userId: string;
  type: FeedbackType;
  message: string;
  screenshotData?: string;
  pageUrl?: string;
  userAgent?: string;
}

export interface ListFeedbacksResult {
  feedbacks: IFeedback[];
  total: number;
  page: number;
  totalPages: number;
}

export interface FeedbackMethods {
  createFeedback: (input: CreateFeedbackInput) => Promise<IFeedback>;
  listFeedbacks: (params: { page?: number; limit?: number }) => Promise<ListFeedbacksResult>;
}

export function createFeedbackMethods(mongoose: typeof import('mongoose')): FeedbackMethods {
  async function createFeedback(input: CreateFeedbackInput): Promise<IFeedback> {
    const Feedback = mongoose.models.Feedback;
    return Feedback.create(input);
  }

  async function listFeedbacks({
    page = 1,
    limit = 20,
  }: {
    page?: number;
    limit?: number;
  }): Promise<ListFeedbacksResult> {
    const Feedback = mongoose.models.Feedback;
    const safeLimit = Math.min(100, Math.max(1, limit));
    const safePage = Math.max(1, page);
    const skip = (safePage - 1) * safeLimit;

    const [feedbacks, total] = await Promise.all([
      Feedback.find({}).sort({ createdAt: -1 }).skip(skip).limit(safeLimit).lean(),
      Feedback.countDocuments({}),
    ]);

    return {
      feedbacks,
      total,
      page: safePage,
      totalPages: Math.ceil(total / safeLimit),
    };
  }

  return { createFeedback, listFeedbacks };
}
