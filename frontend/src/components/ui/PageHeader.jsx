import {
  useTheme,
} from "../../context/ThemeContext";

import {
  getThemeClasses,
} from "../../utils/theme";

function PageHeader({
  title,
  subtitle,
}) {
  const { theme } =
    useTheme();

  const styles =
    getThemeClasses(theme);

  return (
    <div className="mb-10">

      <h1
        className={`
          text-4xl
          md:text-5xl
          font-bold
          ${styles.text}
        `}
      >
        {title}
      </h1>

      {subtitle && (
        <p
          className={`
            mt-2
            ${styles.muted}
          `}
        >
          {subtitle}
        </p>
      )}

    </div>
  );
}

export default PageHeader;