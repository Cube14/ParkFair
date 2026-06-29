import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import {
  Bell,
  Search,
  Sun,
  Moon,
} from "lucide-react";

import { useTheme } from "../../context/ThemeContext";

function ResidentHeader() {
  const { theme, toggleTheme } =
    useTheme();

  const [currentTime,
    setCurrentTime] =
    useState("");

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();

      setCurrentTime(
        now.toLocaleTimeString(
          [],
          {
            hour: "2-digit",
            minute: "2-digit",
          }
        )
      );
    };

    updateClock();

    const interval =
      setInterval(
        updateClock,
        1000
      );

    return () =>
      clearInterval(interval);
  }, []);

  const getGreeting = () => {
    const hour =
      new Date().getHours();

    if (hour < 12)
      return "Good Morning";

    if (hour < 17)
      return "Good Afternoon";

    if (hour < 21)
      return "Good Evening";

    return "Good Night";
  };

  return (
    <header
      className="
        fixed
        top-0
        right-0
        left-0

        lg:left-[320px]

        z-40
      "
    >
      <div
        className="
          mx-4
          mt-4

          backdrop-blur-3xl

          border
          border-white/10

          rounded-[28px]

          px-5
          py-4

          bg-black/40

          shadow-[0_0_60px_rgba(255,0,0,0.08)]
        "
      >
        <div
          className="
            flex
            items-center
            justify-between
          "
        >
          {/* LEFT */}

          <div>
            <motion.p
              initial={{
                opacity: 0,
                y: -10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              className="
                text-zinc-400
                text-sm
              "
            >
              {getGreeting()}
            </motion.p>

            <motion.h1
              initial={{
                opacity: 0,
                y: -10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.1,
              }}
              className="
                text-xl
                md:text-2xl
                font-black
              "
            >
              Shivansh
            </motion.h1>
          </div>

          {/* RIGHT */}

          <div
            className="
              flex
              items-center
              gap-3
            "
          >
            {/* CLOCK */}

            <motion.div
              whileHover={{
                scale: 1.05,
              }}
              className="
                hidden
                md:flex

                items-center

                px-4
                py-2

                rounded-full

                bg-white/5
                border
                border-white/10

                text-sm
                font-semibold
              "
            >
              {currentTime}
            </motion.div>

            {/* SEARCH */}

            <motion.button
              whileHover={{
                scale: 1.08,
              }}
              whileTap={{
                scale: 0.95,
              }}
              className="
                w-11
                h-11

                rounded-full

                bg-white/5

                border
                border-white/10

                flex
                items-center
                justify-center
              "
            >
              <Search size={18} />
            </motion.button>

            {/* NOTIFICATION */}

            <motion.button
              whileHover={{
                scale: 1.08,
              }}
              whileTap={{
                scale: 0.95,
              }}
              className="
                relative

                w-11
                h-11

                rounded-full

                bg-white/5

                border
                border-white/10

                flex
                items-center
                justify-center
              "
            >
              <Bell size={18} />

              <span
                className="
                  absolute
                  top-2
                  right-2

                  w-2
                  h-2

                  rounded-full

                  bg-red-500

                  animate-pulse
                "
              />
            </motion.button>

            {/* THEME */}

            <motion.button
              whileHover={{
                scale: 1.08,
              }}
              whileTap={{
                scale: 0.95,
              }}
              onClick={
                toggleTheme
              }
              className="
                w-11
                h-11

                rounded-full

                bg-white/5

                border
                border-white/10

                flex
                items-center
                justify-center
              "
            >
              {theme === "dark" ? (
                <Sun size={18} />
              ) : (
                <Moon size={18} />
              )}
            </motion.button>

            {/* AVATAR */}

            <motion.div
              whileHover={{
                scale: 1.08,
              }}
              className="
                w-12
                h-12

                rounded-full

                bg-gradient-to-br
                from-red-500
                via-red-600
                to-red-700

                flex
                items-center
                justify-center

                text-sm
                font-black

                shadow-lg
                shadow-red-500/40
              "
            >
              SS
            </motion.div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default ResidentHeader;