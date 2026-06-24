import { motion } from "framer-motion";

import { useTheme } from "../context/ThemeContext";
import { getThemeClasses } from "../utils/theme";

function StatCard({
  title,
  value,
  icon,
  color = "red",
}) {
  const { theme } =
    useTheme();

  const styles =
    getThemeClasses(theme);

  const colorClasses = {
    red: "text-red-500",
    green: "text-green-500",
    blue: "text-blue-500",
    yellow: "text-yellow-500",
    purple: "text-purple-500",
    orange: "text-orange-500",
  };

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 30,
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
        duration: 0.3,
      }}
      className={`
        ${styles.card}
        backdrop-blur-xl
        border
        rounded-3xl
        p-6
        transition-all
        duration-300
        hover:border-red-500/50
      `}
    >
      <div className="flex justify-between items-center">
        <div>
          <p
            className={`
              text-sm
              ${styles.muted}
            `}
          >
            {title}
          </p>

          <h2 className="text-4xl font-bold mt-2">
            {value}
          </h2>
        </div>

        <div
          className={`text-4xl ${
            colorClasses[color]
          }`}
        >
          {icon}
        </div>
      </div>
    </motion.div>
  );
}

export default StatCard;