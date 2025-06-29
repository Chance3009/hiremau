import { cn } from "@/lib/utils";
import { useRecruitment } from "@/contexts/RecruitmentContext";
import { RECRUITMENT_STAGES } from "@/config/constants";
import { stageLabels } from "./RecruitmentStageBar";

export const RecruitmentProgressBar = () => {
    const { currentStage } = useRecruitment();

    return (
        <div className="w-full px-6 py-2">
            <div className="flex items-center justify-between w-full">
                {RECRUITMENT_STAGES.map((stage, index) => (
                    <div key={stage} className="flex-1 flex items-center">
                        <div className="flex flex-col items-center flex-1">
                            <div
                                className={cn(
                                    "h-3 w-3 rounded-full transition-colors",
                                    currentStage === stage
                                        ? "bg-primary scale-125"
                                        : index < RECRUITMENT_STAGES.indexOf(currentStage)
                                            ? "bg-primary/60"
                                            : "bg-muted"
                                )}
                            />
                            <span className="text-xs mt-2 text-muted-foreground">
                                {stageLabels[stage]}
                            </span>
                        </div>
                        {index < RECRUITMENT_STAGES.length - 1 && (
                            <div
                                className={cn(
                                    "h-[2px] w-full transition-colors",
                                    index < RECRUITMENT_STAGES.indexOf(currentStage)
                                        ? "bg-primary/60"
                                        : "bg-muted"
                                )}
                            />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}; 