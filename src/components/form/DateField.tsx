import {
  useController,
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";

import { DateInput } from "../DateInput";

interface DateFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
}

export function DateField<T extends FieldValues>({
  control,
  name,
  label,
}: DateFieldProps<T>) {
  const { field, fieldState } = useController({ control, name });

  return (
    <DateInput
      error={fieldState.error?.message}
      label={label}
      onBlur={field.onBlur}
      onChangeText={field.onChange}
      value={field.value as string}
    />
  );
}
