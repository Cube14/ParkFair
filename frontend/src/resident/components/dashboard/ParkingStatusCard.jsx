import { motion } from "framer-motion";
import * as LottieModule from "lottie-react";

const Lottie = LottieModule.default.default;

import {
  Car,
  MapPin,
  Clock3,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

import parkingAnimation from "../../assets/lottie/parking.json";

function ParkingStatusCard() {
  const parkingStatus =
    "INSIDE";

  const slotNumber =
    "A-07";

  const vehicleNumber =
    "RJ14AB1234";

  const nextRotation =
    "12 Days";

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

        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.2, 0.35, 0.2],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
          }}
          className="
            absolute

            -top-20
            -right-20

            w-[400px]
            h-[400px]

            rounded-full

            bg-red-500/20

            blur-[150px]
          "
        />

        {/* HEADER */}

        <div
          className="
            relative
            z-10

            flex
            flex-col
            lg:flex-row

            gap-10

            items-center
          "
        >
          {/* LEFT SIDE */}

          <div
            className="
              flex-1
            "
          >
            <div
              className="
                inline-flex
                items-center
                gap-3

                px-4
                py-2

                rounded-full

                bg-emerald-500/10

                border
                border-emerald-500/20

                mb-6
              "
            >
              <CheckCircle2
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
                Active Parking Status
              </span>
            </div>

            <h2
              className="
                text-zinc-500

                uppercase

                tracking-[0.25em]

                text-sm
              "
            >
              Current Allocation
            </h2>

            <h1
              className="
                mt-4

                text-6xl
                lg:text-8xl

                font-black

                tracking-tight

                text-emerald-400
              "
            >
              {parkingStatus}
            </h1>

            <p
              className="
                mt-6

                max-w-xl

                text-zinc-400

                leading-relaxed
              "
            >
              Your vehicle is currently
              parked inside the society
              premises under the active
              parking cycle and retains
              priority access until the
              next scheduled rotation.
            </p>

            {/* DETAILS GRID */}

            <div
              className="
                mt-10

                grid

                md:grid-cols-2

                gap-4
              "
            >
              <motion.div
                whileHover={{
                  y: -5,
                }}
                className="
                  rounded-3xl

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
                    gap-3
                  "
                >
                  <Car
                    size={20}
                    className="
                      text-red-400
                    "
                  />

                  <span
                    className="
                      text-zinc-400
                    "
                  >
                    Vehicle
                  </span>
                </div>

                <h3
                  className="
                    mt-4

                    text-2xl

                    font-bold
                  "
                >
                  {vehicleNumber}
                </h3>
              </motion.div>

              <motion.div
                whileHover={{
                  y: -5,
                }}
                className="
                  rounded-3xl

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
                    gap-3
                  "
                >
                  <MapPin
                    size={20}
                    className="
                      text-red-400
                    "
                  />

                  <span
                    className="
                      text-zinc-400
                    "
                  >
                    Slot Number
                  </span>
                </div>

                <h3
                  className="
                    mt-4

                    text-2xl

                    font-bold
                  "
                >
                  {slotNumber}
                </h3>
              </motion.div>

              <motion.div
                whileHover={{
                  y: -5,
                }}
                className="
                  rounded-3xl

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
                    gap-3
                  "
                >
                  <Clock3
                    size={20}
                    className="
                      text-red-400
                    "
                  />

                  <span
                    className="
                      text-zinc-400
                    "
                  >
                    Next Rotation
                  </span>
                </div>

                <h3
                  className="
                    mt-4

                    text-2xl

                    font-bold
                  "
                >
                  {nextRotation}
                </h3>
              </motion.div>

              <motion.div
                whileHover={{
                  y: -5,
                }}
                className="
                  rounded-3xl

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
                    gap-3
                  "
                >
                  <ShieldCheck
                    size={20}
                    className="
                      text-red-400
                    "
                  />

                  <span
                    className="
                      text-zinc-400
                    "
                  >
                    Priority
                  </span>
                </div>

                <h3
                  className="
                    mt-4

                    text-2xl

                    font-bold

                    text-emerald-400
                  "
                >
                  HIGH
                </h3>
              </motion.div>
            </div>

            {/* CTA */}

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
                gap-3

                px-7
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
              View Parking Details

              <ArrowRight
                size={18}
              />
            </motion.button>
          </div>

          {/* RIGHT SIDE */}

          <div
            className="
              flex-1

              flex
              justify-center
              items-center
            "
          >
            <motion.div
              animate={{
                y: [0, -12, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
              }}
              className="
                w-full
                max-w-[500px]
              "
            >
              <Lottie
                animationData={
                  parkingAnimation
                }
                loop
              />
            </motion.div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

export default ParkingStatusCard;