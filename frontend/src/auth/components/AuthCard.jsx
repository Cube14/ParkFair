import { motion } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";

function AuthCard({ children }) {
  const { theme } = useTheme();

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 50,
        scale: 0.96,
      }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
      }}
      transition={{
        duration: 0.7,
      }}
      whileHover={{
        y: -4,
      }}
      className="
        relative
        overflow-hidden

        w-full
        max-w-md

        rounded-[36px]

        backdrop-blur-3xl

        p-8
        md:p-10
      "
    >
      {/* OUTER GLOW */}

      <div
        className={`
          absolute
          inset-0
          rounded-[36px]

          ${
            theme === "dark"
              ? `
                bg-gradient-to-br
                from-red-500/10
                via-transparent
                to-red-500/5
              `
              : `
                bg-gradient-to-br
                from-red-500/8
                via-white/10
                to-red-500/5
              `
          }
        `}
      />

      {/* MAIN CARD */}

      <div
        className={`
          absolute
          inset-0

          rounded-[36px]
          border

          ${
            theme === "dark"
              ? `
                bg-black/35
                border-white/10
              `
              : `
                bg-white/75
                border-white/50
              `
          }
        `}
      />

      {/* TOP RED LIGHT */}

      <div
        className="
          absolute
          -top-32
          left-1/2
          -translate-x-1/2

          w-72
          h-72

          rounded-full

          bg-red-500/20

          blur-[100px]
        "
      />

      {/* BOTTOM LIGHT */}

      <div
        className="
          absolute
          -bottom-24
          right-0

          w-52
          h-52

          rounded-full

          bg-red-500/10

          blur-[90px]
        "
      />

      {/* GLASS SHIMMER */}

      <motion.div
        animate={{
          x: [
            "-120%",
            "180%",
          ],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "linear",
        }}
        className="
          absolute
          inset-0

          bg-gradient-to-r
          from-transparent
          via-white/10
          to-transparent

          skew-x-12

          pointer-events-none
        "
      />

      {/* TOP HIGHLIGHT */}

      <div
        className="
          absolute
          top-0
          left-0
          right-0

          h-px

          bg-gradient-to-r
          from-transparent
          via-white/40
          to-transparent
        "
      />

      {/* SIDE HIGHLIGHT */}

      <div
        className="
          absolute
          top-0
          bottom-0
          left-0

          w-px

          bg-gradient-to-b
          from-white/30
          via-transparent
          to-transparent
        "
      />

      {/* NOISE EFFECT */}

      <div
        className="
          absolute
          inset-0

          opacity-[0.03]

          bg-[radial-gradient(circle_at_1px_1px,white_1px,transparent_0)]

          [background-size:20px_20px]

          pointer-events-none
        "
      />

      {/* BORDER GLOW */}

      <motion.div
        animate={{
          opacity: [0.2, 0.5, 0.2],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
        }}
        className="
          absolute
          inset-0

          rounded-[36px]

          border
          border-red-500/20

          pointer-events-none
        "
      />

      {/* PARKFAIR WATERMARK */}

      <div
        className="
          absolute
          bottom-4
          right-5

          text-[10px]
          font-bold
          tracking-[0.4em]

          text-red-500/20

          select-none
          pointer-events-none
        "
      >
        PARKFAIR
      </div>

      {/* CONTENT */}

      <div
        className="
          relative
          z-10
        "
      >
        {children}
      </div>
    </motion.div>
  );
}

export default AuthCard;