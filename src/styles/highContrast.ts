/**
 * High Contrast Theme Configuration
 * Sharp corners (border-radius: 0) and high contrast colors
 */

export const highContrastColors = {
  // Base colors
  black: '#000000',
  white: '#FFFFFF',
  red: '#FF0000',
  yellow: '#FFFF00',
  green: '#00FF00',
  blue: '#0000FF',
  cyan: '#00FFFF',
  magenta: '#FF00FF',

  // Grays
  lightGray: '#CCCCCC',
  gray: '#808080',
  darkGray: '#333333',

  // Theme colors
  primary: '#000000',
  secondary: '#FFFFFF',
  accent: '#FF0000',
  warning: '#FFFF00',
  success: '#00FF00',
  info: '#00FFFF',
  error: '#FF0000',

  // Text
  textPrimary: '#000000',
  textSecondary: '#333333',
  textInverse: '#FFFFFF',

  // Borders
  border: '#000000',
  borderThick: '#000000',

  // Backgrounds
  bgPrimary: '#FFFFFF',
  bgSecondary: '#F0F0F0',
  bgDark: '#000000',
  bgGray: '#CCCCCC'
};

export const highContrastStyles = {
  // No rounded corners
  borderRadius: 0,

  // Thick borders for better visibility
  borderWidth: {
    thin: '2px',
    normal: '3px',
    thick: '4px'
  },

  // Box shadows for depth
  boxShadow: {
    sm: '0 2px 4px rgba(0,0,0,0.8)',
    md: '0 4px 8px rgba(0,0,0,0.8)',
    lg: '0 8px 16px rgba(0,0,0,0.8)',
    xl: '0 12px 24px rgba(0,0,0,0.9)'
  },

  // Button styles
  button: {
    primary: {
      background: highContrastColors.black,
      color: highContrastColors.white,
      border: `3px solid ${highContrastColors.black}`,
      borderRadius: 0
    },
    secondary: {
      background: highContrastColors.white,
      color: highContrastColors.black,
      border: `3px solid ${highContrastColors.black}`,
      borderRadius: 0
    },
    danger: {
      background: highContrastColors.red,
      color: highContrastColors.white,
      border: `3px solid ${highContrastColors.black}`,
      borderRadius: 0
    },
    warning: {
      background: highContrastColors.yellow,
      color: highContrastColors.black,
      border: `3px solid ${highContrastColors.black}`,
      borderRadius: 0
    },
    success: {
      background: highContrastColors.green,
      color: highContrastColors.black,
      border: `3px solid ${highContrastColors.black}`,
      borderRadius: 0
    }
  },

  // Card/Panel styles
  card: {
    background: highContrastColors.white,
    border: `3px solid ${highContrastColors.black}`,
    borderRadius: 0,
    boxShadow: '0 4px 8px rgba(0,0,0,0.8)'
  },

  // Input styles
  input: {
    background: highContrastColors.white,
    color: highContrastColors.black,
    border: `3px solid ${highContrastColors.black}`,
    borderRadius: 0,
    padding: '10px 15px'
  },

  // Modal/Overlay
  overlay: {
    background: 'rgba(0, 0, 0, 0.9)',
    backdropFilter: 'none' // Remove blur for better contrast
  }
};

// Helper function to create button style
export const createButtonStyle = (type: keyof typeof highContrastStyles.button = 'primary') => ({
  ...highContrastStyles.button[type],
  padding: '10px 20px',
  cursor: 'pointer',
  fontWeight: 'bold',
  fontSize: '14px',
  transition: 'all 0.2s ease',
  boxShadow: highContrastStyles.boxShadow.md
});

// Helper function to create card style
export const createCardStyle = () => ({
  ...highContrastStyles.card,
  padding: '20px'
});

// Helper function to create input style
export const createInputStyle = () => ({
  ...highContrastStyles.input,
  width: '100%'
});
