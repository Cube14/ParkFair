
import {
  useEffect,
  useState,
} from "react";

import toast from "react-hot-toast";

import {
  Shield,
  Building2,
  Bell,
  Phone,
  Save,
  Settings2,
  CalendarRange,
  ParkingSquare,
} from "lucide-react";

import PageHeader from "../components/ui/PageHeader";
import ActionButton from "../components/ui/ActionButton";

import {
  useTheme,
} from "../context/ThemeContext";

import {
  getThemeClasses,
} from "../utils/theme";

function Settings() {
  const { theme } =
    useTheme();

  const styles =
    getThemeClasses(theme);

  const [settings, setSettings] =
    useState({
      societyName:
        "ParkFair Society",

      cycleDuration: 15,

      outsideCapacity: 4,

      notificationsEnabled: true,

      contactNumber: "",
    });

  useEffect(() => {
    const saved =
      localStorage.getItem(
        "parkfair_settings"
      );

    if (saved) {
      setSettings(
        JSON.parse(saved)
      );
    }
  }, []);

  const saveSettings = () => {
    localStorage.setItem(
      "parkfair_settings",
      JSON.stringify(settings)
    );

    toast.success(
      "Settings Saved Successfully"
    );
  };

  return (
    <div className="space-y-8">

      <PageHeader
        title="Settings"
        subtitle="System Configuration & Administration"
      />

      {/* HERO */}

      <div
        className={`
          ${styles.glassCard}
          border
          rounded-3xl
          p-8
          relative
          overflow-hidden
        `}
      >
        <div
          className="
            absolute
            right-0
            top-0
            h-72
            w-72
            bg-red-500/10
            rounded-full
            blur-3xl
          "
        />

        <div className="relative z-10">

          <div
            className="
              inline-flex
              items-center
              gap-2
              px-4
              py-2
              rounded-full
              bg-red-500/10
              border
              border-red-500/20
              text-red-500
              text-sm
            "
          >
            <Shield size={16} />
            PARKFAIR ADMIN
          </div>

          <h1
            className="
              text-5xl
              lg:text-6xl
              font-black
              mt-6
            "
          >
            System
            <br />
            Settings
          </h1>

          <p
            className={`
              mt-4
              text-lg
              ${styles.muted}
            `}
          >
            Configure society
            preferences, cycle
            behavior and future
            notification settings.
          </p>

        </div>
      </div>

      {/* QUICK STATS */}

      <div
        className="
          grid
          md:grid-cols-2
          xl:grid-cols-4
          gap-6
        "
      >

        <InfoCard
          title="Society"
          value={
            settings.societyName
          }
          icon={
            <Building2 />
          }
          styles={styles}
        />

        <InfoCard
          title="Cycle Days"
          value={
            settings.cycleDuration
          }
          icon={
            <CalendarRange />
          }
          styles={styles}
        />

        <InfoCard
          title="Outside Capacity"
          value={
            settings.outsideCapacity
          }
          icon={
            <ParkingSquare />
          }
          styles={styles}
        />

        <InfoCard
          title="Notifications"
          value={
            settings.notificationsEnabled
              ? "ON"
              : "OFF"
          }
          icon={<Bell />}
          styles={styles}
        />

      </div>


      {/* MAIN SETTINGS */}

      <div
        className={`
          ${styles.card}
          border
          rounded-3xl
          p-8
        `}
      >
        <div
          className="
            flex
            items-center
            gap-3
            mb-8
          "
        >
          <Settings2
            className="
              text-red-500
            "
          />

          <h2
            className="
              text-2xl
              font-bold
            "
          >
            Configuration
          </h2>
        </div>

        <div
          className="
            grid
            lg:grid-cols-2
            gap-6
          "
        >

          {/* SOCIETY NAME */}

          <div>
            <label
              className="
                block
                mb-2
                font-medium
              "
            >
              Society Name
            </label>

            <input
              type="text"
              value={
                settings.societyName
              }
              onChange={(e) =>
                setSettings({
                  ...settings,
                  societyName:
                    e.target.value,
                })
              }
              className={`
                ${styles.input}
                w-full
                border
                rounded-2xl
                px-4
                py-3
              `}
            />
          </div>

          {/* CONTACT */}

          <div>
            <label
              className="
                block
                mb-2
                font-medium
              "
            >
              Contact Number
            </label>

            <div className="relative">

              <Phone
                size={18}
                className="
                  absolute
                  left-4
                  top-1/2
                  -translate-y-1/2
                  text-zinc-500
                "
              />

              <input
                type="text"
                value={
                  settings.contactNumber
                }
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    contactNumber:
                      e.target.value,
                  })
                }
                className={`
                  ${styles.input}
                  w-full
                  border
                  rounded-2xl
                  pl-11
                  pr-4
                  py-3
                `}
              />

            </div>
          </div>

          {/* CYCLE DAYS */}

          <div>
            <label
              className="
                block
                mb-2
                font-medium
              "
            >
              Cycle Duration
            </label>

            <input
              type="number"
              min="1"
              value={
                settings.cycleDuration
              }
              onChange={(e) =>
                setSettings({
                  ...settings,
                  cycleDuration:
                    Number(
                      e.target.value
                    ),
                })
              }
              className={`
                ${styles.input}
                w-full
                border
                rounded-2xl
                px-4
                py-3
              `}
            />
          </div>

          {/* OUTSIDE CAPACITY */}

          <div>
            <label
              className="
                block
                mb-2
                font-medium
              "
            >
              Outside Capacity
            </label>

            <input
              type="number"
              min="0"
              value={
                settings.outsideCapacity
              }
              onChange={(e) =>
                setSettings({
                  ...settings,
                  outsideCapacity:
                    Number(
                      e.target.value
                    ),
                })
              }
              className={`
                ${styles.input}
                w-full
                border
                rounded-2xl
                px-4
                py-3
              `}
            />
          </div>

        </div>

        {/* NOTIFICATION PANEL */}

        <div
          className="
            mt-8
            p-5
            rounded-2xl
            border
            border-zinc-700/30
            flex
            justify-between
            items-center
          "
        >
          <div>

            <h3
              className="
                font-semibold
                flex
                items-center
                gap-2
              "
            >
              <Bell
                size={18}
              />

              WhatsApp
              Notifications
            </h3>

            <p
              className={`
                mt-1
                text-sm
                ${styles.muted}
              `}
            >
              Future ParkFair
              reminder system
            </p>

          </div>

          <button
            onClick={() =>
              setSettings({
                ...settings,
                notificationsEnabled:
                  !settings.notificationsEnabled,
              })
            }
            className={`
              w-16
              h-9
              rounded-full
              transition-all
              duration-300
              relative

              ${
                settings.notificationsEnabled
                  ? "bg-green-500"
                  : "bg-zinc-500"
              }
            `}
          >
            <div
              className={`
                absolute
                top-1
                w-7
                h-7
                bg-white
                rounded-full
                transition-all
                duration-300

                ${
                  settings.notificationsEnabled
                    ? "left-8"
                    : "left-1"
                }
              `}
            />
          </button>

        </div>
      </div>


      {/* SYSTEM HEALTH */}

      <div
        className="
          grid
          md:grid-cols-2
          xl:grid-cols-3
          gap-6
        "
      >
        <div
          className="
            rounded-3xl
            p-6
            border
            border-green-500/20
            bg-green-500/10
          "
        >
          <h3
            className="
              text-green-500
              font-semibold
            "
          >
            System Status
          </h3>

          <p
            className="
              text-4xl
              font-black
              mt-3
            "
          >
            ONLINE
          </p>

          <p
            className="
              text-sm
              text-zinc-500
              mt-2
            "
          >
            All ParkFair services
            operational
          </p>
        </div>

        <div
          className="
            rounded-3xl
            p-6
            border
            border-blue-500/20
            bg-blue-500/10
          "
        >
          <h3
            className="
              text-blue-500
              font-semibold
            "
          >
            Notification Engine
          </h3>

          <p
            className="
              text-4xl
              font-black
              mt-3
            "
          >
            {settings.notificationsEnabled
              ? "READY"
              : "OFF"}
          </p>

          <p
            className="
              text-sm
              text-zinc-500
              mt-2
            "
          >
            WhatsApp integration
            preparation status
          </p>
        </div>

        <div
          className="
            rounded-3xl
            p-6
            border
            border-red-500/20
            bg-red-500/10
          "
        >
          <h3
            className="
              text-red-500
              font-semibold
            "
          >
            ParkFair Version
          </h3>

          <p
            className="
              text-4xl
              font-black
              mt-3
            "
          >
            v2.0
          </p>

          <p
            className="
              text-sm
              text-zinc-500
              mt-2
            "
          >
            Command Center
            Edition
          </p>
        </div>
      </div>

      {/* SAVE BAR */}

      <div
        className={`
          ${styles.card}
          border
          rounded-3xl
          p-6
          flex
          flex-col
          md:flex-row
          items-center
          justify-between
          gap-4
        `}
      >
        <div>

          <h3
            className="
              text-xl
              font-bold
            "
          >
            Save Configuration
          </h3>

          <p
            className={styles.muted}
          >
            Store settings locally
            and apply them across
            ParkFair.
          </p>

        </div>

        <ActionButton
          onClick={saveSettings}
          className="
            flex
            items-center
            justify-center
            gap-3
            px-8
            py-3
          "
        >
          <Save size={18} />
          <span>
            Save Settings
          </span>
        </ActionButton>

      </div>

    </div>
  );
}

function InfoCard({
  title,
  value,
  icon,
  styles,
}) {
  return (
    <div
      className={`
        ${styles.card}
        border
        rounded-3xl
        p-6
      `}
    >
      <div
        className="
          flex
          justify-between
          items-center
        "
      >
        <div>

          <p
            className={
              styles.muted
            }
          >
            {title}
          </p>

          <h2
            className="
              text-3xl
              font-black
              mt-2
            "
          >
            {value}
          </h2>

        </div>

        <div
          className="
            text-red-500
          "
        >
          {icon}
        </div>

      </div>
    </div>
  );
}

export default Settings;