import { motion } from "framer-motion";
import * as LottieModule from "lottie-react";

const Lottie = LottieModule.default.default;

import {
  Trophy,
  ShieldCheck,
  Clock3,
  TrendingUp,
} from "lucide-react";

import dashboardAnimation from "../../assets/lottie/dashboard.json";
console.log("LottieModule", LottieModule);
console.log("Resolved Lottie", Lottie);
console.log(typeof Lottie);

console.log(Lottie);


function QuickStats({ data }) {
const parking = data?.parking;
const cycle = data?.cycle;

const inside =
  parking?.status === "INSIDE";

const stats = [
  {
    title: "Fairness Credits",
    value: "0",
    icon: Trophy,
    color: "text-amber-400",
    glow: "shadow-amber-500/20",
  },

  {
    title: "Current Cycle",
    value: cycle?.name || "--",
    icon: TrendingUp,
    color: "text-red-400",
    glow: "shadow-red-500/20",
  },

  {
    title: "Days Remaining",
    value:
      cycle?.remainingDays != null
        ? `${cycle.remainingDays}`
        : "--",
    icon: Clock3,
    color: "text-emerald-400",
    glow: "shadow-emerald-500/20",
  },

  {
    title: "Parking Status",
    value:
      parking?.status || "--",
    icon: ShieldCheck,
    color: inside
      ? "text-emerald-400"
      : "text-amber-400",
    glow: inside
      ? "shadow-emerald-500/20"
      : "shadow-amber-500/20",
  },
];  
  return (
    <section
      className="
        mt-8
      "
    >
      <div
        className="
          grid

          grid-cols-2
          xl:grid-cols-4

          gap-5
        "
      >
        {stats.map(
          (
            stat,
            index
          ) => {
            const Icon =
              stat.icon;

            return (
              <motion.div
                key={stat.title}
                initial={{
                  opacity: 0,
                  y: 40,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay:
                    index * 0.12,
                }}
                whileHover={{
                  y: -10,
                  scale: 1.02,
                }}
                className="
                  group

                  relative

                  overflow-hidden

                  rounded-[32px]

                  border
                  border-white/10

                  bg-black/40

                  backdrop-blur-3xl

                  h-60
                  flex
                  flex-col
                  justify-btween
                  p-6
                  shadow-[0_0_40px_rgba(255,255,255,0.02)]
                "
              >
                {/* BACKGROUND LOTTIE */}

                <div
                  className="
                    absolute
                    inset-0

                    opacity-[0.08]

                    pointer-events-none
                  "
                >
                  <Lottie
                    animationData={
                      dashboardAnimation
                    }
                    loop
                  />
                </div>

                {/* GLOW */}

                <div
                  className="
                    absolute

                    -top-10
                    -right-10

                    w-32
                    h-32

                    rounded-full

                    bg-red-500/10

                    blur-3xl

                    group-hover:bg-red-500/20

                    transition-all
                    duration-500
                  "
                />

                {/* CONTENT */}

                <div
                  className="
                    relative
                    z-10
                  "
                >
                  <div
                    className="
                      flex
                      items-center
                      justify-between
                    "
                  >
                    <div
                      className="
                        text-zinc-500
                        text-sm
                        font-medium
                      "
                    >
                      {stat.title}
                    </div>

                    <motion.div
                      whileHover={{
                        rotate: 10,
                        scale: 1.1,
                      }}
                      className={`
                        w-12
                        h-12

                        rounded-2xl

                        flex
                        items-center
                        justify-center

                        bg-white/5

                        ${stat.glow}
                      `}
                    >
                      <Icon
                        size={22}
                        className={
                          stat.color
                        }
                      />
                    </motion.div>
                  </div>

                  <motion.h2
                    initial={{
                      opacity: 0,
                      scale: 0.8,
                    }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                    }}
                    transition={{
                      delay:
                        index * 0.2,
                    }}
                    className="
                      mt-6

                      text-3xl
                      md:text-4xl
                      xl:text-5xl
                      Leading-tight
                      break-words
                      font-black

                      tracking-tight
                    "
                  >
                    {stat.value}
                  </motion.h2>

                  <div
                    className="
                      mt-4

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
                        text-xs

                        text-zinc-500
                      "
                    >
                      Live Resident Data
                    </span>
                  </div>
                </div>

                {/* BORDER SHINE */}

                <motion.div
                  animate={{
                    x: [
                      "-100%",
                      "200%",
                    ],
                  }}
                  transition={{
                    repeat:
                      Infinity,
                    duration: 4,
                    ease: "linear",
                  }}
                  className="
                    absolute

                    top-0
                    left-0

                    w-20
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
    </section>
  );
}

export default QuickStats;