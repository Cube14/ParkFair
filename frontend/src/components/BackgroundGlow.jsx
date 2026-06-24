function BackgroundGlow() {
  return (
    <>
      <div
        className="
        fixed
        top-[-200px]
        left-[-200px]
        w-[500px]
        h-[500px]
        bg-red-600/20
        blur-[150px]
        rounded-full
        pointer-events-none
      "
      />

      <div
        className="
        fixed
        bottom-[-200px]
        right-[-200px]
        w-[500px]
        h-[500px]
        bg-red-500/10
        blur-[180px]
        rounded-full
        pointer-events-none
      "
      />
    </>
  );
}

export default BackgroundGlow;