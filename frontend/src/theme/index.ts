// src/theme/index.ts
import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
    palette: {
        primary: {
            main: '#2E7D32', // Green for sustainability
            light: '#66BB6A',
            dark: '#1B5E20',
        },
        secondary: {
            main: '#FF9800', // Orange for food
            light: '#FFB74D',
            dark: '#F57C00',
        },
        background: {
            default: '#F8F9FA',
            paper: '#FFFFFF',
        },
        error: {
            main: '#D32F2F',
            light: '#EF5350',
            dark: '#C62828',
        },
        warning: {
            main: '#ED6C02',
            light: '#FF9800',
            dark: '#E65100',
        },
        success: {
            main: '#2E7D32',
            light: '#4CAF50',
            dark: '#1B5E20',
        },
        text: {
            primary: '#212121',
            secondary: '#757575',
        },
    },
    typography: {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        h1: {
            fontWeight: 700,
            fontSize: '2.5rem',
            lineHeight: 1.2,
        },
        h2: {
            fontWeight: 600,
            fontSize: '2rem',
            lineHeight: 1.3,
        },
        h3: {
            fontWeight: 600,
            fontSize: '1.75rem',
            lineHeight: 1.3,
        },
        h4: {
            fontWeight: 500,
            fontSize: '1.5rem',
            lineHeight: 1.4,
        },
        h5: {
            fontWeight: 500,
            fontSize: '1.25rem',
            lineHeight: 1.4,
        },
        h6: {
            fontWeight: 500,
            fontSize: '1rem',
            lineHeight: 1.5,
        },
        subtitle1: {
            fontSize: '1rem',
            fontWeight: 400,
            lineHeight: 1.5,
        },
        subtitle2: {
            fontSize: '0.875rem',
            fontWeight: 500,
            lineHeight: 1.6,
        },
        body1: {
            fontSize: '1rem',
            fontWeight: 400,
            lineHeight: 1.6,
        },
        body2: {
            fontSize: '0.875rem',
            fontWeight: 400,
            lineHeight: 1.6,
        },
        button: {
            fontWeight: 500,
            fontSize: '0.875rem',
            textTransform: 'none' as const,
        },
    },
    shape: {
        borderRadius: 12,
    },
    spacing: 8,
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    textTransform: 'none',
                    fontWeight: 500,
                    padding: '10px 24px',
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                    },
                },
                contained: {
                    '&:hover': {
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    },
                },
                outlined: {
                    borderWidth: 2,
                    '&:hover': {
                        borderWidth: 2,
                    },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                    border: '1px solid rgba(0,0,0,0.06)',
                    '&:hover': {
                        boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                        transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.3s ease-in-out',
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 8,
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#2E7D32',
                        },
                    },
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    borderRadius: 16,
                    fontWeight: 500,
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    backgroundColor: '#FFFFFF',
                    color: '#212121',
                },
            },
        },
        MuiDrawer: {
            styleOverrides: {
                paper: {
                    borderRight: '1px solid rgba(0,0,0,0.08)',
                    boxShadow: 'none',
                },
            },
        },
        MuiAvatar: {
            styleOverrides: {
                root: {
                    backgroundColor: '#2E7D32',
                    fontWeight: 600,
                },
            },
        },
        MuiFab: {
            styleOverrides: {
                root: {
                    boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                    '&:hover': {
                        boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
                    },
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                elevation1: {
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                },
                elevation2: {
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                },
                elevation3: {
                    boxShadow: '0 6px 16px rgba(0,0,0,0.12)',
                },
            },
        },
    },
    breakpoints: {
        values: {
            xs: 0,
            sm: 600,
            md: 900,
            lg: 1200,
            xl: 1536,
        },
    },
});

// Custom theme extensions for specific use cases
export const customColors = {
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
    info: '#2196F3',
    foodSafety: {
        fresh: '#4CAF50',
        caution: '#FF9800',
        expired: '#F44336',
    },
    impact: {
        co2Saved: '#4CAF50',
        mealsServed: '#FF9800',
        wasteReduced: '#2E7D32',
    },
};

// Export theme with custom properties
declare module '@mui/material/styles' {
    interface Theme {
        customColors: typeof customColors;
    }
    interface ThemeOptions {
        customColors?: typeof customColors;
    }
}

export const themeWithExtensions = createTheme(theme, {
    customColors,
});