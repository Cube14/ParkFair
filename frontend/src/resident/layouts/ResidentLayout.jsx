import { Outlet } from "react-router-dom";
import { motion } from "framer-motion";

import ResidentHeader from "../components/ResidentHeader";
import BottomNav from "../components/BottomNav";
import ResidentSidebar from "../components/ResidentSidebar";

import { useTheme } from "../../context/ThemeContext";

function ResidentLayout() {
  const { theme } = useTheme();

  return (
    <div
      className={`
        relative
        min-h-screen
        overflow-hidden

        ${
          theme === "dark"
            ? "bg-black text-white"
            : "bg-zinc-100 text-zinc-900"
        }
      `}
    >
      {/* BACKGROUND LAYER */}

      <div
        className="
          absolute
          inset-0
          overflow-hidden
          pointer-events-none
        "
      >
        <motion.div
          animate={{
            x: [0, 150, 0],
            y: [0, -100, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="
            absolute
            top-0
            left-0

            w-[600px]
            h-[600px]

            rounded-full

            bg-red-500/10

            blur-[180px]
          "
        />

        <motion.div
          animate={{
            x: [0, -120, 0],
            y: [0, 120, 0],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="
            absolute
            bottom-0
            right-0

            w-[500px]
            h-[500px]

            rounded-full

            bg-red-500/10

            blur-[180px]
          "
        />
      </div>

      {/* DESKTOP SIDEBAR */}

      <div
        className="
          hidden
          lg:block
          fixed
          left-0
          top-0
          h-screen
          z-40
        "
      >
        <ResidentSidebar />
      </div>

      {/* CONTENT WRAPPER */}

      <div
        className="
          relative
          z-10

          lg:pl-[320px]

          min-h-screen
        "
      >
        <ResidentHeader />
                <main
          className="
            px-4
            md:px-6
            xl:px-10

            pt-24
            pb-32

            max-w-[1800px]
            mx-auto
          "
        >
          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.4,
            }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>

      {/* MOBILE NAVIGATION */}

      <div
        className="
          lg:hidden
          fixed
          bottom-0
          left-0
          right-0

          z-50
        "
      >
        <BottomNav />
      </div>
    </div>
  );
}

export default ResidentLayout;