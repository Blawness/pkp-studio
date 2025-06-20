import * as React from "react"

const MOBILE_BREAKPOINT = 768 // Tailwind's default 'md' breakpoint

export function useIsMobile() {
  // Default to false (desktop) to ensure consistency between SSR and initial client render.
  const [isMobile, setIsMobile] = React.useState(false);
  const [hasMounted, setHasMounted] = React.useState(false);

  React.useEffect(() => {
    setHasMounted(true); // Indicate that the component has mounted client-side
    
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    
    const handleResize = () => {
      setIsMobile(mql.matches);
    };

    handleResize(); // Set initial value on client based on current window size
    mql.addEventListener("change", handleResize); // Listen for changes
    
    return () => mql.removeEventListener("change", handleResize); // Cleanup listener
  }, []);

  // Before component has mounted on client, return the default (consistent with SSR)
  if (!hasMounted) {
    return false; 
  }

  return isMobile;
}
