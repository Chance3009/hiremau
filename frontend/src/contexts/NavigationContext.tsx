import React, { createContext, useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface NavigationContextType {
    recentPages: string[];
    previousPage: string | null;
    navigateBack: () => void;
    canNavigateBack: boolean;
}

const NavigationContext = createContext<NavigationContextType>({
    recentPages: [],
    previousPage: null,
    navigateBack: () => { },
    canNavigateBack: false,
});

export const useNavigation = () => useContext(NavigationContext);

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [recentPages, setRecentPages] = useState<string[]>([]);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        setRecentPages((prev) => {
            // Don't add the same page twice in a row
            if (prev[0] === location.pathname) return prev;

            // Keep only the last 5 pages
            const newPages = [location.pathname, ...prev].slice(0, 5);
            return newPages;
        });
    }, [location.pathname]);

    const navigateBack = () => {
        if (recentPages.length > 1) {
            const [, previousPage] = recentPages;
            navigate(previousPage);
        } else {
            navigate('/');
        }
    };

    const value = {
        recentPages,
        previousPage: recentPages[1] || null,
        navigateBack,
        canNavigateBack: recentPages.length > 1,
    };

    return (
        <NavigationContext.Provider value={value}>
            {children}
        </NavigationContext.Provider>
    );
}; 