import { useState, useEffect } from 'react';

const useCountUp = (target = 0, duration = 800) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const numTarget = typeof target === 'number' && !isNaN(target) ? target : 0;
    if (numTarget === 0) {
      setCount(0);
      return;
    }

    let start = 0;
    const stepTime = 16;
    const steps = duration / stepTime;
    const increment = numTarget / steps;

    const timer = setInterval(() => {
      start += increment;
      if ((increment > 0 && start >= numTarget) || (increment < 0 && start <= numTarget)) {
        setCount(numTarget);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [target, duration]);

  return count;
};

export default useCountUp;
