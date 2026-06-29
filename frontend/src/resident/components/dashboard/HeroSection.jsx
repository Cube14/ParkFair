import { motion } from "framer-motion";
import * as LottieModule from "lottie-react";

const Lottie = LottieModule.default.default;
import {
  ArrowUpRight,
  ShieldCheck,
  Car,
  CalendarDays,
} from "lucide-react";

import dashboardHud from "../../assets/lottie/Car dashboard HUD UI.json";

import nightDriveVideo from "../../assets/backgrounds/night drive inside view.mp4";
console.log("LottieModule", LottieModule);
console.log("Resolved Lottie", Lottie);
console.log(typeof Lottie);

console.log(Lottie);
console.log("Lottie:", Lottie);
console.log("HUD:", dashboardHud);
console.log("Video:", nightDriveVideo);

function HeroSection({ data }) {
  const resident = data?.resident;
  const parking = data?.parking;
  const vehicle = data?.vehicle;
  const cycle = data?.cycle;

  const residentName =
     resident?.name || "Resident";

  const flatNumber =
        resident?.flatNumber || "--";
  const parkingStatus =
        parking?.status || "--";
  const slot = 
      parking?.slot || "Outside";
  const remainingDays =   cycle?.remainingDays ?? "--";    

  const cycleName = cycle?.name || "--";
  return (
    <motion.section
      initial={{
        opacity: 0,
        y: 30,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.8,
      }}
      className="
        relative
        overflow-hidden

        min-h-[720px]

        rounded-[42px]

        border
        border-white/10

        bg-black

        shadow-[0_0_120px_rgba(255,0,0,0.10)]
      "
    >
      {/* VIDEO */}

      <video
        autoPlay
        muted
        loop
        playsInline
        className="
          absolute
          inset-0

          w-full
          h-full

          object-cover
        "
      >
        <source
          src={nightDriveVideo}
          type="video/mp4"
        />
      </video>

      {/* OVERLAY */}

      <div
        className="
          absolute
          inset-0

          bg-gradient-to-r

          from-black
          via-black/80
          to-black/40
        "
      />

      {/* RED GLOW */}

      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.35, 0.2],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
        }}
        className="
          absolute

          top-0
          left-0

          w-[700px]
          h-[700px]

          rounded-full

          bg-red-500/20

          blur-[220px]
        "
      />

      {/* CONTENT */}

      <div
        className="
          relative
          z-10

          h-full

          p-8
          lg:p-14
        "
      >
        <div
          className="
            grid

            lg:grid-cols-2

            gap-12

            items-center
          "
        >
          {/* LEFT */}

          <div>
            {/* BADGE */}

            <motion.div
              initial={{
                opacity: 0,
                x: -20,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              className="
                inline-flex
                items-center
                gap-3

                px-5
                py-3

                rounded-full

                border
                border-red-500/20

                bg-red-500/10

                mb-8
              "
            >
              <ShieldCheck
                size={18}
                className="
                  text-red-400
                "
              />

              <span
                className="
                  text-sm
                  font-semibold
                  text-red-300
                "
              >
                Flat {flatNumber}
              </span>
            </motion.div>

            {/* TITLE */}

            <motion.h1
              initial={{
                opacity: 0,
                y: 30,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.2,
              }}
              className="
                text-5xl
                md:text-7xl

                font-black

                leading-none

                tracking-tight
              "
            >
              Good Evening,
              <br />

              <span
                className="
                  bg-gradient-to-r

                  from-white
                  via-zinc-200
                  to-red-400

                  bg-clip-text
                  text-transparent
                "
              >
                {residentName}
              </span>
            </motion.h1>

            <motion.p
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              transition={{
                delay: 0.4,
              }}
              className="
                mt-8

                max-w-xl

                text-zinc-400

                text-lg

                leading-relaxed
              "
            >
              Your vehicle is currently
              parked 

              <span className="font-semibold text-white">
              {" "}
              {parkingStatus}
              </span>

              {" "}and belongs to{" "}

             <span className="font-semibold text-red-400">
             {" "}
             Flat {flatNumber}
             </span>.

              The next parking rotation
              starts in

              <span className="font-semibold text-white">
              {" "}
              {remainingDays} days.
              </span>
            </motion.p>
                        {/* ACTION ROW */}

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
                delay: 0.6,
              }}
              className="
                mt-10

                flex
                flex-wrap

                gap-4
              "
            >
              <button
                className="
                  group

                  px-7
                  py-4

                  rounded-2xl

                  bg-gradient-to-r
                  from-red-500
                  to-red-700

                  font-semibold

                  shadow-lg
                  shadow-red-500/30

                  flex
                  items-center
                  gap-3
                "
              >
                View Parking

                <ArrowUpRight
                  size={18}
                  className="
                    transition-transform
                    group-hover:translate-x-1
                    group-hover:-translate-y-1
                  "
                />
              </button>

              <button
                className="
                  px-7
                  py-4

                  rounded-2xl

                  border
                  border-white/10

                  bg-white/5

                  backdrop-blur-xl

                  font-semibold

                  hover:bg-white/10

                  transition-all
                "
              >
                Rotation Schedule
              </button>
            </motion.div>

            {/* LIVE STATS */}

            <motion.div
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              transition={{
                delay: 0.8,
              }}
              className="
                mt-12

                grid

                grid-cols-2
                md:grid-cols-4

                gap-4
              "
            >
              {/* CARD 1 */}

              <motion.div
                whileHover={{
                  y: -6,
                }}
                className="
                  rounded-3xl

                  border
                  border-white/10

                  bg-white/5

                  backdrop-blur-xl

                  h-52
                  flex
                  flex-col
                  justify-between
                  p-6
                "
              >
                <Car
                  size={20}
                  className="
                    text-red-400
                    mb-3
                  "
                />

                <p
                  className="
                    text-zinc-500
                    text-sm
                  "
                >
                  Parking Slot
                </p>

                <h3
                  className="
                    mt-2

                    text-[clamp(1.4rem,2vw,2rem)]
                    leading-tight
                    break-words
                    font-black
                  "
                >
                  {slot}
                </h3>
              </motion.div>

              {/* CARD 2 */}

              <motion.div
                whileHover={{
                  y: -6,
                }}
                className="
                  rounded-3xl

                  border
                  border-white/10

                  bg-white/5

                  backdrop-blur-xl

                  h-52
                  flex
                  flex-col
                  justify-between
                  p-6
                "
              >
                <CalendarDays
                  size={20}
                  className="
                    text-red-400
                    mb-3
                  "
                />

                <p
                  className="
                    text-zinc-500
                    text-sm
                  "
                >
                  Next Rotation
                </p>

                <h3
                  className="
                    mt-2

                    text-[clamp(1.4rem,2vw,2rem)]
                    leading-tight
                    break-words
                    font-black
                  "
                >
                  {remainingDays} Days
                </h3>
              </motion.div>

              {/* CARD 3 */}

              <motion.div
                whileHover={{
                  y: -6,
                }}
                className="
                  rounded-3xl

                  border
                  border-white/10

                  bg-white/5

                  backdrop-blur-xl

                  h-52
                  flex
                  flex-col
                  justify-between
                  p-6
                "
              >
                <ShieldCheck
                  size={20}
                  className="
                    text-red-400
                    mb-3
                  "
                />

                <p
                  className="
                    text-zinc-500
                    text-sm
                  "
                >
                  Current Cycle
                </p>

                <h3
                  className="
                    mt-2

                    text-[clamp(1.4rem,2vw,2rem)]
                    leading-tight
                    break-words
                    font-black
                  "
                >
                  {cycleName}
                </h3>
              </motion.div>

              {/* CARD 4 */}

              <motion.div
                whileHover={{
                  y: -6,
                }}
                className="
                  rounded-3xl

                  border
                  border-white/10

                  bg-white/5

                  backdrop-blur-xl

                  h-52
                  flex
                  flex-col
                  justify-between
                  p-6
                "
              >
                <Car
                  size={20}
                  className="
                    text-red-400
                    mb-3
                  "
                />

                <p
                  className="
                    text-zinc-500
                    text-sm
                  "
                >
                  Parking Type
                </p>

                <h3
                  className="
                    mt-2

                    text-[clamp(1.4rem,2vw,2rem)]
                    leading-tight
                    break-words
                    font-black

                    text-emerald-400
                  "
                >
                  {parkingStatus}
                </h3>
              </motion.div>
            </motion.div>
          </div>

          {/* RIGHT SIDE */}

          <div
            className="
              relative

              flex
              items-center
              justify-center
            "
          >
            {/* HUD BACKPLATE */}

            <motion.div
              animate={{
                rotate: [0, 2, 0, -2, 0],
              }}
              transition={{
                duration: 12,
                repeat: Infinity,
              }}
              className="
                absolute

                w-[550px]
                h-[550px]

                rounded-full

                bg-red-500/10

                blur-[120px]
              "
            />

            {/* LOTTIE */}

            <motion.div
              animate={{
                y: [0, -15, 0],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
              }}
              className="
                relative
                z-10

                w-full
                max-w-[700px]
              "
            >
                <Lottie
                  animationData={dashboardHud}
                  loop
                />
            </motion.div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

export default HeroSection; 