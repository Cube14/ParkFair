import { motion } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";
import ThemeToggle from "../../components/ThemeToggle";
import darkBg from "../../resident/assets/backgrounds/dark-parking-bg.jpg";
import lightBg from "../../resident/assets/backgrounds/light-parking-bg2.jpg";
import carHero from "../../resident/assets/illustrations/car-hero.png";

function AuthLayout({
  title,
  subtitle,
  children,
}) {
  const { theme } = useTheme();

  return (
    <div
      className="
        relative
        min-h-screen
        overflow-hidden
      "
    >
    <div
        className="
          fixed
          top-5
          right-5
          z-50
        "
      >
        <ThemeToggle />
      </div>
      {/* BACKGROUND */}

      <div
        className="
          absolute
          inset-0
        "
      >
        <img
          src={
            theme === "dark"
              ? darkBg
              : lightBg
          }
          alt="Background"
          className="
            w-full
            h-full
            object-cover
          "
        />

        <div
          className={`
            absolute
            inset-0

            ${
              theme === "dark"
                ? "bg-black/70"
                : "bg-white/70"
            }
          `}
        />
      </div>

      {/* GLOW EFFECTS */}

      <motion.div
        animate={{
          x: [0, 100, 0],
          y: [0, -50, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="
          absolute
          top-20
          left-20
          w-72
          h-72
          bg-red-500/20
          rounded-full
          blur-[120px]
        "
      />

      <motion.div
        animate={{
          x: [0, -120, 0],
          y: [0, 60, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="
          absolute
          bottom-10
          right-10
          w-72
          h-72
          bg-red-500/10
          rounded-full
          blur-[120px]
        "
      />

      {/* CONTENT */}

      <div
        className="
          relative
          z-10
          min-h-screen
          flex
          items-center
          justify-center
          p-6
        "
      >
        <div
          className="
            w-full
            max-w-7xl
            grid
            lg:grid-cols-2
            gap-10
            items-center
          "
        >
          {/* HERO SECTION */}

          <motion.div
            initial={{
              opacity: 0,
              x: -80,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              duration: 0.8,
            }}
            className="
              hidden
              lg:flex
              flex-col
              items-center
              justify-center
            "
          >
            <motion.img
              src={carHero}
              alt="ParkFair"
              animate={{
                y: [0, -12, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
              }}
              className="
                w-full
                max-w-2xl
                drop-shadow-[0_20px_50px_rgba(255,45,54,0.35)]
              "
            />

            <div className="mt-10 text-center">
              <h1
                className={`
                  text-6xl
                  font-black
                  tracking-tight

                  ${
                    theme === "dark"
                      ? "text-white"
                      : "text-zinc-900"
                  }
                `}
              >
                PARKFAIR
              </h1>

              <p
                className={`
                  mt-4
                  text-2xl

                  ${
                    theme === "dark"
                      ? "text-zinc-300"
                      : "text-zinc-700"
                  }
                `}
              >
                Your Parking.
                <br />
                Simplified.
              </p>
            </div>
          </motion.div>

          {/* FORM CARD */}

          <motion.div
            initial={{
              opacity: 0,
              y: 60,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.8,
            }}
            className={`
              backdrop-blur-2xl
              border
              rounded-[32px]
              p-8
              md:p-10
              shadow-2xl

              ${
                theme === "dark"
                  ? `
                    bg-zinc-900/60
                    border-zinc-800
                  `
                  : `
                    bg-white/90
                    border-zinc-200
                  `
              }
            `}
          >
            {/* MOBILE LOGO */}

            <div
              className="
                lg:hidden
                text-center
                mb-8
              "
            >
              <motion.img
                src={carHero}
                alt="Car"
                animate={{
                  y: [0, -8, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                }}
                className="
                  w-64
                  mx-auto
                  mb-4
                "
              />

              <h1
                className={`
                  text-4xl
                  font-black

                  ${
                    theme === "dark"
                      ? "text-white"
                      : "text-zinc-900"
                  }
                `}
              >
                PARKFAIR
              </h1>

              <p
                className={`
                  mt-2

                  ${
                    theme === "dark"
                      ? "text-zinc-400"
                      : "text-zinc-600"
                  }
                `}
              >
                Your Parking. Simplified.
              </p>
            </div>

            <div className="mb-8">
              <h2
                className={`
                  text-3xl
                  font-bold

                  ${
                    theme === "dark"
                      ? "text-white"
                      : "text-zinc-900"
                  }
                `}
              >
                {title}
              </h2>

              <p
                className={`
                  mt-2

                  ${
                    theme === "dark"
                      ? "text-zinc-400"
                      : "text-zinc-600"
                  }
                `}
              >
                {subtitle}
              </p>
            </div>

            {children}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;