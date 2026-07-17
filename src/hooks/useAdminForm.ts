import { useState } from 'react';

type ServerAction<T = any> = (id: string, formData: FormData) => Promise<{ error?: string, success?: boolean, data?: T }>;
type ServerCreateAction<T = any> = (formData: FormData) => Promise<{ error?: string, success?: boolean, data?: T }>;

export function useAdminForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submitAction(
    actionFn: Promise<{ error?: string, success?: boolean, data?: any }>,
    onSuccess?: () => void
  ) {
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await actionFn;
      if (res?.error) {
        setError(res.error);
      } else {
        onSuccess?.();
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    isSubmitting,
    error,
    setError,
    submitAction,
  };
}
