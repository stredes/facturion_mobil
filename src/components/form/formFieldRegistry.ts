import { createContext, useContext, useEffect } from "react";
import type { RefObject } from "react";
import type { TextInput, View } from "react-native";

export interface FormFieldHandle {
  view: RefObject<View | null>;
  focus: () => void;
}

interface FormFieldRegistryValue {
  register: (name: string, handle: FormFieldHandle) => () => void;
}

export const FormFieldRegistryContext = createContext<FormFieldRegistryValue | null>(
  null,
);

export function useFormFieldRegistration(
  name: string,
  containerRef: RefObject<View | null>,
  inputRef: RefObject<TextInput | null>,
) {
  const registry = useContext(FormFieldRegistryContext);

  useEffect(() => {
    if (!registry) {
      return;
    }

    return registry.register(name, {
      view: containerRef,
      focus: () => inputRef.current?.focus(),
    });
  }, [registry, name, containerRef, inputRef]);
}
