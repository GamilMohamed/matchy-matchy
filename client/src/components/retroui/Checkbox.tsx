import { cn } from "@/lib/utils";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { cva, VariantProps } from "class-variance-authority";
import { Check } from "lucide-react";

const checkboxVariants = cva("border-black border-2", {
  variants: {
    variant: {
      default: " data-[state=checked]:bg-primary-500",
      outline: "",
      solid: "data-[state=checked]:bg-black *:text-white",
    },
    size: {
      sm: "h-4 w-4",
      md: "h-5 w-5",
      lg: "h-6 w-6",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "md",
  },
});

interface CheckboxProps
  extends React.ComponentProps<typeof CheckboxPrimitive.Root>,
    VariantProps<typeof checkboxVariants> {}

export const Checkbox = ({
  className,
  size,
  variant,
  ...props
}: CheckboxProps) => (
  <CheckboxPrimitive.Root
    className={cn(
      checkboxVariants({
        size,
        variant,
      }),
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator className="h-full w-full">
      <Check className="h-full w-full" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
);
