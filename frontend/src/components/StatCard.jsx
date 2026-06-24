import { motion } from "framer-motion";

function StatCard({
  title,
  value,
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 40,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      whileHover={{
        y: -5,
        scale: 1.02,
      }}
      transition={{
        duration: 0.4,
      }}
      className="
      bg-zinc-900/70
      backdrop-blur-xl
      border border-zinc-800
      rounded-2xl
      p-6
      shadow-xl
    "
    >
      <h3 className="text-zinc-400">
        {title}
      </h3>

      <p className="text-4xl font-bold mt-2">
        {value}
      </p>
    </motion.div>
  );
}

export default StatCard;