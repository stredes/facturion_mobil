import {
  useController,
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";

import { MoneyInput } from "../MoneyInput";

interface MoneyFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
}

export function MoneyField<T extends FieldValues>({
  control,
  name,
  label,
}: MoneyFieldProps<T>) {
  const { field, fieldState } = useController({ control, name });

  return (
    <MoneyInput
      error={fieldState.error?.message}
      label={label}
      onChangeValue={field.onChange}
      value={field.value as number}
    />
  );
}
