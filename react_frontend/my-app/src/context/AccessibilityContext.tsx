import React, { createContext, useState, useEffect, ReactNode } from 'react';

interface AccessibilityContextProps {
  textSize: 'Small' | 'Normal' | 'Larger' | 'Largest';
  setTextSize: (size: 'Small' | 'Normal' | 'Larger' | 'Largest') => void;
  highContrastOutline: boolean;
  setHighContrastOutline: (enabled: boolean) => void;
  reduceMotion: boolean;
  setReduceMotion: (reduced: boolean) => void;
}

const defaultAccessibility: AccessibilityContextProps = {
  textSize: 'Normal',
  setTextSize: () => {},
  highContrastOutline: false,
  setHighContrastOutline: () => {},
  reduceMotion: false,
  setReduceMotion: () => {},
};

export const AccessibilityContext = createContext<AccessibilityContextProps>(
  defaultAccessibility
);

interface AccessibilityProviderProps {
  children: ReactNode;
}

export const AccessibilityProvider: React.FC<AccessibilityProviderProps> = ({
  children,
}) => {
  const [textSize, setTextSize] = useState<
    'Small' | 'Normal' | 'Larger' | 'Largest'
  >(() => {
    const storedSize = localStorage.getItem('textSize');
    return storedSize ? (storedSize as 'Small' | 'Normal' | 'Larger' | 'Largest') : 'Normal';
  });
  const [highContrastOutline, setHighContrastOutline] = useState<boolean>(() => {
    const storedContrast = localStorage.getItem('highContrastOutline');
    return storedContrast ? JSON.parse(storedContrast) : false;
  });
  const [reduceMotion, setReduceMotion] = useState<boolean>(() => {
    const storedMotion = localStorage.getItem('reduceMotion');
    return storedMotion ? JSON.parse(storedMotion) : false;
  });

  useEffect(() => {
    document.body.classList.remove(
      'text-size-small',
      'text-size-normal',
      'text-size-larger',
      'text-size-largest'
    );
    document.body.classList.add(`text-size-${textSize.toLowerCase()}`);
    localStorage.setItem('textSize', textSize);
  }, [textSize]);

  // useEffect(() => {
  //   const containers = document.querySelectorAll(
  //     '.settings-container, .settings-tabs, .settings-section, .habit-grid'
  //   );
  //   containers.forEach((container) => {
  //     if (highContrastOutline) {
  //       container.classList.add('high-contrast-outline');
  //     } else {
  //       container.classList.remove('high-contrast-outline');
  //     }
  //   });
  //   localStorage.setItem('highContrastOutline', JSON.stringify(highContrastOutline));
  // }, [highContrastOutline]);
  useEffect(() => {
    // Apply high contrast outline to the body element
    if (highContrastOutline) {
      document.body.classList.add('high-contrast-outline');
    } else {
      document.body.classList.remove('high-contrast-outline');
    }
    localStorage.setItem('highContrastOutline', JSON.stringify(highContrastOutline));
  }, [highContrastOutline]);

  useEffect(() => {
    if (reduceMotion) {
      document.body.classList.add('reduce-motion');
    } else {
      document.body.classList.remove('reduce-motion');
    }
    localStorage.setItem('reduceMotion', JSON.stringify(reduceMotion));
  }, [reduceMotion]);

  return (
    <AccessibilityContext.Provider
      value={{
        textSize,
        setTextSize,
        highContrastOutline,
        setHighContrastOutline,
        reduceMotion,
        setReduceMotion,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => React.useContext(AccessibilityContext);