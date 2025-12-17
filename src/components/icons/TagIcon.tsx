import React from 'react';

interface TagIconProps {
    title: string;
}

const TagIcon: React.FC<TagIconProps> = ({ title }) => {
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
                className="icon-tag"
                aria-label={title}
            >
                <path d="M4 8h16" />
                <path d="M4 12h16" />
                <path d="M4 16h16" />
                <path d="M8 4v16" />
                <path d="M12 4v16" />
            </svg>
            <span className="icon-title">{title}</span>
        </div>
    );
};

export default TagIcon;
