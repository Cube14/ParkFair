import { useState } from "react";

import {
  LayoutDashboard,
  Car,
  Calendar,
  BarChart3,
  Menu,
  X,
} from "lucide-react";

import { Link } from "react-router-dom";

function Sidebar() {
  const [isOpen, setIsOpen] =
    useState(false);

  const menuItems = [
    {
      name: "Dashboard",
      icon: LayoutDashboard,
      path: "/",
    },
    {
      name: "Parking Layout",
      icon: Car,
      path: "/layout",
    },
    {
      name: "Cycles",
      icon: Calendar,
      path: "/cycles",
    },
    {
      name: "Analytics",
      icon: BarChart3,
      path: "/analytics",
    },
  ];

  return (
    <>
      {/* MOBILE TOP BAR */}

      <div
        className="
          md:hidden
          fixed
          top-0
          left-0
          right-0
          h-16
          bg-zinc-950/90
          backdrop-blur-xl
          border-b
          border-zinc-800
          flex
          items-center
          gap-4
          px-4
          z-50
        "
      >
        <button
          onClick={() =>
            setIsOpen(true)
          }
        >
          <Menu size={28} />
        </button>

        <h1
          className="
          text-xl
          font-bold
          tracking-wide
        "
        >
          ParkFair
        </h1>
      </div>

      {/* OVERLAY */}

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
          bg-zinc-950
          border-r
          border-zinc-800
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
            border-zinc-800
          "
        >
          <h1 className="text-2xl font-bold">
            ParkFair
          </h1>

          <button
            onClick={() =>
              setIsOpen(false)
            }
          >
            <X size={28} />
          </button>
        </div>

        <nav className="p-6 space-y-3">
          {menuItems.map((item) => {
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
                  className="
                    flex
                    items-center
                    gap-3
                    px-4
                    py-3
                    rounded-xl
                    hover:bg-red-500/10
                    hover:text-red-400
                    transition-all
                  "
                >
                  <Icon size={22} />
                  {item.name}
                </div>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* DESKTOP SIDEBAR */}

      <aside
        className="
          hidden
          md:flex
          fixed
          left-0
          top-0
          h-screen
          w-64
          flex-col
          bg-zinc-950/70
          backdrop-blur-xl
          border-r
          border-zinc-800
          p-6
          z-20
        "
      >
        <h1
          className="
            text-3xl
            font-bold
            mb-12
          "
        >
          ParkFair
        </h1>

        <nav className="space-y-3">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                to={item.path}
              >
                <div
                  className="
                    flex
                    items-center
                    gap-3
                    px-4
                    py-3
                    rounded-xl
                    hover:bg-red-500/10
                    hover:text-red-400
                    transition-all
                  "
                >
                  <Icon size={22} />
                  {item.name}
                </div>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}

export default Sidebar;