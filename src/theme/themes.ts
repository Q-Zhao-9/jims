export type ThemeId = "obsidian" | "light" | "nord" | "rose" | "midnight";

export const THEMES: { id: ThemeId; label: string; description: string }[] = [
  { id: "obsidian", label: "Obsidian", description: "Dark teal — default" },
  { id: "light", label: "Paper", description: "Clean light" },
  { id: "nord", label: "Nord", description: "Arctic blue-gray" },
  { id: "rose", label: "Rose", description: "Warm dark rose" },
  { id: "midnight", label: "Midnight", description: "Deep slate indigo" },
];

export const THEME_STORAGE_KEY = "jims-theme";

export function isThemeId(value: string | null): value is ThemeId {
  return THEMES.some((t) => t.id === value);
}
