import React, { ChangeEvent } from "react";

interface InputProps {
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

function Input({ value, onChange }: Readonly<InputProps>) {
  return (
    <input
      value={value}
      onChange={onChange}
      className="py-3 px-4 border-2 border-gray-600 rounded-lg"
      type="text"
    />
  );
}

export default Input;
