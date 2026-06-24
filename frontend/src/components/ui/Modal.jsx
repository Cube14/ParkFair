function Modal({
  isOpen,
  title,
  children,
  onClose,
}) {
  if (!isOpen) return null;

  return (
    <>
      <div
        className="
        fixed
        inset-0
        bg-black/70
        z-50
      "
        onClick={onClose}
      />

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
          className="
          bg-zinc-900
          border
          border-zinc-800
          rounded-3xl
          p-6
          w-full
          max-w-lg
        "
        >
          <h2
            className="
            text-2xl
            font-bold
            mb-6
          "
          >
            {title}
          </h2>

          {children}
        </div>
      </div>
    </>
  );
}

export default Modal;