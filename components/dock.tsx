"use client";
/* eslint-disable */

import React, { useRef, useContext } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { motion, useMotionValue } from "framer-motion";
import { cn } from "@/lib/utils";

// Create a context for mouseX
const MouseXContext = React.createContext<any>(null);

export interface DockProps extends VariantProps<typeof dockVariants> {
  className?: string;
  magnification?: number;
  distance?: number;
  direction?: "top" | "middle" | "bottom";
  children: React.ReactNode;
}

const DEFAULT_MAGNIFICATION = 60;
const DEFAULT_DISTANCE = 140;

const dockVariants = cva(
  "mx-auto w-max mt-8 h-[58px] p-2 flex gap-2 rounded-2xl border supports-backdrop-blur:bg-white/10 supports-backdrop-blur:dark:bg-black/10 backdrop-blur-md",
);

const Dock = React.forwardRef<HTMLDivElement, DockProps>(
  (
    {
      className,
      children,
      magnification = DEFAULT_MAGNIFICATION,
      distance = DEFAULT_DISTANCE,
      direction = "bottom",
      ...props
    },
    ref,
  ) => {
    const mouseX = useMotionValue(Infinity);

    return (
      <MouseXContext.Provider value={mouseX}>
        <motion.div
          ref={ref}
          onMouseMove={(e) => mouseX.set(e.pageX)}
          onMouseLeave={() => mouseX.set(Infinity)}
          {...props}
          className={cn(dockVariants({ className }), {
            "items-start": direction === "top",
            "items-center": direction === "middle",
            "items-end": direction === "bottom",
          })}
        >
          {React.Children.map(children, (child) => {
            if (React.isValidElement(child)) {
              return React.cloneElement(child as React.ReactElement, {
                magnification,
                distance,
              });
            }
            return child;
          })}
        </motion.div>
      </MouseXContext.Provider>
    );
  },
);

Dock.displayName = "Dock";

export interface DockIconProps {
  size?: number;
  magnification?: number;
  distance?: number;
  className?: string;
  children?: React.ReactNode;
}

const DockIcon = React.forwardRef<HTMLDivElement, DockIconProps>(
  ({ size, magnification = DEFAULT_MAGNIFICATION, distance = DEFAULT_DISTANCE, className, children, ...props }, ref) => {
    const width = useMotionValue(40);
    const iconRef = useRef<HTMLDivElement>(null);
    const mouseX = useContext(MouseXContext);

    React.useEffect(() => {
      if (mouseX && iconRef.current) {
        const updateWidth = () => {
          const bounds = iconRef.current?.getBoundingClientRect();
          if (bounds) {
            const distanceFromIcon = Math.abs(mouseX.get() - (bounds.x + bounds.width / 2));
            const widthValue = Math.max(
              40,
              magnification - (distanceFromIcon / distance) * (magnification - 40)
            );
            width.set(widthValue);
          }
        };
        const unsubscribeMouseX = mouseX.onChange(updateWidth);
        return () => {
          unsubscribeMouseX();
        };
      }
    }, [mouseX, magnification, distance, width]);

    return (
      <motion.div
        ref={iconRef}
        style={{ width }}
        className={cn(
          "flex aspect-square cursor-pointer items-center justify-center rounded-full",
          className
        )}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

DockIcon.displayName = "DockIcon";

export { Dock, DockIcon, dockVariants };