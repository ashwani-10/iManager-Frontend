import React, { useEffect, useRef, useState } from 'react';

interface ScrollRevealProps {
  children: React.ReactNode;
  type?: 'fade-up' | 'fade-down' | 'fade-left' | 'fade-right' | 'zoom-in' | 'zoom-out';
  delay?: number;
  threshold?: number;
  className?: string;
  staggerChildren?: boolean;
}

const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  type = 'fade-up',
  delay = 0,
  threshold = 0.1,
  className = '',
  staggerChildren = false,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            setIsVisible(true);
          }, delay);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold,
      }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, [delay, threshold]);

  const animationClass = isVisible ? `animate-visible animate-${type}` : `animate-hidden animate-${type}`;
  const staggerClass = staggerChildren ? 'animate-stagger-children' : '';
  
  return (
    <div 
      ref={elementRef} 
      className={`${animationClass} ${staggerClass} ${className}`}
    >
      {children}
    </div>
  );
};

export default ScrollReveal; 