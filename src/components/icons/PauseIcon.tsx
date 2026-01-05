import React from 'react';

interface PauseIconProps {
    title?: string;
    ariaLabel?: string;
    size?: number;
}

const PauseIcon: React.FC<PauseIconProps> = ({
    title = "",
    ariaLabel = "",
    size = 24
}) => {
    return (
        <div className="icon-box">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width={size}
                height={size}
                viewBox="0 0 24 24"
                fill="currentColor"
                className="pause-icon"
                aria-label={ariaLabel || title}
            >
                <rect x="6" y="4" width="4" height="16" />
                <rect x="14" y="4" width="4" height="16" />
            </svg>
            {title && <span className="icon-title">{title}</span>}
        </div>
    );
};

export default PauseIcon;
