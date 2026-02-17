'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/shared/api/http-client';
import { useAppStore } from '@/shared/store/app-store';

export function useEnrollCourse(courseId: string) {
  const queryClient = useQueryClient();
  const userId = useAppStore((state) => state.userId);
  const tenantId = useAppStore((state) => state.tenantId);

  return useMutation({
    mutationFn: () =>
      apiRequest('lms', '/lms/enrollments', {
        method: 'POST',
        body: { userId, courseId, tenantId }
      }),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['course', courseId] });
      const previous = queryClient.getQueryData(['course', courseId]);
      queryClient.setQueryData(['course', courseId], (old: Record<string, unknown> | undefined) => ({
        ...(old ?? {}),
        optimistic_enrolled: true
      }));
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['course', courseId], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['course', courseId] });
    }
  });
}
