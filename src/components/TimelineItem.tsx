import { LucideIcon } from "lucide-react";

interface TimelineItemProps {
    time: string;
    title: string;
    subtitle?: string;
    icon: LucideIcon;
    iconColor?: string; // class name like "text-blue-500"
    isLast?: boolean;
}

export default function TimelineItem({
    time,
    title,
    subtitle,
    icon: Icon,
    iconColor = "text-gray-500",
    isLast,
}: TimelineItemProps) {
    return (
        <div className="flex gap-4">
            {/* Time Column */}
            <div className="flex w-16 flex-col items-end pt-1">
                <span className="text-xs font-medium text-gray-500">{time}</span>
            </div>

            {/* Timeline Line & Icon */}
            <div className="relative flex flex-col items-center">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-gray-200 ${iconColor}`}>
                    <Icon size={16} />
                </div>
                {!isLast && <div className="h-full w-px bg-gray-200 my-2" />}
            </div>

            {/* Content */}
            <div className="flex-1 pb-8 pt-0.5">
                <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
                {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
            </div>
        </div>
    );
}
