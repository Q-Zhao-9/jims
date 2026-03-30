import { useTheme } from "@/context/ThemeContext";
import { THEMES } from "@/theme/themes";
import type { ThemeId } from "@/theme/themes";

export function ThemeSelect() {
  const { theme, setTheme } = useTheme();

  return (
    <label className="theme-select">
      <span className="theme-select__label">Theme</span>
      <select
        className="filter-select theme-select__input"
        value={theme}
        onChange={(e) => setTheme(e.target.value as ThemeId)}
        aria-label="Color theme"
        title="Choose UI color theme"
      >
        {THEMES.map((t) => (
          <option key={t.id} value={t.id} title={t.description}>
            {t.label}
          </option>
        ))}
      </select>
    </label>
  );
}
