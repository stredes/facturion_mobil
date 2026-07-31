import { useEffect } from "react";
import {
  useForm,
  type DefaultValues,
  type FieldValues,
  type UseFormProps,
  type UseFormReturn,
} from "react-hook-form";

export function useFormWithReset<TFieldValues extends FieldValues>(
  defaultValues: DefaultValues<TFieldValues>,
  options: Omit<UseFormProps<TFieldValues>, "defaultValues">,
): UseFormReturn<TFieldValues> {
  const form = useForm<TFieldValues>({ ...options, defaultValues });
  const { reset } = form;

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  return form;
}
