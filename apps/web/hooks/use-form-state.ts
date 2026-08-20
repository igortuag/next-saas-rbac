import { FormEvent, useState, useTransition } from 'react';

interface FormState {
  success: boolean;
  message: string | null;
  errors: Record<string, string[]> | null;
}

export function useFormState<T>(
  action: (data: FormData) => Promise<FormState>,
  initialState: FormState
) {
  const [formState, setFormState] = useState<FormState>(initialState);
  const { success, message, errors } = formState;
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = event.currentTarget;
    const data = new FormData(formData);

    startTransition(async () => {
      const state = await action(data);
      setFormState(state);
    });
  }

  return {
    formState,
    success,
    message,
    errors,
    isPending,
    handleSubmit,
  };
}
