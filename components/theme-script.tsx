export const ThemeScript = () => {
  const themeScript = `
    (function() {
      try {
        const storageKey = 'linkguardian-theme';
        const theme = localStorage.getItem(storageKey) || 'system';
        const root = document.documentElement;

        if (theme === 'system') {
          const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
          root.classList.add(systemTheme);
        } else {
          root.classList.add(theme);
        }
      } catch (e) {}
    })();
  `;

  return <script dangerouslySetInnerHTML={{ __html: themeScript }} />;
};
