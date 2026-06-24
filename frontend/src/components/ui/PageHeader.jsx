function PageHeader({
  title,
  subtitle,
}) {
  return (
    <div className="mb-10">

      <h1
        className="
        text-4xl
        md:text-5xl
        font-bold
      "
      >
        {title}
      </h1>

      {subtitle && (
        <p
          className="
          text-zinc-400
          mt-2
        "
        >
          {subtitle}
        </p>
      )}

    </div>
  );
}

export default PageHeader;