import React, { createContext, useContext, useState } from 'react';

type UserRole = 'hr_executive' | 'hiring_manager' | 'tech_integrator';

interface UserRoleContextType {
    role: UserRole;
    setRole: (role: UserRole) => void;
    permissions: {
        canAccessAdmin: boolean;
        canManageCandidates: boolean;
        canConfigureSystem: boolean;
        canViewAnalytics: boolean;
        canManageIntegrations: boolean;
    };
}

const defaultPermissions = {
    hr_executive: {
        canAccessAdmin: true,
        canManageCandidates: true,
        canConfigureSystem: false,
        canViewAnalytics: true,
        canManageIntegrations: false,
    },
    hiring_manager: {
        canAccessAdmin: false,
        canManageCandidates: true,
        canConfigureSystem: false,
        canViewAnalytics: true,
        canManageIntegrations: false,
    },
    tech_integrator: {
        canAccessAdmin: true,
        canManageCandidates: false,
        canConfigureSystem: true,
        canViewAnalytics: true,
        canManageIntegrations: true,
    },
};

const UserRoleContext = createContext<UserRoleContextType>({
    role: 'hr_executive',
    setRole: () => { },
    permissions: defaultPermissions.hr_executive,
});

export const useUserRole = () => useContext(UserRoleContext);

export const UserRoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [role, setRole] = useState<UserRole>('hr_executive');

    const value = {
        role,
        setRole,
        permissions: defaultPermissions[role],
    };

    return (
        <UserRoleContext.Provider value={value}>
            {children}
        </UserRoleContext.Provider>
    );
}; 