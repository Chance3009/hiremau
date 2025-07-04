import React, { createContext, useContext, useState } from 'react';
import { RecruitmentStage } from '@/config/constants';

interface RecruitmentContextType {
    activeEventId: string;
    setActiveEventId: (id: string) => void;
    activePositionId: string;
    setActivePositionId: (id: string) => void;
    currentStage: RecruitmentStage;
    setCurrentStage: (stage: RecruitmentStage) => void;
}

const RecruitmentContext = createContext<RecruitmentContextType>({
    activeEventId: '',
    setActiveEventId: () => { },
    activePositionId: '',
    setActivePositionId: () => { },
    currentStage: 'applied',
    setCurrentStage: () => { },
});

export const useRecruitment = () => useContext(RecruitmentContext);

export const RecruitmentContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [activeEventId, setActiveEventId] = useState<string>('');
    const [activePositionId, setActivePositionId] = useState<string>('');
    const [currentStage, setCurrentStage] = useState<RecruitmentStage>('applied');

    const value = {
        activeEventId,
        setActiveEventId,
        activePositionId,
        setActivePositionId,
        currentStage,
        setCurrentStage,
    };

    return (
        <RecruitmentContext.Provider value={value}>
            {children}
        </RecruitmentContext.Provider>
    );
}; 