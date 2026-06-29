import { motion } from "framer-motion";

import {
  LayoutDashboard,
  Car,
  CalendarDays,
  Bell,
  User,
  ChevronRight,
} from "lucide-react";

import {
  NavLink,
} from "react-router-dom";

const navItems = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/resident",
  },

  {
    label: "Parking Status",
    icon: Car,
    path: "/resident/parking",
  },

  {
    label: "Schedule",
    icon: CalendarDays,
    path: "/resident/schedule",
  },

  {
    label: "Notifications",
    icon: Bell,
    path: "/resident/notifications",
  },

  {
    label: "Profile",
    icon: User,
    path: "/resident/profile",
  },
];

function ResidentSidebar() {
  return (
    <aside
      className="
        relative

        w-[300px]
        h-screen

        p-5
      "
    >
      {/* MAIN CONTAINER */}

      <div
        className="
          relative

          h-full

          overflow-hidden

          rounded-[40px]

          backdrop-blur-3xl

          border
          border-white/10

          bg-black/40

          shadow-[0_0_80px_rgba(255,0,0,0.08)]
        "
      >
        {/* RED AMBIENT GLOW */}

        <div
          className="
            absolute
            inset-0
            pointer-events-none
          "
        >
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
            }}
            className="
              absolute

              -top-20
              -left-20

              w-72
              h-72

              rounded-full

              bg-red-500/20

              blur-[140px]
            "
          />
        </div>

        {/* CONTENT */}

        <div
          className="
            relative
            z-10

            h-full

            flex
            flex-col
          "
        >
          {/* LOGO */}

          <div
            className="
              p-6
            "
          >
            <motion.div
              whileHover={{
                scale: 1.02,
              }}
              className="
                flex
                items-center
                gap-4
              "
            >
              <div
                className="
                  w-14
                  h-14

                  rounded-2xl

                  bg-gradient-to-br
                  from-red-500
                  via-red-600
                  to-red-700

                  flex
                  items-center
                  justify-center

                  text-white
                  font-black
                  text-lg

                  shadow-lg
                  shadow-red-500/40
                "
              >
                P
              </div>

              <div>
                <h1
                  className="
                    text-2xl
                    font-black
                    tracking-tight
                  "
                >
                  ParkFair
                </h1>

                <p
                  className="
                    text-xs
                    text-zinc-500
                  "
                >
                  Your Parking.
                  Simplified.
                </p>
              </div>
            </motion.div>
          </div>

          {/* RESIDENT CARD */}

          <div
            className="
              mx-4
              mb-8

              rounded-[28px]

              border
              border-white/10

              bg-white/5

              p-5
            "
          >
            <div
              className="
                flex
                items-center
                gap-4
              "
            >
              <div
                className="
                  w-14
                  h-14

                  rounded-full

                  bg-gradient-to-br
                  from-red-500
                  to-red-700

                  flex
                  items-center
                  justify-center

                  font-bold
                "
              >
                SS
              </div>

              <div>
                <h3
                  className="
                    font-semibold
                  "
                >
                  Shivansh
                </h3>

                <p
                  className="
                    text-sm
                    text-zinc-500
                  "
                >
                  Flat 302
                </p>
              </div>
            </div>

            <div
              className="
                mt-5

                rounded-2xl

                bg-emerald-500/10

                border
                border-emerald-500/20

                p-3
              "
            >
              <div
                className="
                  flex
                  items-center
                  gap-2
                "
              >
                <div
                  className="
                    w-2
                    h-2

                    rounded-full

                    bg-emerald-400

                    animate-pulse
                  "
                />

                <span
                  className="
                    text-sm
                    font-medium

                    text-emerald-400
                  "
                >
                  Vehicle Inside Parking
                </span>
              </div>
            </div>
          </div>

          {/* NAVIGATION */}

          <div
            className="
              flex-1

              px-3
            "
          >
            <div
              className="
                space-y-2
              "
            >
              {navItems.map(
                (item) => {
                  const Icon =
                    item.icon;

                  return (
                    <NavLink
                      key={
                        item.label
                      }
                      to={
                        item.path
                      }
                    >
                      {({
                        isActive,
                      }) => (
                        <motion.div
                          whileHover={{
                            x: 6,
                          }}
                          className={`
                            relative

                            flex
                            items-center
                            justify-between

                            px-4
                            py-4

                            rounded-2xl

                            transition-all

                            ${
                              isActive
                                ? `
                                  bg-gradient-to-r
                                  from-red-500/15
                                  to-red-700/15

                                  border
                                  border-red-500/20
                                `
                                : `
                                  hover:bg-white/5
                                `
                            }
                          `}
                        >
                          <div
                            className="
                              flex
                              items-center
                              gap-4
                            "
                          >
                            <Icon
                              size={20}
                              className={
                                isActive
                                  ? "text-red-400"
                                  : "text-zinc-400"
                              }
                            />

                            <span
                              className={
                                isActive
                                  ? "font-semibold text-white"
                                  : "text-zinc-400"
                              }
                            >
                              {
                                item.label
                              }
                            </span>
                          </div>

                          {isActive && (
                            <ChevronRight
                              size={18}
                              className="
                                text-red-400
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
          </div>

          {/* FOOTER */}

          <div
            className="
              p-5
            "
          >
            <div
              className="
                rounded-[28px]

                border
                border-white/10

                bg-white/5

                p-5
              "
            >
              <p
                className="
                  text-xs
                  text-zinc-500
                  uppercase
                  tracking-wider
                "
              >
                Next Rotation
              </p>

              <h2
                className="
                  mt-2

                  text-3xl
                  font-black
                "
              >
                12 Days
              </h2>

              <p
                className="
                  mt-2

                  text-sm
                  text-zinc-500
                "
              >
                Your parking slot
                will rotate in the
                next cycle.
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default ResidentSidebar;