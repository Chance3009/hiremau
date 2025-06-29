import React from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    children?: React.ReactNode;
    className?: string;
}

export function PageHeader({ title, subtitle, children, className }: PageHeaderProps) {
    return (
        <div className={cn("flex items-center justify-between", className)}>
            <div className="space-y-1">
                <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
                {subtitle && (
                    <p className="text-sm text-muted-foreground">{subtitle}</p>
                )}
            </div>
            {children}
        </div>
    );
} 