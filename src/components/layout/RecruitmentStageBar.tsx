
import React from 'react';
import { cn } from "@/lib/utils";
import { useRecruitment } from "@/contexts/RecruitmentContext";
import { RECRUITMENT_STAGES } from "@/config/constants";
import { useNavigate } from 'react-router-dom';

interface StageData {
  stage: string;
  count: number;
  label: string;
  route: string;
}

const stageRoutes = {
  'job-posting': '/job-openings',
  'application-review': '/applied', 
  'screening': '/screened',
  'interviews': '/interviewed',
  'offer': '/final-review',
  'onboarding': '/hired'
};

const stageLabels = {
  'job-posting': 'Applied',
  'application-review': 'Applied',
  'screening': 'Screened', 
  'interviews': 'Interviewed',
  'offer': 'Final Review',
  'onboarding': 'Hired'
};

export const RecruitmentStageBar = () => {
  const { currentStage } = useRecruitment();
  const navigate = useNavigate();
  
  // Mock counts - in real app this would come from recruitment store
  const stageCounts = {
    'job-posting': 24,
    'application-review': 24,
    'screening': 12,
    'interviews': 8,
    'offer': 3,
    'onboarding': 1
  };

  const stageData: StageData[] = RECRUITMENT_STAGES.map(stage => ({
    stage,
    count: stageCounts[stage] || 0,
    label: stageLabels[stage],
    route: stageRoutes[stage]
  }));

  const currentIndex = RECRUITMENT_STAGES.indexOf(currentStage);

  return (
    <div className="bg-background border-b">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-center">
          <div className="flex items-center">
            {stageData.map((item, index) => (
              <div key={item.stage} className="flex items-center">
                {/* Stage Arrow Shape */}
                <div
                  className={cn(
                    "relative flex items-center justify-center cursor-pointer group",
                    "h-12 px-4 transition-all duration-200",
                    index === currentIndex 
                      ? "bg-primary text-primary-foreground" 
                      : index < currentIndex
                        ? "bg-primary/20 text-primary hover:bg-primary/30"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                  style={{
                    clipPath: index === stageData.length - 1 
                      ? 'polygon(0 0, calc(100% - 12px) 0, 100% 50%, calc(100% - 12px) 100%, 0 100%, 12px 50%)'
                      : 'polygon(0 0, calc(100% - 12px) 0, 100% 50%, calc(100% - 12px) 100%, 0 100%, 12px 50%)',
                    marginRight: index === stageData.length - 1 ? '0' : '-12px',
                    zIndex: stageData.length - index
                  }}
                  onClick={() => navigate(item.route)}
                >
                  <div className="flex flex-col items-center gap-1 px-2">
                    <span className="text-xs font-medium">{item.label}</span>
                    <div className={cn(
                      "flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold",
                      index === currentIndex 
                        ? "bg-primary-foreground text-primary" 
                        : index < currentIndex
                          ? "bg-primary text-primary-foreground"
                          : "bg-background text-foreground"
                    )}>
                      {item.count}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
