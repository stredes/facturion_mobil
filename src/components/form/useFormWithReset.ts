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
  const form = useForm<TFieldValues>({
    ...options,
    defaultValues,
    mode: options.mode ?? "onChange",
  });
  const { reset } = form;

  const defaultValuesKey = JSON.stringify(defaultValues);

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValuesKey, reset]);

  return form;
}
