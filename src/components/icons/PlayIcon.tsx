import React from 'react';

interface PlayIconProps {
    title?: string;
    ariaLabel?: string;
    size?: number;
}

const PlayIcon: React.FC<PlayIconProps> = ({
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
                className="play-icon"
                aria-label={ariaLabel || title}
            >
                <path d="M8 5v14l11-7z" />
            </svg>
            {title && <span className="icon-title">{title}</span>}
        </div>
    );
};

export default PlayIcon;
