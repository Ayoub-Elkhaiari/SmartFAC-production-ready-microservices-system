import { motion } from "framer-motion";

const StatCard = ({ title, value }: { title: string; value: string }) => (
  <motion.div whileHover={{ y: -4 }} className="rounded-2xl border border-white/20 bg-white/60 p-4 shadow-sm backdrop-blur">
    <p className="text-sm text-slate-500">{title}</p>
    <p className="mt-2 text-2xl font-bold">{value}</p>
  </motion.div>
);

export default StatCard;
