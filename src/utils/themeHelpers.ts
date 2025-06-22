/**
 * Apply theme class to document root
 * @param theme Theme to apply ('light', 'dark', or 'system')
 */
export function applyTheme(theme: 'light' | 'dark' | 'system'): void {
  let isDark = false;
  
  if (theme === 'dark') {
    isDark = true;
  } else if (theme === 'system') {
    // Check system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    isDark = prefersDark;
  }
  
  // Apply theme to document
  if (isDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  
  // Store in localStorage
  localStorage.setItem('theme', theme);
}

/**
 * Apply color scheme to document root
 * @param colorScheme Color scheme to apply
 */
export function applyColorScheme(colorScheme: string): void {
  // Apply color scheme
  document.documentElement.setAttribute('data-color-scheme', colorScheme);
  
  // Store in localStorage
  localStorage.setItem('colorScheme', colorScheme);
}

/**
 * Apply font size to document root
 * @param fontSize Font size to apply ('small', 'medium', 'large', 'x-large')
 */
export function applyFontSize(fontSize: string): void {
  const fontSizeMap = {
    'small': '14px',
    'medium': '16px',
    'large': '18px',
    'x-large': '20px'
  };
  
  document.documentElement.style.fontSize = fontSizeMap[fontSize as keyof typeof fontSizeMap] || '16px';
  
  // Store in localStorage
  localStorage.setItem('fontSize', fontSize);
}

/**
 * Get system theme preference
 * @returns 'dark' if system prefers dark mode, 'light' otherwise
 */
export function getSystemTheme(): 'light' | 'dark' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * Get stored theme from localStorage
 * @returns Stored theme or null if not found
 */
export function getStoredTheme(): 'light' | 'dark' | 'system' | null {
  const theme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' | null;
  return theme;
}

/**
 * Get stored color scheme from localStorage
 * @returns Stored color scheme or null if not found
 */
export function getStoredColorScheme(): string | null {
  return localStorage.getItem('colorScheme');
}

/**
 * Get stored font size from localStorage
 * @returns Stored font size or null if not found
 */
export function getStoredFontSize(): string | null {
  return localStorage.getItem('fontSize');
}

/**
 * Initialize theme from stored preferences or system defaults
 */
export function initializeTheme(): void {
  const storedTheme = getStoredTheme();
  const storedColorScheme = getStoredColorScheme();
  const storedFontSize = getStoredFontSize();
  
  if (storedTheme) {
    applyTheme(storedTheme);
  }
  
  if (storedColorScheme) {
    applyColorScheme(storedColorScheme);
  }
  
  if (storedFontSize) {
    applyFontSize(storedFontSize);
  }
}