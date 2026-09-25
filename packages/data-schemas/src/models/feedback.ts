import { Model } from 'mongoose';
import feedbackSchema, { IFeedback } from '~/schema/feedback';
import { applyTenantIsolation } from '~/models/plugins/tenantIsolation';

export function createFeedbackModel(mongoose: typeof import('mongoose')): Model<IFeedback> {
  applyTenantIsolation(feedbackSchema);
  return mongoose.models.Feedback || mongoose.model<IFeedback>('Feedback', feedbackSchema);
}
