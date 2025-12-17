import React from 'react';

interface SearchIconProps {
    title?: string;
    ariaLabel?: string;
    size?: number;
}

const SearchIcon: React.FC<SearchIconProps> = ({ title, ariaLabel, size = 24 }) => {
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
                className="search-icon"
                aria-label={ariaLabel || title}
            >
                <circle cx="10" cy="10" r="7" />
                <line x1="21" y1="21" x2="15" y2="15" />
            </svg>
            {title && <span className="icon-title">{title}</span>}
        </div>
    );
};

export default SearchIcon;
