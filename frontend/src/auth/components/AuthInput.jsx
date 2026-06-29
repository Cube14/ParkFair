import { Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

import { useTheme } from "../../context/ThemeContext";

function AuthInput({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  icon,
  name,
  error,
}) {
  const { theme } = useTheme();

  const [showPassword, setShowPassword] =
    useState(false);

  const [focused, setFocused] =
    useState(false);

  const actualType =
    type === "password"
      ? showPassword
        ? "text"
        : "password"
      : type;

  const active =
    focused || value?.length > 0;

  return (
    <div className="space-y-2">
      <div className="relative">

        {/* INPUT CONTAINER */}

        <motion.div
          animate={{
            scale: focused
              ? 1.01
              : 1,
          }}
          transition={{
            duration: 0.2,
          }}
          className={`
            relative
            overflow-hidden

            rounded-3xl
            border

            ${
              theme === "dark"
                ? `
                  bg-zinc-950/70
                  border-zinc-800
                `
                : `
                  bg-white/90
                  border-zinc-200
                `
            }

            ${
              focused
                ? `
                  shadow-[0_0_40px_rgba(239,68,68,0.15)]
                `
                : ""
            }
          `}
        >

          {/* SHIMMER */}

          <motion.div
            animate={{
              x: [
                "-100%",
                "200%",
              ],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "linear",
            }}
            className="
              absolute
              inset-0

              bg-gradient-to-r
              from-transparent
              via-white/5
              to-transparent

              pointer-events-none
            "
          />

          {/* ICON AREA */}

          {icon && (
            <div
              className={`
                absolute
                left-4
                top-1/2
                -translate-y-1/2

                transition-all
                duration-300

                ${
                  focused
                    ? "text-red-500"
                    : theme === "dark"
                    ? "text-zinc-500"
                    : "text-zinc-400"
                }
              `}
            >
              {icon}
            </div>
          )}

          {/* FLOATING LABEL */}

          {label && (
            <motion.label
              animate={{
                top: active
                  ? "12px"
                  : "50%",
                y: active
                  ? 0
                  : "-50%",
                scale: active
                  ? 0.85
                  : 1,
              }}
              transition={{
                duration: 0.2,
              }}
              className={`
                absolute
                left-12

                pointer-events-none

                ${
                  active
                    ? "text-red-500"
                    : theme === "dark"
                    ? "text-zinc-500"
                    : "text-zinc-500"
                }
              `}
            >
              {label}
            </motion.label>
          )}

          {/* INPUT */}

          <input
            name={name}
            type={actualType}
            value={value}
            onChange={onChange}
            placeholder={
              active
                ? placeholder
                : ""
            }
            onFocus={() =>
              setFocused(true)
            }
            onBlur={() =>
              setFocused(false)
            }
            className={`
              w-full

              ${
                active
                  ? "pt-7"
                  : ""
              }

              h-16

              bg-transparent

              outline-none

              ${
                icon
                  ? "pl-12"
                  : "pl-5"
              }

              ${
                type ===
                "password"
                  ? "pr-14"
                  : "pr-5"
              }

              ${
                theme === "dark"
                  ? `
                    text-white
                    placeholder:text-zinc-600
                  `
                  : `
                    text-zinc-900
                    placeholder:text-zinc-500
                  `
              }
            `}
          />

          {/* FOCUS BAR */}

          <motion.div
            initial={{
              scaleX: 0,
            }}
            animate={{
              scaleX: focused
                ? 1
                : 0,
            }}
            transition={{
              duration: 0.25,
            }}
            className="
              absolute
              bottom-0
              left-0

              h-[2px]
              w-full

              bg-gradient-to-r
              from-red-500
              via-red-400
              to-red-500

              origin-left
            "
          />

          {/* PASSWORD BUTTON */}

          {type ===
            "password" && (
            <button
              type="button"
              onClick={() =>
                setShowPassword(
                  !showPassword
                )
              }
              className={`
                absolute
                right-4
                top-1/2
                -translate-y-1/2

                transition-all

                ${
                  focused
                    ? "text-red-500"
                    : theme === "dark"
                    ? "text-zinc-500"
                    : "text-zinc-400"
                }
              `}
            >
              {showPassword ? (
                <EyeOff
                  size={20}
                />
              ) : (
                <Eye
                  size={20}
                />
              )}
            </button>
          )}
        </motion.div>

        {/* ERROR */}

        {error && (
          <motion.p
            initial={{
              opacity: 0,
              y: -5,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="
              mt-2
              ml-2

              text-sm
              text-red-500
            "
          >
            {error}
          </motion.p>
        )}
      </div>
    </div>
  );
}

export default AuthInput;