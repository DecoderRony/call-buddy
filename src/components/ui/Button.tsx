import { ReactElement } from "react";

interface ButtonProps {
  children: ReactElement | string;
  onClick: () => void;
}

function Button({ onClick, children }: Readonly<ButtonProps>) {
  return (
    <button
      onClick={onClick}
      className="rounded-lg p-3 bg-purple-400 text-white"
    >
      {children}
    </button>
  );
}

export default Button;
