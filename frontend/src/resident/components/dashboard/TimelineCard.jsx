import { motion } from "framer-motion";

import {
  CheckCircle2,
  Car,
  ParkingCircle,
  Clock3,
  ArrowRightLeft,
  Trophy,
} from "lucide-react";

const timeline = [
  {
    title: "Cycle Created",
    description:
      "Summer Rotation Cycle initialized.",
    date: "12 Jun 2026",
    icon: CheckCircle2,
    active: true,
  },

  {
    title: "Vehicle Assigned",
    description:
      "Vehicle added to rotation pool.",
    date: "14 Jun 2026",
    icon: Car,
    active: true,
  },

  {
    title: "Inside Parking",
    description:
      "Allocated Slot A-07.",
    date: "18 Jun 2026",
    icon: ParkingCircle,
    active: true,
  },

  {
    title: "Current Position",
    description:
      "Currently parked inside society.",
    date: "Today",
    icon: Trophy,
    active: true,
    current: true,
  },

  {
    title: "Next Rotation",
    description:
      "Vehicle moves to next allocation.",
    date: "12 Days Left",
    icon: ArrowRightLeft,
    active: false,
  },

  {
    title: "Future Allocation",
    description:
      "Awaiting cycle calculation.",
    date: "Pending",
    icon: Clock3,
    active: false,
  },
];

function TimelineCard() {
  return (
    <motion.section
      initial={{
        opacity: 0,
        y: 40,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.6,
      }}
      className="mt-8"
    >
      <div
        className="
          relative

          overflow-hidden

          rounded-[40px]

          border
          border-white/10

          bg-black/40

          backdrop-blur-3xl

          p-8
          lg:p-10
        "
      >
        {/* AMBIENT GLOW */}

        <div
          className="
            absolute

            right-0
            top-0

            w-[400px]
            h-[400px]

            bg-red-500/10

            rounded-full

            blur-[180px]
          "
        />

        {/* HEADER */}

        <div
          className="
            relative
            z-10

            flex
            flex-col
            md:flex-row

            md:items-center
            md:justify-between

            gap-4

            mb-12
          "
        >
          <div>
            <p
              className="
                text-red-400

                uppercase

                tracking-[0.3em]

                text-xs

                mb-3
              "
            >
              Resident Journey
            </p>

            <h2
              className="
                text-4xl
                lg:text-5xl

                font-black
              "
            >
              Parking Timeline
            </h2>
          </div>

          <div
            className="
              px-5
              py-3

              rounded-full

              border
              border-red-500/20

              bg-red-500/10

              text-red-300

              text-sm
              font-semibold
            "
          >
            Live Cycle Tracking
          </div>
        </div>

        {/* TIMELINE */}

        <div
          className="
            relative
            z-10
          "
        >
          {timeline.map(
            (
              item,
              index
            ) => {
              const Icon =
                item.icon;

              return (
                <motion.div
                  key={item.title}
                  initial={{
                    opacity: 0,
                    x: -40,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                  }}
                  transition={{
                    delay:
                      index * 0.1,
                  }}
                  className="
                    relative

                    flex

                    gap-6

                    pb-10
                  "
                >
                  {/* LINE */}

                  {index !==
                    timeline.length -
                      1 && (
                    <div
                      className={`
                        absolute

                        left-[22px]
                        top-[55px]

                        w-[2px]
                        h-full

                        ${
                          item.active
                            ? "bg-gradient-to-b from-red-500 to-red-500/20"
                            : "bg-white/10"
                        }
                      `}
                    />
                  )}

                  {/* ICON */}

                  <motion.div
                    whileHover={{
                      scale: 1.08,
                    }}
                    className={`
                      relative

                      min-w-[46px]
                      h-[46px]

                      rounded-full

                      flex
                      items-center
                      justify-center

                      border

                      ${
                        item.active
                          ? `
                            bg-red-500/15
                            border-red-500/30
                          `
                          : `
                            bg-white/5
                            border-white/10
                          `
                      }
                    `}
                  >
                    {item.current && (
                      <motion.div
                        animate={{
                          scale: [
                            1,
                            1.5,
                            1,
                          ],
                          opacity: [
                            0.5,
                            0,
                            0.5,
                          ],
                        }}
                        transition={{
                          duration: 2,
                          repeat:
                            Infinity,
                        }}
                        className="
                          absolute

                          inset-0

                          rounded-full

                          border
                          border-red-500
                        "
                      />
                    )}

                    <Icon
                      size={18}
                      className={
                        item.active
                          ? "text-red-400"
                          : "text-zinc-500"
                      }
                    />
                  </motion.div>

                  {/* CONTENT */}

                  <motion.div
                    whileHover={{
                      x: 5,
                    }}
                    className="
                      flex-1
                    "
                  >
                    <div
                      className="
                        rounded-[28px]

                        border
                        border-white/10

                        bg-white/5

                        backdrop-blur-xl

                        p-5
                      "
                    >
                      <div
                        className="
                          flex

                          flex-col
                          md:flex-row

                          md:items-center
                          md:justify-between

                          gap-3
                        "
                      >
                        <div>
                          <h3
                            className="
                              text-xl
                              font-bold
                            "
                          >
                            {
                              item.title
                            }
                          </h3>

                          <p
                            className="
                              mt-2

                              text-zinc-400
                            "
                          >
                            {
                              item.description
                            }
                          </p>
                        </div>

                        <div
                          className={`
                            px-4
                            py-2

                            rounded-full

                            text-sm
                            font-semibold

                            ${
                              item.active
                                ? `
                                  bg-red-500/10
                                  text-red-300
                                `
                                : `
                                  bg-white/5
                                  text-zinc-500
                                `
                            }
                          `}
                        >
                          {item.date}
                        </div>
                      </div>

                      {item.current && (
                        <div
                          className="
                            mt-5

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

                              text-emerald-400

                              font-medium
                            "
                          >
                            Current Active Stage
                          </span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </motion.div>
              );
            }
          )}
        </div>
      </div>
    </motion.section>
  );
}

export default TimelineCard;