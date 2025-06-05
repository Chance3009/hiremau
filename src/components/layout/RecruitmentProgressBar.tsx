import { cn } from "@/lib/utils";
import { useRecruitment } from "@/contexts/RecruitmentContext";
import { RECRUITMENT_STAGES } from "@/config/constants";

export const RecruitmentProgressBar = () => {
    const { currentStage } = useRecruitment();

    return (
        <div className="flex items-center space-x-2 px-4">
            {RECRUITMENT_STAGES.map((stage, index) => (
                <div key={stage} className="flex items-center">
                    <div
                        className={cn(
                            "h-2 w-2 rounded-full",
                            currentStage === stage
                                ? "bg-primary"
                                : index < RECRUITMENT_STAGES.indexOf(currentStage)
                                    ? "bg-primary/60"
                                    : "bg-muted"
                        )}
                    />
                    {index < RECRUITMENT_STAGES.length - 1 && (
                        <div
                            className={cn(
                                "h-[2px] w-8",
                                index < RECRUITMENT_STAGES.indexOf(currentStage)
                                    ? "bg-primary/60"
                                    : "bg-muted"
                            )}
                        />
                    )}
                </div>
            ))}
        </div>
    );
}; 