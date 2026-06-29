import { motion } from "framer-motion";

import {
  Bell,
  AlertTriangle,
  CalendarClock,
  Car,
  ChevronRight,
} from "lucide-react";

import notificationIcon from "../../animations/notification.png";

const notifications = [
  {
    id: 1,
    type: "rotation",
    title: "Parking Rotation Tomorrow",
    message:
      "Your vehicle will move to the next allocation tomorrow at 9:00 AM.",
    time: "2h ago",
    unread: true,
    icon: CalendarClock,
    color: "text-red-400",
  },

  {
    id: 2,
    type: "parking",
    title: "Parking Confirmed",
    message:
      "Vehicle successfully assigned to Slot A-07.",
    time: "Yesterday",
    unread: true,
    icon: Car,
    color: "text-emerald-400",
  },

  {
    id: 3,
    type: "notice",
    title: "Society Maintenance Notice",
    message:
      "Parking area cleaning scheduled for Sunday morning.",
    time: "2 days ago",
    unread: false,
    icon: AlertTriangle,
    color: "text-amber-400",
  },
];

function NotificationPanel() {
  const unreadCount =
    notifications.filter(
      (n) => n.unread
    ).length;

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
      className="
        mt-8
      "
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

            left-0
            bottom-0

            w-[450px]
            h-[450px]

            rounded-full

            bg-red-500/10

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

            gap-5

            mb-10
          "
        >
          <div
            className="
              flex
              items-center
              gap-5
            "
          >
            <motion.div
              animate={{
                y: [0, -5, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
              }}
              className="
                w-16
                h-16

                rounded-3xl

                bg-white/5

                border
                border-white/10

                flex
                items-center
                justify-center
              "
            >
              <img
                src={notificationIcon}
                alt="Notifications"
                className="
                  w-9
                  h-9
                "
              />
            </motion.div>

            <div>
              <p
                className="
                  text-red-400

                  uppercase

                  tracking-[0.3em]

                  text-xs

                  mb-2
                "
              >
                Updates Center
              </p>

              <h2
                className="
                  text-4xl
                  lg:text-5xl

                  font-black
                "
              >
                Notifications
              </h2>
            </div>
          </div>

          <div
            className="
              flex
              items-center
              gap-3

              px-5
              py-3

              rounded-full

              bg-red-500/10

              border
              border-red-500/20
            "
          >
            <Bell
              size={18}
              className="
                text-red-400
              "
            />

            <span
              className="
                font-semibold
                text-red-300
              "
            >
              {unreadCount} Unread
            </span>
          </div>
        </div>

        {/* NOTIFICATION LIST */}

        <div
          className="
            relative
            z-10

            space-y-4
          "
        >
          {notifications.map(
            (
              notification,
              index
            ) => {
              const Icon =
                notification.icon;

              return (
                <motion.div
                  key={
                    notification.id
                  }
                  initial={{
                    opacity: 0,
                    x: -20,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                  }}
                  transition={{
                    delay:
                      index * 0.1,
                  }}
                  whileHover={{
                    x: 8,
                  }}
                  className="
                    group

                    relative

                    overflow-hidden

                    rounded-[28px]

                    border
                    border-white/10

                    bg-white/5

                    backdrop-blur-xl

                    p-5
                  "
                >
                  {/* UNREAD INDICATOR */}

                  {notification.unread && (
                    <div
                      className="
                        absolute

                        top-5
                        right-5

                        w-3
                        h-3

                        rounded-full

                        bg-red-500

                        animate-pulse
                      "
                    />
                  )}

                  <div
                    className="
                      flex

                      gap-5

                      items-start
                    "
                  >
                    <div
                      className="
                        w-14
                        h-14

                        rounded-2xl

                        bg-white/5

                        border
                        border-white/10

                        flex
                        items-center
                        justify-center

                        shrink-0
                      "
                    >
                      <Icon
                        size={22}
                        className={
                          notification.color
                        }
                      />
                    </div>

                    <div
                      className="
                        flex-1
                      "
                    >
                      <div
                        className="
                          flex

                          flex-col
                          md:flex-row

                          md:items-center
                          md:justify-between

                          gap-2
                        "
                      >
                        <h3
                          className="
                            text-lg
                            font-bold
                          "
                        >
                          {
                            notification.title
                          }
                        </h3>

                        <span
                          className="
                            text-xs

                            text-zinc-500
                          "
                        >
                          {
                            notification.time
                          }
                        </span>
                      </div>

                      <p
                        className="
                          mt-2

                          text-zinc-400

                          leading-relaxed
                        "
                      >
                        {
                          notification.message
                        }
                      </p>
                    </div>

                    <ChevronRight
                      size={20}
                      className="
                        text-zinc-500

                        transition-all

                        group-hover:text-red-400
                        group-hover:translate-x-1

                        hidden
                        md:block
                      "
                    />
                  </div>

                  {/* HOVER SHINE */}

                  <motion.div
                    animate={{
                      x: [
                        "-120%",
                        "220%",
                      ],
                    }}
                    transition={{
                      duration: 5,
                      repeat:
                        Infinity,
                      ease: "linear",
                    }}
                    className="
                      absolute

                      top-0
                      left-0

                      w-24
                      h-full

                      bg-gradient-to-r

                      from-transparent
                      via-white/10
                      to-transparent

                      skew-x-12
                    "
                  />
                </motion.div>
              );
            }
          )}
        </div>
      </div>
    </motion.section>
  );
}

export default NotificationPanel;