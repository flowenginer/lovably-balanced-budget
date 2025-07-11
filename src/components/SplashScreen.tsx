import { useEffect, useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import splashVideo from '@/assets/splash-video.mp4';

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);
  const isMobile = useIsMobile();

  useEffect(() => {
    // Only show splash screen on mobile
    if (!isMobile) {
      onComplete();
      return;
    }

    // Auto-hide after 3 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 300); // Wait for fade out animation
    }, 3000);

    return () => clearTimeout(timer);
  }, [isMobile, onComplete]);

  if (!isMobile || !isVisible) {
    return null;
  }

  return (
    <div className={`fixed inset-0 z-50 bg-black flex items-center justify-center transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <video
        autoPlay
        muted
        playsInline
        className="w-full h-full object-cover"
        onEnded={() => {
          setIsVisible(false);
          setTimeout(onComplete, 300);
        }}
      >
        <source src={splashVideo} type="video/mp4" />
      </video>
    </div>
  );
}