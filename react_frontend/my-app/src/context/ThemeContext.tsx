import React, { createContext, useState, useEffect, ReactNode } from 'react';

interface ThemeContextProps {
  theme: string;
  setTheme: (theme: string) => void;
}

const defaultTheme = 'Default'; // Set your default theme
export const ThemeContext = createContext<ThemeContextProps>({
  theme: defaultTheme,
  setTheme: () => {},
});

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<string>(() => {
    // Load theme from local storage on initial load
    const storedTheme = localStorage.getItem('appTheme');
    return storedTheme ? storedTheme : defaultTheme;
  });

  useEffect(() => {
    // Apply the theme to the document element
    document.documentElement.setAttribute('data-theme', theme);
    // Save the theme to local storage
    localStorage.setItem('appTheme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to easily use the theme context in components
export const useTheme = () => React.useContext(ThemeContext);