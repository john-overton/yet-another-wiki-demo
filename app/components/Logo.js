'use client';

const Logo = () => {
  return (
    <div className="text-lg font-medium m-2">
      <span className="group relative mr-8">
        <span className="group-hover:opacity-0 transition-opacity">Y.</span>
        <span className="absolute left-0 scale-0 group-hover:scale-100 transition-transform origin-left">
          <u>Y</u>et
        </span>
      </span>
      <span className="group relative mx-8">
        <span className="group-hover:opacity-0 transition-opacity">A.</span>
        <span className="absolute left-0 scale-0 group-hover:scale-100 transition-transform origin-left">
          <u>A</u>nother
        </span>
      </span>
      <span className="group relative mx-8">
        <span className="group-hover:opacity-0 transition-opacity">W.</span>
        <span className="absolute left-0 scale-0 group-hover:scale-100 transition-transform origin-left">
          <u>W</u>iki
        </span>
      </span>
    </div>
  );
};

export default Logo;
