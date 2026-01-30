'use client';

import { useEffect, useRef, useState } from 'react';

interface UseScrollRevealOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

export const useScrollReveal = (options: UseScrollRevealOptions = {}) => {
  const { threshold = 0.1, rootMargin = '0px 0px -50px 0px', triggerOnce = true } = options;
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (triggerOnce) {
            observer.unobserve(element);
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [threshold, rootMargin, triggerOnce]);

  return { ref, isVisible };
};

// Hook for multiple elements with staggered animation
export const useStaggeredReveal = (count: number, options: UseScrollRevealOptions = {}) => {
  const { threshold = 0.1, rootMargin = '0px 0px -50px 0px' } = options;
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleItems, setVisibleItems] = useState<boolean[]>(new Array(count).fill(false));

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Staggered reveal
          for (let i = 0; i < count; i++) {
            setTimeout(() => {
              setVisibleItems(prev => {
                const newState = [...prev];
                newState[i] = true;
                return newState;
              });
            }, i * 100); // 100ms stagger
          }
          observer.unobserve(container);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(container);

    return () => observer.disconnect();
  }, [count, threshold, rootMargin]);

  return { containerRef, visibleItems };
};

export default useScrollReveal;
