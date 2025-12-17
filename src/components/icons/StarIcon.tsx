import React from 'react';

interface StarIconProps {
    title?: string;
    ariaLabel?: string;
    isFilled?: boolean;
    size?: number;
}

const StarIcon: React.FC<StarIconProps> = ({
    title = "",
    ariaLabel = "",
    isFilled = false,
    size = 24
}) => {
    return (
        <div className="icon-box">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width={size}
                height={size}
                viewBox="0 0 24 24"
                fill={isFilled ? "var(--color-primary-1)" : "var(--color-primary-weak)"}
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="star-icon"
                aria-label={ariaLabel || title}
            >
                <polygon points="12 2 15 10 24 10 17 15 20 23 12 18 4 23 7 15 0 10 9 10 12 2"/>
            </svg>
            {title && <span className="icon-title">{title}</span>}
        </div>
    );
};

export default StarIcon;
