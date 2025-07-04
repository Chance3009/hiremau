import React from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RatingProps {
    value: number;
    onChange?: (value: number) => void;
    max?: number;
    className?: string;
}

export const Rating: React.FC<RatingProps> = ({
    value = 0,
    onChange,
    max = 5,
    className
}) => {
    const [hoverValue, setHoverValue] = React.useState<number | null>(null);

    return (
        <div
            className={cn("flex items-center gap-0.5", className)}
            onMouseLeave={() => setHoverValue(null)}
        >
            {Array.from({ length: max }).map((_, index) => {
                const starValue = index + 1;
                const isFilled = hoverValue !== null
                    ? starValue <= hoverValue
                    : starValue <= value;

                return (
                    <button
                        key={index}
                        type="button"
                        className={cn(
                            "p-0.5 rounded-sm hover:bg-accent transition-colors",
                            onChange ? "cursor-pointer" : "cursor-default"
                        )}
                        onClick={() => onChange?.(starValue)}
                        onMouseEnter={() => onChange && setHoverValue(starValue)}
                    >
                        <Star
                            className={cn(
                                "h-4 w-4 transition-colors",
                                isFilled ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                            )}
                        />
                    </button>
                );
            })}
        </div>
    );
}; 