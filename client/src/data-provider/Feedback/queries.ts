import { MutationKeys, QueryKeys, dataService } from 'librechat-data-provider';
import { useMutation, useQuery } from '@tanstack/react-query';
import type { UseMutationOptions, UseQueryOptions } from '@tanstack/react-query';
import type {
  UserFeedbackPayload,
  UserFeedbackResponse,
  AdminFeedbackListParams,
  AdminFeedbackListResponse,
} from 'librechat-data-provider';

export const useSubmitUserFeedbackMutation = (
  options?: UseMutationOptions<UserFeedbackResponse, Error, UserFeedbackPayload>,
) => {
  return useMutation<UserFeedbackResponse, Error, UserFeedbackPayload>(
    [MutationKeys.submitUserFeedback],
    (payload: UserFeedbackPayload) => dataService.submitUserFeedback(payload),
    { ...options },
  );
};

export const useAdminFeedbacksQuery = (
  params?: AdminFeedbackListParams,
  config?: UseQueryOptions<AdminFeedbackListResponse>,
) => {
  return useQuery<AdminFeedbackListResponse>(
    [QueryKeys.adminFeedbacks, params],
    () => dataService.getAdminFeedbacks(params),
    {
      refetchOnWindowFocus: false,
      ...config,
    },
  );
};
