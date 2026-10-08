import React from 'react';

interface DuckFootprintsProps {
    count?: number;
    className?: string;
    opacity?: number;
}

export const DuckFootprintIcon: React.FC<{ className?: string; size?: number; fill?: string }> = ({
    className = '',
    size = 18,
    fill = 'currentColor',
}) => {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            {/* Duck webbed footprint */}
            <path
                d="M 12 18 C 10.5 18 9.5 16.5 9.5 14.5 C 9.5 12.5 10.5 11 12 11 C 13.5 11 14.5 12.5 14.5 14.5 C 14.5 16.5 13.5 18 12 18 Z"
                fill={fill}
            />
            {/* Three webbed toes */}
            <path
                d="M 10 12 L 6 6 C 5.5 5.5 6.5 4.5 7.5 5 L 11 11 Z"
                fill={fill}
            />
            <path
                d="M 12 11 L 12 4.5 C 12 3.8 13 3.8 13 4.5 L 13 11 Z"
                fill={fill}
            />
            <path
                d="M 13 11 L 17 5 C 17.5 4.5 18.5 5.5 18 6 L 14 12 Z"
                fill={fill}
            />
            {/* Subtle webbing curve */}
            <path
                d="M 7.5 5 Q 10 7 12 4.5 Q 14 7 17.5 5"
                stroke={fill}
                strokeWidth="1.2"
                strokeLinecap="round"
                fill="none"
                opacity="0.7"
            />
        </svg>
    );
};

export const DuckFootprints: React.FC<DuckFootprintsProps> = ({
    count = 4,
    className = '',
    opacity = 0.25,
}) => {
    return (
        <div className={`flex items-center gap-2 select-none pointer-events-none ${className}`} style={{ opacity }}>
            {Array.from({ length: count }).map((_, i) => (
                <div
                    key={i}
                    className="transform transition-transform"
                    style={{
                        transform: i % 2 === 0 ? 'translateY(-3px) rotate(12deg)' : 'translateY(3px) rotate(-12deg)',
                    }}
                >
                    <DuckFootprintIcon size={14} fill="#D97706" />
                </div>
            ))}
        </div>
    );
};

