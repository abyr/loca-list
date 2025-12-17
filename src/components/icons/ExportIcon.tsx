import React from 'react';

interface ExportIconProps {
    title?: string;
    ariaLabel?: string;
    size?: number;
}

const ExportIcon: React.FC<ExportIconProps> = ({ title, ariaLabel, size = 24 }) => {
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
                className="archive-icon"
                aria-label={ariaLabel || title}
            >
                <path d="M12 3v18M16 15l-4 4-4-4M3 8h18a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z" />
            </svg>
            {title && <span className="icon-title">{title}</span>}
        </div>
    );
};

export default ExportIcon;
