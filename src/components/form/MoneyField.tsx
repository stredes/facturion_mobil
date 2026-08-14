import { useRef } from "react";
import type { ComponentRef } from "react";
import {
  useController,
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import { View, type TextInput } from "react-native";

import { MoneyInput } from "../MoneyInput";
import { useFormFieldRegistration } from "./formFieldRegistry";

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
  const containerRef = useRef<View>(null);
  const inputRef = useRef<ComponentRef<typeof TextInput>>(null);
  useFormFieldRegistration(name, containerRef, inputRef);

  return (
    <View ref={containerRef}>
      <MoneyInput
        error={fieldState.error?.message}
        inputRef={inputRef}
        label={label}
        onChangeValue={field.onChange}
        value={field.value as number}
      />
    </View>
  );
}
