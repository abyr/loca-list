import React from 'react';

interface ImportIconProps {
    title?: string;
    ariaLabel?: string;
    size?: number;
}

const ImportIcon: React.FC<ImportIconProps> = ({ title, ariaLabel, size = 24 }) => {
    return (
        <div className="icon-box">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width={size}
                height={size}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="import-icon"
                aria-label={ariaLabel || title}
            >
                <path d="M12 3v18M8 7l4-4 4 4M21 16H3a1 1 0 0 1-1-1v-10a1 1 0 0 1 1-1h18a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1z" />
            </svg>
            {title && <span className="icon-title">{title}</span>}
        </div>
    );
};

export default ImportIcon;
