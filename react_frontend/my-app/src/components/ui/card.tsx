import * as React from "react";

export const Card = ({ children, className = "" }: any) => (
  <div className={`rounded-lg shadow ${className}`}>{children}</div>
);

export const CardContent = ({ children, className = "" }: any) => (
  <div className={`p-4 ${className}`}>{children}</div>
);
