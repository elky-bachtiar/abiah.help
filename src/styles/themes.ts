/**
 * Theme definitions for Abiah.help
 * 
 * This file defines the CSS variables for different themes and color schemes.
 * These are applied to the :root element based on the selected theme and color scheme.
 */

// Base theme (light mode, default color scheme)
export const baseTheme = `
  --primary: #2A2F6D;
  --primary-50: #F0F1F8;
  --primary-100: #E1E4F1;
  --primary-200: #C3C8E3;
  --primary-300: #A5ADD5;
  --primary-400: #8791C7;
  --primary-500: #6975B9;
  --primary-600: #4B5AAB;
  --primary-700: #2A2F6D;
  --primary-800: #212654;
  --primary-900: #181C3B;
  
  --secondary: #F9B94E;
  --secondary-50: #FEF9F0;
  --secondary-100: #FDF2E1;
  --secondary-200: #FBE5C3;
  --secondary-300: #F9D8A5;
  --secondary-400: #F7CB87;
  --secondary-500: #F5BE69;
  --secondary-600: #F3B14B;
  --secondary-700: #F9B94E;
  --secondary-800: #E5A43E;
  --secondary-900: #D18F2E;
  
  --neutral: #5B5F77;
  --neutral-50: #F7F8F9;
  --neutral-100: #F0F1F3;
  --neutral-200: #E1E3E7;
  --neutral-300: #D2D5DB;
  --neutral-400: #C3C7CF;
  --neutral-500: #B4B9C3;
  --neutral-600: #A5ABB7;
  --neutral-700: #969DAB;
  --neutral-800: #87909F;
  --neutral-900: #5B5F77;
  
  --success: #10B981;
  --warning: #F59E0B;
  --error: #EF4444;
  
  --background-primary: #FFFFFF;
  --background-secondary: #F8FAFC;
  
  --text-primary: #1F2937;
  --text-secondary: #6B7280;
`;

// Dark theme
export const darkTheme = `
  --background-primary: #1F2937;
  --background-secondary: #111827;
  
  --text-primary: #F9FAFB;
  --text-secondary: #D1D5DB;
  
  --neutral-50: #374151;
  --neutral-100: #4B5563;
  --neutral-200: #6B7280;
  --neutral-300: #9CA3AF;
  --neutral-400: #D1D5DB;
  
  --primary-50: #1E2142;
  --primary-100: #2A2F6D;
  --primary-800: #A5ADD5;
  --primary-900: #C3C8E3;
`;

// Color schemes
export const colorSchemes = {
  default: `
    /* Default color scheme uses the base colors */
  `,
  
  blue: `
    --primary: #1E40AF;
    --primary-50: #EFF6FF;
    --primary-100: #DBEAFE;
    --primary-200: #BFDBFE;
    --primary-300: #93C5FD;
    --primary-400: #60A5FA;
    --primary-500: #3B82F6;
    --primary-600: #2563EB;
    --primary-700: #1D4ED8;
    --primary-800: #1E40AF;
    --primary-900: #1E3A8A;
    
    --secondary: #F59E0B;
    --secondary-50: #FFFBEB;
    --secondary-100: #FEF3C7;
    --secondary-200: #FDE68A;
    --secondary-300: #FCD34D;
    --secondary-400: #FBBF24;
    --secondary-500: #F59E0B;
    --secondary-600: #D97706;
    --secondary-700: #B45309;
    --secondary-800: #92400E;
    --secondary-900: #78350F;
  `,
  
  green: `
    --primary: #047857;
    --primary-50: #ECFDF5;
    --primary-100: #D1FAE5;
    --primary-200: #A7F3D0;
    --primary-300: #6EE7B7;
    --primary-400: #34D399;
    --primary-500: #10B981;
    --primary-600: #059669;
    --primary-700: #047857;
    --primary-800: #065F46;
    --primary-900: #064E3B;
    
    --secondary: #8B5CF6;
    --secondary-50: #F5F3FF;
    --secondary-100: #EDE9FE;
    --secondary-200: #DDD6FE;
    --secondary-300: #C4B5FD;
    --secondary-400: #A78BFA;
    --secondary-500: #8B5CF6;
    --secondary-600: #7C3AED;
    --secondary-700: #6D28D9;
    --secondary-800: #5B21B6;
    --secondary-900: #4C1D95;
  `,
  
  purple: `
    --primary: #7E22CE;
    --primary-50: #FAF5FF;
    --primary-100: #F3E8FF;
    --primary-200: #E9D5FF;
    --primary-300: #D8B4FE;
    --primary-400: #C084FC;
    --primary-500: #A855F7;
    --primary-600: #9333EA;
    --primary-700: #7E22CE;
    --primary-800: #6B21A8;
    --primary-900: #581C87;
    
    --secondary: #EC4899;
    --secondary-50: #FDF2F8;
    --secondary-100: #FCE7F3;
    --secondary-200: #FBCFE8;
    --secondary-300: #F9A8D4;
    --secondary-400: #F472B6;
    --secondary-500: #EC4899;
    --secondary-600: #DB2777;
    --secondary-700: #BE185D;
    --secondary-800: #9D174D;
    --secondary-900: #831843;
  `
};

// Font sizes
export const fontSizes = {
  small: {
    'html': '14px',
    'h1': '1.75rem',
    'h2': '1.5rem',
    'h3': '1.25rem',
    'h4': '1.125rem',
    'body': '0.875rem'
  },
  medium: {
    'html': '16px',
    'h1': '2rem',
    'h2': '1.75rem',
    'h3': '1.5rem',
    'h4': '1.25rem',
    'body': '1rem'
  },
  large: {
    'html': '18px',
    'h1': '2.25rem',
    'h2': '2rem',
    'h3': '1.75rem',
    'h4': '1.5rem',
    'body': '1.125rem'
  },
  'x-large': {
    'html': '20px',
    'h1': '2.5rem',
    'h2': '2.25rem',
    'h3': '2rem',
    'h4': '1.75rem',
    'body': '1.25rem'
  }
};

// Generate CSS for a theme
export function generateThemeCSS(
  theme: 'light' | 'dark',
  colorScheme: string = 'default',
  fontSize: string = 'medium'
): string {
  let css = baseTheme;
  
  // Add dark theme overrides if needed
  if (theme === 'dark') {
    css += darkTheme;
  }
  
  // Add color scheme
  if (colorScheme in colorSchemes) {
    css += colorSchemes[colorScheme as keyof typeof colorSchemes];
  }
  
  // Add font size
  if (fontSize in fontSizes) {
    const sizes = fontSizes[fontSize as keyof typeof fontSizes];
    css += `
      font-size: ${sizes.html};
    `;
  }
  
  return css;
}