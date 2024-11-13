import React from "react";
import { cn } from "@/lib/utils";

const Alert = React.forwardRef(({ className, variant = "info", children, ...props }, ref) => {
  const variantStyles = {
    info: "border-blue-200 text-blue-800 bg-blue-50",
    success: "border-green-200 text-green-800 bg-green-50",
    warning: "border-yellow-200 text-yellow-800 bg-yellow-50",
    error: "border-red-200 text-red-800 bg-red-50",
    destructive: "border-red-200 text-red-800 bg-red-50"
  };

  return (
    <div
      ref={ref}
      role="alert"
      className={cn(
        "relative w-full rounded-lg border p-4",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

Alert.displayName = "Alert";

const AlertTitle = React.forwardRef(({ className, children, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-medium leading-none tracking-tight", className)}
    {...props}
  >
    {children}
  </h5>
));

AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  >
    {children}
  </div>
));

AlertDescription.displayName = "AlertDescription";

export { Alert, AlertTitle, AlertDescription };