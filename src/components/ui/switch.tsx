import * as React from "react";

import { cn } from "@/lib/utils";

const Switch = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <span className="relative inline-flex h-6 w-11 items-center">
    <input
      ref={ref}
      type="checkbox"
      className={cn(
        "peer absolute inset-0 h-full w-full cursor-pointer opacity-0",
        className
      )}
      {...props}
    />
    <span className="h-6 w-11 rounded-full bg-input transition-colors peer-checked:bg-primary peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2" />
    <span className="pointer-events-none absolute left-1 top-1 h-4 w-4 rounded-full bg-background transition-transform peer-checked:translate-x-5" />
  </span>
));

Switch.displayName = "Switch";

export { Switch };
