import { motion } from "framer-motion";

import {
  Home,
  Car,
  CalendarDays,
  Bell,
  User,
} from "lucide-react";

import {
  NavLink,
} from "react-router-dom";

const navItems = [
  {
    name: "Home",
    icon: Home,
    path: "/resident",
  },

  {
    name: "Parking",
    icon: Car,
    path: "/resident/parking",
  },

  {
    name: "Schedule",
    icon: CalendarDays,
    path: "/resident/schedule",
  },

  {
    name: "Alerts",
    icon: Bell,
    path: "/resident/notifications",
  },

  {
    name: "Profile",
    icon: User,
    path: "/resident/profile",
  },
];

function BottomNav() {
  return (
    <div
      className="
        px-4
        pb-4
      "
    >
      <motion.div
        initial={{
          y: 100,
          opacity: 0,
        }}
        animate={{
          y: 0,
          opacity: 1,
        }}
        transition={{
          duration: 0.5,
        }}
        className="
          relative

          overflow-hidden

          backdrop-blur-3xl

          border
          border-white/10

          bg-black/65

          rounded-[32px]

          shadow-[0_0_50px_rgba(255,0,0,0.15)]

          px-2
          py-2
        "
      >
        {/* BACKGROUND GLOW */}

        <div
          className="
            absolute
            inset-0
            pointer-events-none
          "
        >
          <div
            className="
              absolute
              top-0
              left-1/2
              -translate-x-1/2

              w-40
              h-20

              bg-red-500/10

              blur-3xl
            "
          />
        </div>

        {/* NAV ITEMS */}

        <div
          className="
            relative
            z-10

            flex
            items-center
            justify-between
          "
        >
          {navItems.map(
            (item) => {
              const Icon =
                item.icon;

              return (
                <NavLink
                  key={
                    item.name
                  }
                  to={
                    item.path
                  }
                  className="
                    flex-1
                  "
                >
                  {({
                    isActive,
                  }) => (
                    <motion.div
                      whileTap={{
                        scale: 0.92,
                      }}
                      className="
                        relative

                        flex
                        flex-col
                        items-center
                        justify-center

                        py-3
                      "
                    >
                      {/* ACTIVE PILL */}

                      {isActive && (
                        <motion.div
                          layoutId="
                            activeNav
                          "
                          transition={{
                            type:
                              "spring",
                            stiffness: 350,
                            damping: 30,
                          }}
                          className="
                            absolute

                            inset-1

                            rounded-2xl

                            bg-gradient-to-br
                            from-red-500/25
                            to-red-700/25

                            border
                            border-red-500/30
                          "
                        />
                      )}

                      {/* ICON */}

                      <motion.div
                        animate={
                          isActive
                            ? {
                                y: -2,
                              }
                            : {}
                        }
                        className="
                          relative
                          z-10
                        "
                      >
                        <Icon
                          size={22}
                          className={
                            isActive
                              ? "text-red-400"
                              : "text-zinc-500"
                          }
                        />
                      </motion.div>

                      {/* TEXT */}

                      <span
                        className={`
                          relative
                          z-10

                          text-[11px]

                          mt-1

                          transition-all

                          ${
                            isActive
                              ? "text-red-400 font-semibold"
                              : "text-zinc-500"
                          }
                        `}
                      >
                        {item.name}
                      </span>

                      {/* ACTIVE DOT */}

                      {isActive && (
                        <motion.div
                          initial={{
                            scale: 0,
                          }}
                          animate={{
                            scale: 1,
                          }}
                          className="
                            absolute

                            -top-1

                            w-1.5
                            h-1.5

                            rounded-full

                            bg-red-500
                          "
                        />
                      )}
                    </motion.div>
                  )}
                </NavLink>
              );
            }
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default BottomNav;