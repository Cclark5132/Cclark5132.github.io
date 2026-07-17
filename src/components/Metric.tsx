import { motion, useReducedMotion } from "framer-motion";
import type { MetricData } from "../data/portfolio";

interface MetricProps {
  metric: MetricData;
}

export function Metric({ metric }: MetricProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className="metric-card p-5"
      initial={reduceMotion ? false : { opacity: 0, scale: 0.98 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3 }}
    >
      <p className="text-3xl font-semibold tracking-[-0.045em] text-cyan">{metric.value}</p>
      <p className="mt-2 text-sm font-semibold text-charcoal">{metric.label}</p>
      {metric.detail && <p className="mt-1 text-xs uppercase tracking-[0.12em] text-steel">{metric.detail}</p>}
    </motion.div>
  );
}
