import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  iconClassName?: string;
}

function Input({
  icon,
  className,
  iconClassName,
  ...rest
}: Readonly<InputProps>) {
  return (
    <div className="relative">
      <div className={"absolute left-6 top-4 " + iconClassName}>{icon}</div>
      <input
        className={
          "h-full rounded-2xl pl-16 px-3 bg-neutral-700 border border-neutral-700 focus:ring-purple-700 focus:border-purple-700 " +
          (className || "")
        }
        {...rest}
      />
    </div>
  );
}

export default Input;
