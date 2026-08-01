import {
  useController,
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";

import { TextInputField } from "../TextInputField";

interface TextFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  placeholder?: string;
  keyboardType?: "default" | "numbers-and-punctuation";
  multiline?: boolean;
}

export function TextField<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  keyboardType,
  multiline = false,
}: TextFieldProps<T>) {
  const { field, fieldState } = useController({ control, name });

  return (
    <TextInputField
      error={fieldState.error?.message}
      keyboardType={keyboardType}
      label={label}
      multiline={multiline}
      onBlur={field.onBlur}
      onChangeText={field.onChange}
      placeholder={placeholder}
      value={field.value as string}
    />
  );
}
