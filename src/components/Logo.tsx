interface LogoProps {
  size?: "small" | "default" | "large";
  showText?: boolean;
  className?: string;
}

const sizes = {
  small: { icon: 20, text: "text-base" },
  default: { icon: 24, text: "text-xl" },
  large: { icon: 32, text: "text-2xl" },
};

const Logo = ({ size = "default", showText = true, className = "" }: LogoProps) => {
  const { icon, text } = sizes[size];

  return (
    <span className={`inline-flex items-center gap-2 select-none ${className}`}>
      <svg
        width={icon}
        height={icon}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
        aria-hidden="true"
      >
        <circle cx="16" cy="16" r="16" fill="currentColor" />
        <path
          d="M10 11.2 L16 20.8 L22 11.2"
          stroke="hsl(var(--primary-foreground))"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <line
          x1="11.2"
          y1="22.4"
          x2="20.8"
          y2="22.4"
          stroke="hsl(var(--primary-foreground))"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </svg>
      {showText && (
        <span className={`font-heading ${text} text-foreground tracking-tight`}>
          Vibesfolio
        </span>
      )}
    </span>
  );
};

export default Logo;
