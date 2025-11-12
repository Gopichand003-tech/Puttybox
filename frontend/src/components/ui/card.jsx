import React from "react";
import clsx from "clsx";

export function Card({ className, children, ...props }) {
  return (
    <div
      className={clsx(
        "rounded-2xl border border-gray-200 bg-white shadow-md p-4",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children }) {
  return (
    <div className={clsx("mb-2 font-semibold text-lg", className)}>
      {children}
    </div>
  );
}

export function CardContent({ className, children }) {
  return (
    <div className={clsx("text-gray-700", className)}>{children}</div>
  );
}

export function CardFooter({ className, children }) {
  return (
    <div className={clsx("mt-4 border-t pt-2 text-sm text-gray-500", className)}>
      {children}
    </div>
  );
}