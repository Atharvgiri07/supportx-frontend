import { useState, useEffect } from 'react';

/**
 * Animates a number counting up from 0 to `target` over `duration` ms.
 * Used on stat cards so numbers feel alive instead of just appearing.
 */
const useCountUp = (target, duration = 600) => {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let start = null;
    let frameId;

    const step = (timestamp) => {
      if (start === null) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      setValue(Math.floor(progress * target));
      if (progress < 1) {
        frameId = requestAnimationFrame(step);
      }
    };

    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [target, duration]);

  return value;
};

export default useCountUp;
