import { useRef } from "react";
import type { ComponentRef } from "react";
import {
  useController,
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import { View, type TextInput } from "react-native";

import { DateInput } from "../DateInput";
import { useFormFieldRegistration } from "./formFieldRegistry";

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
  const containerRef = useRef<View>(null);
  const inputRef = useRef<ComponentRef<typeof TextInput>>(null);
  useFormFieldRegistration(name, containerRef, inputRef);

  return (
    <View ref={containerRef}>
      <DateInput
        error={fieldState.error?.message}
        inputRef={inputRef}
        label={label}
        onBlur={field.onBlur}
        onChangeText={field.onChange}
        value={field.value as string}
      />
    </View>
  );
}
