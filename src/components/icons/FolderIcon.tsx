import React from 'react';

interface FolderIconProps {
    title: string;
}

const FolderIcon: React.FC<FolderIconProps> = ({ title }) => {
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
                className="icon-folder"
                aria-label={title}
            >
                <path d="M3 3h6l2 2h10v16H3V3z" />
                <path d="M3 3v18h18V5H9l-6-2z" />
            </svg>
            <span className="icon-title">{title}</span>
        </div>
    );
};

export default FolderIcon;