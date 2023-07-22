import { HTMLInputTypeAttribute, useState } from "react";

interface StyleInputProps {
  type: HTMLInputTypeAttribute;
  placeholder?: string;
  required?: boolean;
  requiredMessage?: string;
  className?: string;
  value?: string;
  setValue?: (text: string) => void;
  onEnter?: (text: string) => void;
  onChange?: (text: string) => void;
  onClear?: () => void;
}

export const StyledInput = ({
  type,
  placeholder = "",
  required = false,
  requiredMessage = "This input field cannot be empty",
  className = "",
  value,
  setValue,
  onEnter,
  onChange = (_: string) => {},
  onClear,
}: StyleInputProps) => {
  const [isEmpty, setIsEmpty] = useState(false);
  const [input, setInput] = useState("");

  return (
    <form
      className="w-full"
      onSubmit={(e) => {
        e.preventDefault();
        if (onEnter) {
          const textState = value ?? input;
          if (textState.length === 0 && required) {
            setIsEmpty(true);
            true;
          }

          onEnter(textState);
          setInput("");
        }
      }}
    >
      <input
        type={type}
        placeholder={placeholder}
        className={`input input-bordered input-sm w-full ${
          isEmpty && required && "input-error"
        } ${className}`}
        value={value ?? input}
        onChange={(e) => {
          setValue ? setValue(e.target.value) : setInput(e.target.value);
          setIsEmpty(false);
          onChange(e.target.value);
        }}
      />

      {isEmpty && required && (
        <label className="label label-text-alt text-error">
          {requiredMessage}
        </label>
      )}

      {input && onClear && (
        <label className="label label-text-alt flex-row-reverse">
          <a
            href="#"
            className="link"
            onClick={() => {
              setInput("");
              onClear();
            }}
          >
            Clear
          </a>
        </label>
      )}
    </form>
  );
};
