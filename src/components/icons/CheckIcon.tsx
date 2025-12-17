import React from 'react';

interface CheckIconProps {
    title: string;
    isChecked: boolean;
}

const CheckIcon: React.FC<CheckIconProps> = ({ title, isChecked }) => {
    return (
        <div className="icon-box">
            {isChecked ? (
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
                    className="checked-icon"
                    aria-label={title}
                >
                    <polyline points="20 6 9 17 4 12" />
                </svg>
            ) : (
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
                    className="unchecked-icon"
                    aria-label={title}
                >
                    <rect width="20" height="20" x="2" y="2" strokeWidth="2" />
                </svg>
            )}
            <span className="icon-title">{title}</span>
        </div>
    );
};

export default CheckIcon;
