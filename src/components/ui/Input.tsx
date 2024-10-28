import React, { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  iconClassName?: string;
  containerClassName?: string;
  variant: "light" | "dark";
}

const Input = forwardRef(
  (
    {
      icon,
      className,
      iconClassName,
      containerClassName,
      variant,
      ...rest
    }: Readonly<InputProps>,
    ref: React.Ref<HTMLInputElement>
  ) => {
    const colorClasses =
      variant === "dark"
        ? "bg-neutral-700 border border-neutral-700 focus:ring-purple-700 focus:border-purple-700 "
        : "bg-white text-neutral-900 border border-neutral-700 focus:ring-purple-700 focus:border-purple-700 ";

    if (icon) {
      return (
        <div className={"h-12 relative w-full " + containerClassName}>
          <div className={"absolute left-6 top-3 " + iconClassName}>{icon}</div>
          <input
            ref={ref}
            className={
              "h-full rounded-2xl pl-16 py-3 px-3 " +
              colorClasses +
              (className ?? "")
            }
            {...rest}
          />
        </div>
      );
    }

    return (
      <div className={"h-12 " + containerClassName}>
        <input
          ref={ref}
          className={
            "h-full rounded-2xl py-3 px-5 " + colorClasses + (className ?? "")
          }
          {...rest}
        />
      </div>
    );
  }
);

export default Input;
