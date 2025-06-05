import React from 'react';
import { cn } from "@/lib/utils";
import { useRecruitment } from "@/contexts/RecruitmentContext";
import { RECRUITMENT_STAGES, STAGE_CONFIG, RecruitmentStage } from "@/config/constants";
import { useNavigate } from 'react-router-dom';
import { Users, ChevronRight } from "lucide-react";

interface StageData {
  stage: RecruitmentStage;
  count: number;
  label: string;
  route: string;
}

const stageRoutes: Record<RecruitmentStage, string> = {
  'applied': '/applied',
  'screened': '/screened',
  'interviewed': '/interviewed',
  'final-review': '/final-review',
  'hired': '/hired'
};

const stageLabels: Record<RecruitmentStage, string> = {
  'applied': 'Applied',
  'screened': 'Screened',
  'interviewed': 'Interviewed',
  'final-review': 'Final Review',
  'hired': 'Hired'
};

// Mock data for candidate counts in each stage - will come from context in real app
const stageCounts: Record<RecruitmentStage, number> = {
  "applied": 24,
  "screened": 12,
  "interviewed": 8,
  "final-review": 3,
  "hired": 1,
};

export const RecruitmentStageBar = () => {
  const { currentStage, setCurrentStage } = useRecruitment();
  const navigate = useNavigate();

  const handleStageClick = (stage: RecruitmentStage) => {
    setCurrentStage(stage);
    navigate(stageRoutes[stage]);
  };

  return (
    <div className="w-full bg-background">
      {/* Main stage bar */}
      <div className="w-full px-4 py-1">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex items-center">
            {RECRUITMENT_STAGES.map((stage, index) => (
              <button
                key={stage}
                onClick={() => handleStageClick(stage)}
                className={cn(
                  "group relative flex-1 min-w-[180px] focus:outline-none",
                  "transition-all duration-200",
                  currentStage === stage ? "z-10" : "hover:z-10",
                )}
              >
                <div
                  className={cn(
                    "relative flex w-full h-12 transition-all duration-200",
                    currentStage === stage
                      ? "bg-primary text-primary-foreground"
                      : index < RECRUITMENT_STAGES.indexOf(currentStage)
                        ? "bg-primary/60 text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80",
                    "group-hover:shadow-md"
                  )}
                  style={{
                    clipPath: index === RECRUITMENT_STAGES.length - 1
                      ? "polygon(0 0, 100% 0, 100% 100%, 0 100%)"
                      : "polygon(0 0, calc(100% - 20px) 0, 100% 50%, calc(100% - 20px) 100%, 0 100%)",
                    marginRight: index === RECRUITMENT_STAGES.length - 1 ? "0" : "-20px",
                    paddingRight: index === RECRUITMENT_STAGES.length - 1 ? "0" : "20px",
                  }}
                >
                  <div className="flex items-center w-full px-4 gap-2">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="font-medium truncate">
                        {stageLabels[stage]}
                      </span>
                      <div className="flex items-center shrink-0 gap-1 bg-background/10 px-1.5 py-0.5 rounded-full text-xs">
                        <Users className="w-3 h-3" />
                        <span>{stageCounts[stage]}</span>
                      </div>
                    </div>
                    {index < RECRUITMENT_STAGES.length - 1 && (
                      <ChevronRight className="w-4 h-4 shrink-0 opacity-50 group-hover:opacity-100" />
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
