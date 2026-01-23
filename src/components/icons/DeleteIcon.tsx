import React from 'react';

interface DeleteIconProps {
    title?: string;
    ariaLabel?: string;
    size?: number;
}

const DeleteIcon: React.FC<DeleteIconProps> = ({ title, ariaLabel, size = 24 }) => {
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
                className="delete-icon"
                aria-label={ariaLabel || title}
            >
                <line x1="4" y1="4" x2="20" y2="20" />
                <line x1="20" y1="4" x2="4" y2="20" />
            </svg>
            {title && <span className="icon-title">{title}</span>}
        </div>
    );
};

export default DeleteIcon;
