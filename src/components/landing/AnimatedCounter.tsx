"use client"

import { animate, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";

interface AnimatedCounterProps {
  from?: number;
  to: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
}

export function AnimatedCounter({ 
  from = 0, 
  to, 
  duration = 2.5,
  suffix = "",
  prefix = "",
  decimals
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [value, setValue] = useState(from);

  const effectiveDecimals = decimals !== undefined ? decimals : (to % 1 !== 0 ? 1 : 0);

  useEffect(() => {
    if (isInView) {
      const controls = animate(from, to, {
        duration,
        ease: "easeOut",
        onUpdate: (val) => {
          setValue(effectiveDecimals > 0 ? parseFloat(val.toFixed(effectiveDecimals)) : Math.floor(val));
        },
      });
      return () => controls.stop();
    }
  }, [isInView, from, to, duration, effectiveDecimals]);

  const displayVal = effectiveDecimals > 0 
    ? value.toFixed(effectiveDecimals) 
    : value.toLocaleString();

  return <span ref={ref}>{prefix}{displayVal}{suffix}</span>;
}
