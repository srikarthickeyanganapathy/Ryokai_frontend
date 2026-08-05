import { useQuery } from '@tanstack/react-query';
import api from '@/shared/api/api';

export const useCopilotInsights = () => {
  return useQuery({
    queryKey: ['copilot', 'insights'],
    queryFn: async () => {
      const response = await api.get('/copilot/insights');
      return response.data;
    },
  });
};

export const useCopilotQuestions = () => {
  return useQuery({
    queryKey: ['copilot', 'questions'],
    queryFn: async () => {
      const response = await api.get('/copilot/questions');
      return response.data;
    },
  });
};
