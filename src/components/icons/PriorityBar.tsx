import React from 'react';

interface PriorityBarIconProps {
    title?: string;
    ariaLabel?: string;
    priority?: '' | 'low' | 'medium' | 'high';
}

const PriorityBarIcon: React.FC<PriorityBarIconProps> = ({
    title = "Priority",
    ariaLabel = "",
    priority = '',
}) => {
    const fillColor = priority === 'high' ? "var(--color-priority-high)" :
                        priority === 'medium' ? "var(--color-priority-medium)" :
                            priority === 'low' ? "var(--color-priority-low)" :
                                "var(--color-priority-none)";
    return (
        <div className="icon-box">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width={4}
                height={24}
                viewBox="0 0 4 24"
                fill={fillColor}
                stroke="currentColor"
                className="priority-bar-icon"
                aria-label={ariaLabel || title}
            >
                <rect x="0" y="0" width="4" height="24" />
            </svg>
            {title && <span className="icon-title">{title}</span>}
        </div>
    );
};

export default PriorityBarIcon;
