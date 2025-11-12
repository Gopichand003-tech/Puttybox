import React from "react";

export const Avatar = ({ children, className = "", ...props }) => (
  <div className={`w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center ${className}`} {...props}>
    {children}
  </div>
);

export const AvatarFallback = ({ children }) => (
  <span className="text-sm text-gray-600">{children}</span>
);