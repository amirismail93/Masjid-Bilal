export function IslamicPattern({ className = "" }: { className?: string }) {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      <svg
        className="w-full h-full opacity-[0.04]"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 400 400"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <pattern
            id="islamic-geo"
            x="0"
            y="0"
            width="100"
            height="100"
            patternUnits="userSpaceOnUse"
          >
            {/* Eight-pointed star pattern */}
            <polygon
              points="50,5 61,25 82,18 75,39 95,50 75,61 82,82 61,75 50,95 39,75 18,82 25,61 5,50 25,39 18,18 39,25"
              fill="none"
              stroke="#4A7C59"
              strokeWidth="1.2"
            />
            {/* Inner octagon */}
            <polygon
              points="50,20 65,28 72,43 65,58 50,65 35,58 28,43 35,28"
              fill="none"
              stroke="#4A7C59"
              strokeWidth="0.8"
            />
            {/* Center circle */}
            <circle cx="50" cy="43" r="8" fill="none" stroke="#4A7C59" strokeWidth="0.6" />
            {/* Connecting lines */}
            <line x1="50" y1="0" x2="50" y2="20" stroke="#4A7C59" strokeWidth="0.4" />
            <line x1="50" y1="65" x2="50" y2="100" stroke="#4A7C59" strokeWidth="0.4" />
            <line x1="0" y1="50" x2="28" y2="43" stroke="#4A7C59" strokeWidth="0.4" />
            <line x1="72" y1="43" x2="100" y2="50" stroke="#4A7C59" strokeWidth="0.4" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#islamic-geo)" />
      </svg>
    </div>
  );
}
