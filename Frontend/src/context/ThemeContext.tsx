import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { ThemeProvider as MUIThemeProvider, createTheme, responsiveFontSizes, PaletteMode } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

type ThemeContextType = {
  mode: PaletteMode;
  toggleColorMode: () => void;
};

const ThemeContext = createContext<ThemeContextType>({
  mode: 'light',
  toggleColorMode: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Vérifier si le mode est stocké dans localStorage ou utiliser les préférences du système
  const [mode, setMode] = useState<PaletteMode>(() => {
    const savedMode = localStorage.getItem('themeMode') as PaletteMode;
    if (savedMode && (savedMode === 'light' || savedMode === 'dark')) {
      return savedMode;
    }
    
    // Sinon, utiliser les préférences du système
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  // Mettre à jour localStorage lorsque le mode change
  useEffect(() => {
    localStorage.setItem('themeMode', mode);
  }, [mode]);

  // Fonction pour basculer entre les modes
  const toggleColorMode = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  // Create theme with improved color palettes for better contrast and professional look
  const theme = useMemo(() =>
    responsiveFontSizes(createTheme({
      palette: {
        mode,
        primary: {
          // Using a more vibrant blue that works well in both modes
          main: mode === 'dark' ? '#2196f3' : '#1976d2',
          dark: mode === 'dark' ? '#1976d2' : '#0d47a1',
          light: mode === 'dark' ? '#64b5f6' : '#42a5f5',
          contrastText: '#ffffff',
        },
        secondary: {
          // More neutral secondary color for professional look
          main: mode === 'dark' ? '#9e9e9e' : '#424242',
          dark: mode === 'dark' ? '#757575' : '#212121',
          light: mode === 'dark' ? '#bdbdbd' : '#757575',
          contrastText: mode === 'dark' ? '#000000' : '#ffffff',
        },
        success: {
          // Improved green with better contrast
          main: mode === 'dark' ? '#4caf50' : '#2e7d32',
          light: mode === 'dark' ? 'rgba(76, 175, 80, 0.16)' : 'rgba(46, 125, 50, 0.12)',
          dark: mode === 'dark' ? '#388e3c' : '#1b5e20',
          contrastText: '#ffffff',
        },
        error: {
          // Improved red with better contrast
          main: mode === 'dark' ? '#f44336' : '#d32f2f',
          light: mode === 'dark' ? 'rgba(244, 67, 54, 0.16)' : 'rgba(211, 47, 47, 0.12)',
          dark: mode === 'dark' ? '#d32f2f' : '#b71c1c',
          contrastText: '#ffffff',
        },
        warning: {
          // Improved orange with better contrast
          main: mode === 'dark' ? '#ff9800' : '#ed6c02',
          light: mode === 'dark' ? 'rgba(255, 152, 0, 0.16)' : 'rgba(237, 108, 2, 0.12)',
          dark: mode === 'dark' ? '#f57c00' : '#e65100',
          contrastText: mode === 'dark' ? '#000000' : '#ffffff',
        },
        info: {
          // Adding info color for completeness
          main: mode === 'dark' ? '#29b6f6' : '#0288d1',
          light: mode === 'dark' ? 'rgba(41, 182, 246, 0.16)' : 'rgba(2, 136, 209, 0.12)',
          dark: mode === 'dark' ? '#0288d1' : '#01579b',
          contrastText: mode === 'dark' ? '#000000' : '#ffffff',
        },
        background: {
          // Improved background colors for better readability
          default: mode === 'dark' ? '#121212' : '#f5f7fa',
          paper: mode === 'dark' ? '#1e1e1e' : '#ffffff',
        },
        text: {
          // Improved text colors for better readability
          primary: mode === 'dark' ? '#f5f5f5' : '#212121',
          secondary: mode === 'dark' ? '#b0b0b0' : '#5f6368',
        },
        action: {
          // Improved action colors for better feedback
          hover: mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
          selected: mode === 'dark' ? 'rgba(255, 255, 255, 0.16)' : 'rgba(0, 0, 0, 0.08)',
          disabled: mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.26)',
          disabledBackground: mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
          focus: mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
        },
      },
      typography: {
        fontFamily: "'Nunito', 'Roboto', 'Helvetica', 'Arial', sans-serif",
        h1: {
          fontWeight: 800,
          fontSize: '2.5rem',
          letterSpacing: '-0.02em',
          lineHeight: 1.2,
        },
        h2: {
          fontWeight: 800,
          fontSize: '2rem',
          letterSpacing: '-0.015em',
          lineHeight: 1.2,
        },
        h3: {
          fontWeight: 700,
          fontSize: '1.75rem',
          letterSpacing: '-0.01em',
          lineHeight: 1.3,
        },
        h4: {
          fontWeight: 700,
          fontSize: '1.5rem',
          letterSpacing: '-0.01em',
          lineHeight: 1.35,
        },
        h5: {
          fontWeight: 600,
          fontSize: '1.25rem',
          letterSpacing: '-0.005em',
          lineHeight: 1.4,
        },
        h6: {
          fontWeight: 600,
          fontSize: '1.125rem',
          letterSpacing: '0',
          lineHeight: 1.4,
        },
        subtitle1: {
          fontWeight: 600,
          fontSize: '1rem',
          letterSpacing: '0.005em',
          lineHeight: 1.5,
        },
        subtitle2: {
          fontWeight: 600,
          fontSize: '0.875rem',
          letterSpacing: '0.005em',
          lineHeight: 1.5,
        },
        body1: {
          fontWeight: 400,
          fontSize: '1rem',
          letterSpacing: '0.01em',
          lineHeight: 1.6,
        },
        body2: {
          fontWeight: 400,
          fontSize: '0.875rem',
          letterSpacing: '0.01em',
          lineHeight: 1.6,
        },
        button: {
          fontWeight: 600,
          textTransform: 'none',
          fontSize: '0.875rem',
          letterSpacing: '0.02em',
        },
        caption: {
          fontSize: '0.75rem',
          fontWeight: 400,
          letterSpacing: '0.03em',
          lineHeight: 1.5,
        },
        overline: {
          fontSize: '0.75rem',
          fontWeight: 600,
          letterSpacing: '0.08em',
          lineHeight: 1.5,
          textTransform: 'uppercase',
        },
      },
      shape: {
        borderRadius: 3,
      },
      components: {
        MuiCssBaseline: {
          styleOverrides: `
            /* Nunito font is loaded from index.html */
            body {
              font-family: 'Nunito', sans-serif;
              background-color: ${mode === 'dark' ? '#121212' : '#f5f7fa'};
              color: ${mode === 'dark' ? '#f5f5f5' : '#212121'};
              -webkit-font-smoothing: antialiased;
              -moz-osx-font-smoothing: grayscale;
            }

            ::-webkit-scrollbar {
              width: 8px;
              height: 8px;
            }

            ::-webkit-scrollbar-track {
              background: ${mode === 'dark' ? '#2d2d2d' : '#f1f1f1'};
              border-radius: 8px;
            }

            ::-webkit-scrollbar-thumb {
              background: ${mode === 'dark' ? '#555' : '#c1c1c1'};
              border-radius: 8px;
              border: 2px solid ${mode === 'dark' ? '#2d2d2d' : '#f1f1f1'};
            }

            ::-webkit-scrollbar-thumb:hover {
              background: ${mode === 'dark' ? '#777' : '#a0a0a0'};
            }

            a {
              color: ${mode === 'dark' ? '#64b5f6' : '#1976d2'};
              text-decoration: none;
              transition: color 0.2s ease-in-out;
            }

            a:hover {
              color: ${mode === 'dark' ? '#90caf9' : '#0d47a1'};
              text-decoration: underline;
            }
          `,
        },
        MuiButton: {
          styleOverrides: {
            root: {
              textTransform: 'none',
              borderRadius: '4px',
              padding: '8px 16px',
              fontWeight: 600,
              transition: 'all 0.2s ease-in-out',
              letterSpacing: '0.02em',
            },
            contained: {
              boxShadow: mode === 'dark' ? '0 2px 4px rgba(0,0,0,0.4)' : '0 1px 3px rgba(0,0,0,0.12)',
              '&:hover': {
                boxShadow: mode === 'dark' ? '0 4px 8px rgba(0,0,0,0.5)' : '0 3px 6px rgba(0,0,0,0.15)',
                transform: 'translateY(-1px)',
              },
            },
            outlined: {
              borderWidth: '1.5px',
              '&:hover': {
                borderWidth: '1.5px',
                backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(25, 118, 210, 0.04)',
              },
            },
            text: {
              '&:hover': {
                backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(25, 118, 210, 0.04)',
              },
            },
            containedPrimary: {
              '&:hover': {
                backgroundColor: mode === 'dark' ? '#1976d2' : '#0d47a1',
              },
            },
            containedSecondary: {
              '&:hover': {
                backgroundColor: mode === 'dark' ? '#757575' : '#212121',
              },
            },
          },
        },
        MuiPaper: {
          styleOverrides: {
            root: {
              boxShadow: mode === 'dark'
                ? '0 2px 8px 0 rgba(0, 0, 0, 0.5)'
                : '0 1px 4px 0 rgba(0, 0, 0, 0.08)',
              transition: 'box-shadow 0.3s ease-in-out, transform 0.2s ease-in-out',
              backgroundImage: 'none',
            },
            elevation1: {
              boxShadow: mode === 'dark'
                ? '0 2px 4px 0 rgba(0, 0, 0, 0.4)'
                : '0 1px 3px 0 rgba(0, 0, 0, 0.07)',
            },
            elevation2: {
              boxShadow: mode === 'dark'
                ? '0 3px 8px 0 rgba(0, 0, 0, 0.5)'
                : '0 2px 6px 0 rgba(0, 0, 0, 0.1)',
            },
            elevation3: {
              boxShadow: mode === 'dark'
                ? '0 4px 12px 0 rgba(0, 0, 0, 0.6)'
                : '0 3px 9px 0 rgba(0, 0, 0, 0.12)',
            },
            elevation4: {
              boxShadow: mode === 'dark'
                ? '0 6px 16px 0 rgba(0, 0, 0, 0.7)'
                : '0 4px 12px 0 rgba(0, 0, 0, 0.15)',
            },
            rounded: {
              borderRadius: '8px',
            },
          },
        },
        MuiTableCell: {
          styleOverrides: {
            root: {
              fontSize: '0.875rem',
              padding: '16px',
              borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(224, 224, 224, 0.7)',
            },
            head: {
              fontWeight: 700,
              backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
              color: mode === 'dark' ? '#e0e0e0' : '#424242',
            },
            body: {
              color: mode === 'dark' ? '#e0e0e0' : '#424242',
            },
          },
        },
        MuiTableRow: {
          styleOverrides: {
            root: {
              '&:last-child td': {
                borderBottom: 0,
              },
              transition: 'background-color 0.2s ease-in-out',
            },
            hover: {
              '&:hover': {
                backgroundColor: mode === 'dark'
                  ? 'rgba(255, 255, 255, 0.05) !important'
                  : 'rgba(0, 0, 0, 0.02) !important',
              },
            },
          },
        },
        MuiChip: {
          styleOverrides: {
            root: {
              fontWeight: 600,
              transition: 'all 0.2s ease-in-out',
              borderRadius: '16px',
              height: '32px',
            },
            filled: {
              backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
            },
            outlined: {
              borderWidth: '1.5px',
            },
            clickable: {
              '&:hover': {
                backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.12)',
                transform: 'translateY(-1px)',
              },
              '&:active': {
                backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.15)',
              },
            },
            label: {
              paddingLeft: '12px',
              paddingRight: '12px',
              fontSize: '0.8125rem',
            },
          },
        },
        MuiIconButton: {
          styleOverrides: {
            root: {
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
                transform: 'translateY(-1px)',
              },
            },
          },
        },
        MuiAlert: {
          styleOverrides: {
            root: {
              borderRadius: '6px',
              padding: '12px 16px',
              boxShadow: mode === 'dark'
                ? '0 2px 6px rgba(0, 0, 0, 0.3)'
                : '0 2px 6px rgba(0, 0, 0, 0.08)',
            },
            standardSuccess: {
              backgroundColor: mode === 'dark' ? 'rgba(76, 175, 80, 0.15)' : 'rgba(46, 125, 50, 0.08)',
              color: mode === 'dark' ? '#81c784' : '#2e7d32',
            },
            standardInfo: {
              backgroundColor: mode === 'dark' ? 'rgba(33, 150, 243, 0.15)' : 'rgba(2, 136, 209, 0.08)',
              color: mode === 'dark' ? '#64b5f6' : '#0288d1',
            },
            standardWarning: {
              backgroundColor: mode === 'dark' ? 'rgba(255, 152, 0, 0.15)' : 'rgba(237, 108, 2, 0.08)',
              color: mode === 'dark' ? '#ffb74d' : '#ed6c02',
            },
            standardError: {
              backgroundColor: mode === 'dark' ? 'rgba(244, 67, 54, 0.15)' : 'rgba(211, 47, 47, 0.08)',
              color: mode === 'dark' ? '#e57373' : '#d32f2f',
            },
            message: {
              padding: '8px 0',
              fontSize: '0.9375rem',
            },
            icon: {
              padding: '8px 0',
            },
          },
        },
        MuiDivider: {
          styleOverrides: {
            root: {
              margin: '0',
              borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
            },
          },
        },
        MuiTextField: {
          styleOverrides: {
            root: {
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)',
                  transition: 'border-color 0.2s ease-in-out',
                },
                '&:hover fieldset': {
                  borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: mode === 'dark' ? '#64b5f6' : '#1976d2',
                  borderWidth: '2px',
                },
              },
            },
          },
        },
        MuiInputBase: {
          styleOverrides: {
            root: {
              fontSize: '0.9375rem',
              transition: 'background-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
              '&.Mui-focused': {
                boxShadow: mode === 'dark'
                  ? '0 0 0 2px rgba(33, 150, 243, 0.2)'
                  : '0 0 0 2px rgba(25, 118, 210, 0.2)',
              },
            },
            input: {
              padding: '14px 16px',
            },
          },
        },
        MuiTooltip: {
          styleOverrides: {
            tooltip: {
              backgroundColor: mode === 'dark' ? '#424242' : '#212121',
              color: '#ffffff',
              fontSize: '0.75rem',
              padding: '8px 12px',
              borderRadius: '4px',
              fontWeight: 500,
              boxShadow: mode === 'dark'
                ? '0 4px 8px rgba(0, 0, 0, 0.5)'
                : '0 2px 6px rgba(0, 0, 0, 0.2)',
            },
            arrow: {
              color: mode === 'dark' ? '#424242' : '#212121',
            },
          },
        },
        MuiTab: {
          styleOverrides: {
            root: {
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.875rem',
              minWidth: 'auto',
              padding: '12px 16px',
              transition: 'all 0.2s ease-in-out',
              '&.Mui-selected': {
                color: mode === 'dark' ? '#64b5f6' : '#1976d2',
              },
              '&:hover': {
                backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
              },
            },
          },
        },
        MuiTabs: {
          styleOverrides: {
            indicator: {
              height: '3px',
              borderRadius: '3px 3px 0 0',
            },
          },
        },
      },
      breakpoints: {
        values: {
          xs: 0,
          sm: 600,
          md: 960,
          lg: 1280,
          xl: 1920,
        },
      },
    })),
  [mode]);

  // Fournir le mode et la fonction de bascule via le contexte
  const contextValue = useMemo(() => ({
    mode,
    toggleColorMode,
  }), [mode]);

  return (
    <ThemeContext.Provider value={contextValue}>
      <MUIThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MUIThemeProvider>
    </ThemeContext.Provider>
  );
}; 