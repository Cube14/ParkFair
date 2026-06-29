import { motion } from "framer-motion";

import {
  ShieldCheck,
  Car,
  Calendar,
  BadgeCheck,
  ArrowUpRight,
} from "lucide-react";

import luxuryCarVideo from "../../assets/backgrounds/luxury car still red color.mp4";

function VehicleCard() {
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

          min-h-[520px]

          border
          border-white/10

          bg-black
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
            src={luxuryCarVideo}
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
            via-black/70
            to-black/20
          "
        />

        {/* RED AMBIENT */}

        <motion.div
          animate={{
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
          }}
          className="
            absolute

            left-0
            top-0

            w-[500px]
            h-[500px]

            rounded-full

            bg-red-500/20

            blur-[180px]
          "
        />

        {/* CONTENT */}

        <div
          className="
            relative
            z-10

            h-full

            p-8
            lg:p-12

            flex
            flex-col
            justify-between
          "
        >
          {/* TOP */}

          <div>
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

                bg-emerald-500/10

                border
                border-emerald-500/20
              "
            >
              <ShieldCheck
                size={18}
                className="
                  text-emerald-400
                "
              />

              <span
                className="
                  text-sm
                  font-semibold

                  text-emerald-400
                "
              >
                Verified Vehicle
              </span>
            </motion.div>

            <motion.h2
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.2,
              }}
              className="
                mt-8

                text-5xl
                lg:text-7xl

                font-black

                tracking-tight
              "
            >
              Mercedes
              <br />

              <span
                className="
                  text-red-400
                "
              >
                AMG GT
              </span>
            </motion.h2>

            <p
              className="
                mt-6

                max-w-xl

                text-zinc-300

                text-lg
              "
            >
              Registered resident
              vehicle with active
              parking allocation and
              verified ownership.
            </p>
          </div>

          {/* BOTTOM */}

          <div
            className="
              grid

              lg:grid-cols-2

              gap-6
            "
          >
            {/* LEFT */}

            <div
              className="
                grid

                grid-cols-2

                gap-4
              "
            >
              <div
                className="
                  rounded-3xl

                  bg-white/5

                  border
                  border-white/10

                  backdrop-blur-xl

                  p-5
                "
              >
                <Car
                  size={22}
                  className="
                    text-red-400
                  "
                />

                <p
                  className="
                    mt-4

                    text-zinc-500
                    text-sm
                  "
                >
                  Vehicle Number
                </p>

                <h3
                  className="
                    mt-2

                    text-xl
                    font-bold
                  "
                >
                  RJ14AB1234
                </h3>
              </div>

              <div
                className="
                  rounded-3xl

                  bg-white/5

                  border
                  border-white/10

                  backdrop-blur-xl

                  p-5
                "
              >
                <BadgeCheck
                  size={22}
                  className="
                    text-emerald-400
                  "
                />

                <p
                  className="
                    mt-4

                    text-zinc-500
                    text-sm
                  "
                >
                  Status
                </p>

                <h3
                  className="
                    mt-2

                    text-xl
                    font-bold

                    text-emerald-400
                  "
                >
                  Active
                </h3>
              </div>

              <div
                className="
                  rounded-3xl

                  bg-white/5

                  border
                  border-white/10

                  backdrop-blur-xl

                  p-5
                "
              >
                <Calendar
                  size={22}
                  className="
                    text-red-400
                  "
                />

                <p
                  className="
                    mt-4

                    text-zinc-500
                    text-sm
                  "
                >
                  Insurance
                </p>

                <h3
                  className="
                    mt-2

                    text-xl
                    font-bold
                  "
                >
                  Valid
                </h3>
              </div>

              <div
                className="
                  rounded-3xl

                  bg-white/5

                  border
                  border-white/10

                  backdrop-blur-xl

                  p-5
                "
              >
                <ShieldCheck
                  size={22}
                  className="
                    text-red-400
                  "
                />

                <p
                  className="
                    mt-4

                    text-zinc-500
                    text-sm
                  "
                >
                  Ownership
                </p>

                <h3
                  className="
                    mt-2

                    text-xl
                    font-bold
                  "
                >
                  Verified
                </h3>
              </div>
            </div>

            {/* CTA PANEL */}

            <motion.div
              whileHover={{
                scale: 1.02,
              }}
              className="
                rounded-[32px]

                border
                border-white/10

                bg-black/30

                backdrop-blur-2xl

                p-6

                flex
                flex-col
                justify-between
              "
            >
              <div>
                <p
                  className="
                    text-zinc-500

                    uppercase

                    tracking-[0.2em]

                    text-xs
                  "
                >
                  Vehicle Profile
                </p>

                <h3
                  className="
                    mt-4

                    text-3xl

                    font-black
                  "
                >
                  Premium Resident
                  Vehicle
                </h3>

                <p
                  className="
                    mt-4

                    text-zinc-400
                  "
                >
                  Manage vehicle
                  information,
                  ownership records,
                  and parking
                  preferences.
                </p>
              </div>

              <motion.button
                whileHover={{
                  scale: 1.03,
                }}
                whileTap={{
                  scale: 0.98,
                }}
                className="
                  mt-8

                  flex
                  items-center
                  justify-center

                  gap-3

                  py-4

                  rounded-2xl

                  bg-gradient-to-r
                  from-red-500
                  to-red-700

                  font-semibold

                  shadow-lg
                  shadow-red-500/30
                "
              >
                Open Vehicle Profile

                <ArrowUpRight
                  size={18}
                />
              </motion.button>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

export default VehicleCard;