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
  if (variant === "text") {
    return (
      <button
        className={
          "bg-transparent py-4 px-4 rounded-2xl " +
          (disabled
            ? "text-neutral-500 cursor-not-allowed "
            : "text-purple-500 hover:bg-purple-300 hover:bg-opacity-5 ")
          }
          { ...rest }
      >
        {children}
      </button>
    );
  }

  else if(variant === "rounded"){
    return (
      <button
        className={
          "flex items-center justify-center py-4 px-4 rounded-full duration-300 " +
          (disabled
            ? "bg-slate-500 cursor-not-allowed "
          : "bg-purple-600 hover:bg-purple-700 ") + (className ?? "") 
          }
          { ...rest }
      >
        {children}
      </button>
    );
  }

  return (
    <button
      className={
        "flex items-center text-white duration-300 font-bold py-3 px-5 min-w-20 rounded-2xl justify-center " +
        (disabled
          ? "bg-slate-500 cursor-not-allowed "
          : "bg-purple-600 hover:bg-purple-700 ") +
        (className || "")
      }
      {...rest}
    >
      {children}
    </button>
  );
}

export default Button;
