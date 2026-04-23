"use client"

import { animate, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";

interface AnimatedCounterProps {
  from?: number;
  to: number;
  duration?: number;
  suffix?: string;
}

export function AnimatedCounter({ 
  from = 0, 
  to, 
  duration = 2.5,
  suffix = "+" 
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [value, setValue] = useState(from);

  useEffect(() => {
    if (isInView) {
      const controls = animate(from, to, {
        duration,
        ease: "easeOut",
        onUpdate: (val) => setValue(Math.floor(val)),
      });
      return () => controls.stop();
    }
  }, [isInView, from, to, duration]);

  return <span ref={ref}>{value.toLocaleString()}{suffix}</span>;
}
