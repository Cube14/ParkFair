import { useEffect, useState } from "react";

import { motion } from "framer-motion";

import HeroSection from "../components/dashboard/HeroSection";
import QuickStats from "../components/dashboard/QuickStats";
import ParkingStatusCard from "../components/dashboard/ParkingStatusCard";
import VehicleCard from "../components/dashboard/VehicleCard";
import TimelineCard from "../components/dashboard/TimelineCard";
import NotificationPanel from "../components/dashboard/NotificationPanel";

import residentService from "../services/residentService";

function Dashboard() {
  const [dashboard, setDashboard] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard =
    async () => {
      try {
        setLoading(true);

        const response =
          await residentService.getDashboard();

        setDashboard(response);
      } catch (err) {
        console.error(err);

        setError(
          "Unable to load resident dashboard."
        );
      } finally {
        setLoading(false);
      }
    };

  if (loading) {
    return (
      <div
        className="
          flex
          items-center
          justify-center

          h-[70vh]
        "
      >
        <div
          className="
            w-16
            h-16

            rounded-full

            border-4
            border-red-500/20
            border-t-red-500

            animate-spin
          "
        />
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="
          flex
          items-center
          justify-center

          h-[70vh]
        "
      >
        <div
          className="
            rounded-3xl

            border
            border-red-500/20

            bg-red-500/10

            px-8
            py-6

            text-red-400
          "
        >
          {error}
        </div>
      </div>
    );
  }

  return (
    <div
      className="
        relative

        space-y-8

        pb-20
      "
    >
      {/* HERO */}

      <HeroSection
        data={dashboard}
      />

      {/* QUICK STATS */}

      <QuickStats
        data={dashboard}
      />

      {/* GRID */}

      <div
        className="
          grid

          xl:grid-cols-12

          gap-8
        "
      >
        <div
          className="
            xl:col-span-7

            space-y-8
          "
        >
          <ParkingStatusCard
            data={dashboard}
          />

          <TimelineCard
            data={dashboard}
          />
        </div>

        <div
          className="
            xl:col-span-5

            space-y-8
          "
        >
          <VehicleCard
            data={dashboard}
          />

          <NotificationPanel
            data={dashboard}
          />
        </div>
      </div>

      {/* Ambient Light */}

      <motion.div
        animate={{
          opacity: [
            0.15,
            0.35,
            0.15,
          ],
          scale: [
            1,
            1.15,
            1,
          ],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
        }}
        className="
          fixed

          bottom-0
          right-0

          w-[500px]
          h-[500px]

          bg-red-500/10

          rounded-full

          blur-[220px]

          pointer-events-none

          z-0
        "
      />

      <motion.div
        animate={{
          opacity: [
            0.08,
            0.18,
            0.08,
          ],
          scale: [
            1,
            1.2,
            1,
          ],
        }}
        transition={{
          duration: 14,
          repeat: Infinity,
        }}
        className="
          fixed

          top-0
          left-0

          w-[600px]
          h-[600px]

          bg-red-500/10

          rounded-full

          blur-[240px]

          pointer-events-none

          z-0
        "
      />

      {/* Future AI */}

      <motion.div
        initial={{
          opacity: 0,
          y: 30,
        }}
        whileInView={{
          opacity: 1,
          y: 0,
        }}
        viewport={{
          once: true,
        }}
        className="
          relative

          overflow-hidden

          rounded-[40px]

          border
          border-white/10

          bg-black/40

          backdrop-blur-3xl

          p-10
        "
      >
        <div
          className="
            absolute

            inset-0

            bg-gradient-to-r

            from-red-500/5
            via-transparent
            to-red-500/5
          "
        />

        <div
          className="
            relative
            z-10
          "
        >
          <p
            className="
              text-red-400

              uppercase

              tracking-[0.3em]

              text-xs

              mb-4
            "
          >
            Coming Soon
          </p>

          <h2
            className="
              text-4xl
              lg:text-5xl

              font-black
            "
          >
            AI Parking Assistant
          </h2>

          <p
            className="
              mt-5

              max-w-3xl

              text-zinc-400

              leading-relaxed
            "
          >
            Personalized parking insights,
            fairness predictions,
            parking optimization,
            cycle forecasting,
            smart notifications and
            resident recommendations.
          </p>

          <div
            className="
              mt-8

              flex
              flex-wrap

              gap-3
            "
          >
            <div
              className="
                px-4
                py-2

                rounded-full

                bg-white/5

                border
                border-white/10
              "
            >
              AI Predictions
            </div>

            <div
              className="
                px-4
                py-2

                rounded-full

                bg-white/5

                border
                border-white/10
              "
            >
              Smart Scheduling
            </div>

            <div
              className="
                px-4
                py-2

                rounded-full

                bg-white/5

                border
                border-white/10
              "
            >
              Fairness Analytics
            </div>

            <div
              className="
                px-4
                py-2

                rounded-full

                bg-white/5

                border
                border-white/10
              "
            >
              Resident Insights
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default Dashboard;