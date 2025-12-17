import React from 'react';

interface MinusIconProps {
    title: string;
}

const MinusIcon: React.FC<MinusIconProps> = ({ title }) => {
    return (
        <div className="icon-box">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="minus-icon"
                aria-label={title}
            >
                <line x1="4" y1="12" x2="20" y2="12" />
            </svg>
            <span className="icon-title">{title}</span>
        </div>
    );
};

export default MinusIcon;
