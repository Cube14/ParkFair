import { useState } from "react";

import {
  LayoutDashboard,
  Building2,
  CarFront,
  CalendarRange,
  ClipboardList,
  ParkingSquare,
  BarChart3,
  Settings,
  Menu,
  X,
} from "lucide-react";

import {
  Link,
  useLocation,
} from "react-router-dom";

import {
  useTheme,
} from "../context/ThemeContext";

import {
  getThemeClasses,
} from "../utils/theme";

function Sidebar() {
  const [isOpen, setIsOpen] =
    useState(false);

  const location =
    useLocation();

  const { theme } =
    useTheme();

  const styles =
    getThemeClasses(theme);

  const menuItems = [
    {
      name: "Command Center",
      icon: LayoutDashboard,
      path: "/",
    },

    {
      name: "Parking Grid",
      icon: ParkingSquare,
      path: "/layout",
    },

    {
      name: "Assignments",
      icon: ClipboardList,
      path: "/assignments",
    },

    {
      name: "Residences",
      icon: Building2,
      path: "/flats",
    },

    {
      name: "Vehicles",
      icon: CarFront,
      path: "/vehicles",
    },

    {
      name: "Cycles",
      icon: CalendarRange,
      path: "/cycles",
    },

    {
      name: "Analytics",
      icon: BarChart3,
      path: "/analytics",
    },

    {
      name: "Settings",
      icon: Settings,
      path: "/settings",
    },
  ];

  const isActive = (
    path
  ) => {
    return (
      location.pathname === path
    );
  };

  const renderMenuItem = (
    item
  ) => {
    const Icon = item.icon;

    return (
      <Link
        key={item.name}
        to={item.path}
        onClick={() =>
          setIsOpen(false)
        }
      >
        <div
          className={`
            flex
            items-center
            gap-3
            px-4
            py-3
            rounded-xl
            transition-all
            duration-300
            hover:translate-x-1

            ${
              isActive(item.path)
                ? `
                  bg-red-500/15
                  border
                  border-red-500/40
                  text-red-500
                  shadow-lg
                  shadow-red-500/10
                `
                : `
                  hover:bg-red-500/10
                  hover:text-red-500
                `
            }
          `}
        >
          <Icon size={22} />

          <span>
            {item.name}
          </span>
        </div>
      </Link>
    );
  };

  return (
    <>
      {/* MOBILE TOP BAR */}

      <div
        className={`
          md:hidden
          fixed
          top-0
          left-0
          right-0
          h-16
          ${styles.sidebar}
          backdrop-blur-xl
          border-b
          flex
          items-center
          gap-4
          px-4
          z-50
        `}
      >
        <button
          onClick={() =>
            setIsOpen(true)
          }
        >
          <Menu size={28} />
        </button>

        <div>
          <h1
            className="
              text-xl
              font-bold
              tracking-wider
            "
          >
            PARKFAIR
          </h1>

          <p
            className={`
              text-[10px]
              uppercase
              tracking-[0.3em]
              ${styles.muted}
            `}
          >
            COMMAND CENTER
          </p>
        </div>
      </div>

      {/* MOBILE OVERLAY */}

      {isOpen && (
        <div
          className="
            md:hidden
            fixed
            inset-0
            bg-black/60
            backdrop-blur-sm
            z-40
          "
          onClick={() =>
            setIsOpen(false)
          }
        />
      )}

      {/* MOBILE DRAWER */}

      <aside
        className={`
          md:hidden
          fixed
          top-0
          left-0
          h-screen
          w-72
          ${styles.sidebar}
          border-r
          z-50
          transition-transform
          duration-300

          ${
            isOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >
        <div
          className="
            flex
            justify-between
            items-center
            p-6
            border-b
          "
        >
          <div>
            <h1
              className="
                text-3xl
                font-black
                tracking-widest
              "
            >
              PARKFAIR
            </h1>

            <p
              className={`
                text-[10px]
                uppercase
                tracking-[0.3em]
                mt-1
                ${styles.muted}
              `}
            >
              COMMAND CENTER
            </p>
          </div>

          <button
            onClick={() =>
              setIsOpen(false)
            }
          >
            <X size={28} />
          </button>
        </div>

        <nav className="p-6 space-y-3">
          {menuItems.map(
            renderMenuItem
          )}
        </nav>
      </aside>

      {/* DESKTOP SIDEBAR */}

      <aside
        className={`
          hidden
          md:flex
          fixed
          left-0
          top-0
          h-screen
          w-72
          flex-col
          ${styles.sidebar}
          backdrop-blur-xl
          border-r
          p-6
          z-20
        `}
      >
        <div className="mb-12">
          <h1
            className="
              text-4xl
              font-black
              tracking-widest
            "
          >
            PARKFAIR
          </h1>

          <p
            className={`
              text-xs
              uppercase
              tracking-[0.4em]
              mt-2
              ${styles.muted}
            `}
          >
            COMMAND CENTER
          </p>
        </div>

        <nav className="space-y-3">
          {menuItems.map(
            renderMenuItem
          )}
        </nav>
      </aside>
    </>
  );
}

export default Sidebar;