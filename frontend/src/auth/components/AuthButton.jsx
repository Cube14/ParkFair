import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

function AuthButton({
  children,
  type = "button",
  onClick,
  disabled = false,
  loading = false,
  className = "",
}) {
  const { theme } = useTheme();

  return (
    <motion.button
      whileHover={{
        scale: disabled
          ? 1
          : 1.02,
        y: disabled
          ? 0
          : -2,
      }}
      whileTap={{
        scale: disabled
          ? 1
          : 0.98,
      }}
      type={type}
      onClick={onClick}
      disabled={
        disabled || loading
      }
      className={`
        relative
        overflow-hidden

        w-full
        h-16

        rounded-3xl

        font-semibold
        text-white

        transition-all
        duration-300

        ${
          disabled || loading
            ? "cursor-not-allowed opacity-70"
            : "cursor-pointer"
        }

        ${className}
      `}
    >
      {/* OUTER GLOW */}

      <div
        className="
          absolute
          inset-0

          rounded-3xl

          bg-red-500/30

          blur-xl

          scale-110
        "
      />

      {/* MAIN BUTTON */}

      <div
        className="
          absolute
          inset-0

          rounded-3xl

          bg-gradient-to-r
          from-red-600
          via-red-500
          to-red-600
        "
      />

      {/* SHIMMER EFFECT */}

      <motion.div
        animate={{
          x: [
            "-150%",
            "250%",
          ],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "linear",
        }}
        className="
          absolute
          inset-0

          bg-gradient-to-r
          from-transparent
          via-white/20
          to-transparent

          skew-x-12
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

          bg-white/50
        "
      />

      {/* INNER GLOW */}

      <motion.div
        animate={{
          opacity: [
            0.3,
            0.7,
            0.3,
          ],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
        }}
        className="
          absolute
          inset-0

          rounded-3xl

          bg-gradient-to-r
          from-red-400/10
          via-white/10
          to-red-400/10
        "
      />

      {/* BORDER */}

      <div
        className="
          absolute
          inset-0

          rounded-3xl

          border
          border-white/20
        "
      />

      {/* CONTENT */}

      <div
        className="
          relative
          z-20

          h-full

          flex
          items-center
          justify-center
          gap-3
        "
      >
        {loading ? (
          <>
            <Loader2
              size={20}
              className="
                animate-spin
              "
            />

            <span>
              Please Wait...
            </span>
          </>
        ) : (
          children
        )}
      </div>

      {/* BOTTOM REFLECTION */}

      <div
        className="
          absolute
          bottom-0
          left-4
          right-4

          h-[1px]

          bg-white/20
        "
      />

      {/* LUXURY SHADOW */}

      <div
        className="
          absolute
          -bottom-4
          left-8
          right-8

          h-8

          bg-red-500/30

          blur-2xl

          rounded-full
        "
      />
    </motion.button>
  );
}

export default AuthButton;