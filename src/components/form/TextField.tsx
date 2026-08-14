import { useRef } from "react";
import type { ComponentRef } from "react";
import {
  useController,
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import { View, type TextInput } from "react-native";

import { TextInputField } from "../TextInputField";
import { useFormFieldRegistration } from "./formFieldRegistry";

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
  const containerRef = useRef<View>(null);
  const inputRef = useRef<ComponentRef<typeof TextInput>>(null);
  useFormFieldRegistration(name, containerRef, inputRef);

  return (
    <View ref={containerRef}>
      <TextInputField
        error={fieldState.error?.message}
        inputRef={inputRef}
        keyboardType={keyboardType}
        label={label}
        multiline={multiline}
        onBlur={field.onBlur}
        onChangeText={field.onChange}
        placeholder={placeholder}
        value={field.value as string}
      />
    </View>
  );
}
