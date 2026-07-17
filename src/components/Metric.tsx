import { motion, useReducedMotion } from "framer-motion";
import type { MetricData } from "../data/portfolio";

interface MetricProps {
  metric: MetricData;
  compact?: boolean;
}

export function Metric({ metric, compact = false }: MetricProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={`metric-card ${compact ? "p-4" : "p-5 md:p-6"}`}
      initial={reduceMotion ? false : { opacity: 0, scale: 0.97 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45 }}
    >
      <p className={`${compact ? "text-2xl" : "text-3xl md:text-4xl"} font-semibold tracking-[-0.045em] text-white`}>{metric.value}</p>
      <p className="mt-2 text-sm font-medium text-white/85">{metric.label}</p>
      {metric.detail && <p className="mt-1 text-xs uppercase tracking-[0.16em] text-steel">{metric.detail}</p>}
    </motion.div>
  );
}
