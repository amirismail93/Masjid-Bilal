export function QiblaCompass() {
  return (
    <svg
      viewBox="0 0 200 200"
      className="w-full max-w-[180px] mx-auto"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer ring */}
      <circle
        cx="100"
        cy="100"
        r="90"
        fill="none"
        stroke="#E5E2DC"
        strokeWidth="2"
      />
      <circle
        cx="100"
        cy="100"
        r="80"
        fill="#FAFAF8"
        stroke="#E5E2DC"
        strokeWidth="1"
      />

      {/* Cardinal direction ticks */}
      {[0, 90, 180, 270].map((angle) => (
        <line
          key={angle}
          x1="100"
          y1="15"
          x2="100"
          y2="25"
          stroke="#2C2C2A"
          strokeWidth="2"
          transform={`rotate(${angle} 100 100)`}
        />
      ))}

      {/* Minor ticks */}
      {[45, 135, 225, 315].map((angle) => (
        <line
          key={angle}
          x1="100"
          y1="17"
          x2="100"
          y2="23"
          stroke="#E5E2DC"
          strokeWidth="1.5"
          transform={`rotate(${angle} 100 100)`}
        />
      ))}

      {/* Cardinal labels */}
      <text x="100" y="38" textAnchor="middle" fontSize="11" fontWeight="700" fill="#2C2C2A">N</text>
      <text x="100" y="170" textAnchor="middle" fontSize="11" fontWeight="600" fill="#6B6B68">S</text>
      <text x="168" y="104" textAnchor="middle" fontSize="11" fontWeight="600" fill="#6B6B68">E</text>
      <text x="32" y="104" textAnchor="middle" fontSize="11" fontWeight="600" fill="#6B6B68">W</text>

      {/* Qibla arrow — pointing ~48° NE */}
      <g transform="rotate(48 100 100)">
        {/* Arrow shaft */}
        <line
          x1="100"
          y1="100"
          x2="100"
          y2="30"
          stroke="#4A7C59"
          strokeWidth="3"
          strokeLinecap="round"
        />
        {/* Arrow head */}
        <polygon
          points="100,22 94,36 106,36"
          fill="#4A7C59"
        />
        {/* Tail dot */}
        <circle cx="100" cy="100" r="5" fill="#4A7C59" />
      </g>

      {/* Center circle */}
      <circle cx="100" cy="100" r="3" fill="#FAFAF8" stroke="#4A7C59" strokeWidth="1.5" />

      {/* Qibla label at the tip */}
      <g transform="rotate(48 100 100)">
        <text
          x="100"
          y="15"
          textAnchor="middle"
          fontSize="8"
          fontWeight="700"
          fill="#C9963F"
          transform="rotate(-48 100 15)"
        >
          QIBLA
        </text>
      </g>
    </svg>
  );
}
