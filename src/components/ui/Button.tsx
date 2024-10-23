import { ReactNode } from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode;
  variant?: "fill" | "text" | "rounded";
}

function Button({
  children,
  className,
  disabled,
  variant,
  ...rest
}: Readonly<ButtonProps>) {
  const buttonDefaultStyles =
    "h-12 flex items-center justify-center py-3 px-5 font-bold";

  if (variant === "text") {
    return (
      <button
        className={
          buttonDefaultStyles +
          "bg-transparent py-4 px-4 rounded-2xl " +
          (disabled
            ? "text-neutral-500 hover:cursor-not-allowed "
            : "text-purple-500 hover:bg-purple-300 hover:bg-opacity-5 hover:cursor-pointer ") +
          (className ?? "")
        }
        {...rest}
      >
        {children}
      </button>
    );
  } else if (variant === "rounded") {
    return (
      <button
        className={
          "flex items-center justify-center py-4 px-4 rounded-full duration-300 " +
          (disabled
            ? "bg-purple-600 opacity-30 hover:cursor-not-allowed "
            : "bg-purple-600 hover:bg-purple-700 hover:cursor-pointer ") +
          (className ?? "")
        }
        {...rest}
      >
        {children}
      </button>
    );
  }

  return (
    <button
      className={
        buttonDefaultStyles +
        "text-white duration-300 min-w-20 rounded-2xl " +
        (disabled
          ? "bg-purple-600 opacity-30 hover:cursor-not-allowed "
          : "bg-purple-600 hover:bg-purple-700 hover:cursor-pointer ") +
        (className ?? "")
      }
      {...rest}
    >
      {children}
    </button>
  );
}

export default Button;
