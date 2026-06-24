import {
  useTheme,
} from "../../context/ThemeContext";

import {
  getThemeClasses,
} from "../../utils/theme";

function Modal({
  isOpen,
  title,
  children,
  onClose,
}) {
  const { theme } =
    useTheme();

  const styles =
    getThemeClasses(theme);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}

      <div
        className="
          fixed
          inset-0
          bg-black/70
          backdrop-blur-sm
          z-50
        "
        onClick={onClose}
      />

      {/* Modal Container */}

      <div
        className="
          fixed
          inset-0
          z-50
          flex
          items-center
          justify-center
          p-4
        "
      >
        <div
          className={`
            ${styles.modal}
            border
            rounded-3xl
            p-6
            w-full
            max-w-lg
            shadow-2xl
            transition-all
            duration-300
          `}
        >
          {/* Header */}

          <div
            className="
              flex
              items-center
              justify-between
              mb-6
            "
          >
            <h2
              className="
                text-2xl
                font-bold
              "
            >
              {title}
            </h2>

            <button
              onClick={onClose}
              className="
                text-zinc-500
                hover:text-red-500
                transition
                text-xl
                font-bold
              "
            >
              ✕
            </button>
          </div>

          {/* Content */}

          {children}
        </div>
      </div>
    </>
  );
}

export default Modal;