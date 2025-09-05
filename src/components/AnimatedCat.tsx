import { useState, useEffect, useRef } from 'react';

interface Position {
  x: number;
  y: number;
}

interface CatState {
  position: Position;
  isBlinking: boolean;
  isMoving: boolean;
  isPaused: boolean;
  direction: number; // angle in radians
  facingLeft: boolean;
}

const AnimatedCat = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  const lastMoveTime = useRef<number>(Date.now());
  const lastBlinkTime = useRef<number>(Date.now());
  const pauseStartTime = useRef<number>(0);
  const moveStartTime = useRef<number>(Date.now());

  const [catState, setCatState] = useState<CatState>({
    position: { x: 200, y: 200 },
    isBlinking: false,
    isMoving: true,
    isPaused: false,
    direction: Math.PI / 4, // 45 degrees initially
    facingLeft: false
  });

  const [isPausedByUser, setIsPausedByUser] = useState(false);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  // Cat SVG Component
  const CatSprite = ({ isBlinking, facingLeft }: { isBlinking: boolean; facingLeft: boolean }) => (
    <div 
      className={`w-16 h-16 transition-transform duration-200 ${facingLeft ? 'scale-x-[-1]' : ''}`}
      style={{ imageRendering: 'pixelated' }}
    >
      <svg 
        width="64" 
        height="64" 
        viewBox="0 0 64 64" 
        className="drop-shadow-lg"
      >
        {/* Cat body - orange/brown (doubled) */}
        <rect x="16" y="40" width="32" height="16" fill="#FF8C42" />
        <rect x="20" y="36" width="24" height="4" fill="#FF8C42" />
        
        {/* Cat head (doubled) */}
        <rect x="20" y="24" width="24" height="16" fill="#FF8C42" />
        <rect x="16" y="28" width="4" height="8" fill="#FF8C42" />
        <rect x="44" y="28" width="4" height="8" fill="#FF8C42" />
        
        {/* Ears (doubled) */}
        <rect x="20" y="20" width="4" height="4" fill="#FF8C42" />
        <rect x="40" y="20" width="4" height="4" fill="#FF8C42" />
        <rect x="22" y="22" width="2" height="2" fill="#FFB366" />
        <rect x="40" y="22" width="2" height="2" fill="#FFB366" />
        
        {/* Face details (doubled) */}
        <rect x="24" y="28" width="16" height="8" fill="#FFB366" />
        
        {/* Eyes (doubled) */}
        {isBlinking ? (
          <>
            <rect x="26" y="30" width="4" height="2" fill="#2C1810" />
            <rect x="34" y="30" width="4" height="2" fill="#2C1810" />
          </>
        ) : (
          <>
            <rect x="26" y="30" width="4" height="4" fill="#2C1810" />
            <rect x="34" y="30" width="4" height="4" fill="#2C1810" />
            <rect x="28" y="30" width="2" height="2" fill="#FFFFFF" />
            <rect x="36" y="30" width="2" height="2" fill="#FFFFFF" />
          </>
        )}
        
        {/* Nose (doubled) */}
        <rect x="30" y="34" width="4" height="2" fill="#E74C3C" />
        
        {/* Mouth (doubled) */}
        <rect x="28" y="36" width="2" height="2" fill="#2C1810" />
        <rect x="34" y="36" width="2" height="2" fill="#2C1810" />
        
        {/* Stripes (doubled) */}
        <rect x="24" y="26" width="16" height="2" fill="#E67E22" />
        <rect x="20" y="42" width="24" height="2" fill="#E67E22" />
        <rect x="16" y="50" width="32" height="2" fill="#E67E22" />
        
        {/* Legs (doubled) */}
        <rect x="20" y="56" width="4" height="4" fill="#FF8C42" />
        <rect x="28" y="56" width="4" height="4" fill="#FF8C42" />
        <rect x="32" y="56" width="4" height="4" fill="#FF8C42" />
        <rect x="40" y="56" width="4" height="4" fill="#FF8C42" />
        
        {/* Paws (doubled) */}
        <rect x="20" y="60" width="4" height="2" fill="#2C1810" />
        <rect x="28" y="60" width="4" height="2" fill="#2C1810" />
        <rect x="32" y="60" width="4" height="2" fill="#2C1810" />
        <rect x="40" y="60" width="4" height="2" fill="#2C1810" />
        
        {/* Tail (doubled) */}
        <rect x="48" y="36" width="6" height="4" fill="#FF8C42" />
        <rect x="52" y="32" width="4" height="4" fill="#FF8C42" />
        <rect x="54" y="28" width="2" height="4" fill="#FF8C42" />
      </svg>
    </div>
  );

  // Update container size
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerSize({ 
          width: window.innerWidth, 
          height: window.innerHeight 
        });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Animation loop
  useEffect(() => {
    if (isPausedByUser) return;

    const animate = () => {
      const now = Date.now();
      
      setCatState(prevState => {
        let newState = { ...prevState };
        const timeSinceLastMove = now - lastMoveTime.current;
        const timeSinceLastBlink = now - lastBlinkTime.current;
        const timeSinceMoveStart = now - moveStartTime.current;
        
        // Blinking logic (every 3-8 seconds for more liveliness)
        if (timeSinceLastBlink > 3000 + Math.random() * 5000) {
          newState.isBlinking = true;
          lastBlinkTime.current = now;
          setTimeout(() => {
            setCatState(prev => ({ ...prev, isBlinking: false }));
          }, 200);
        }
        
        // Pause logic (every 12-18 seconds of movement)
        if (!newState.isPaused && newState.isMoving && timeSinceMoveStart > 12000 + Math.random() * 6000) {
          newState.isPaused = true;
          newState.isMoving = false;
          pauseStartTime.current = now;
        }
        
        // Resume from pause (after 1.5-4 seconds)
        if (newState.isPaused && (now - pauseStartTime.current) > 1500 + Math.random() * 2500) {
          newState.isPaused = false;
          newState.isMoving = true;
          moveStartTime.current = now;
          
          // Change direction when resuming with some variety
          const directionChange = Math.random();
          if (directionChange < 0.3) {
            // Continue in similar direction
            newState.direction += (Math.random() - 0.5) * Math.PI / 2;
          } else if (directionChange < 0.7) {
            // Turn around
            newState.direction += Math.PI + (Math.random() - 0.5) * Math.PI / 3;
          } else {
            // Random new direction
            newState.direction = Math.random() * Math.PI * 2;
          }
          newState.facingLeft = Math.cos(newState.direction) < 0;
        }
        
        // Movement logic
        if (newState.isMoving && !newState.isPaused && timeSinceLastMove > 40) {
          const speed = 1.5;
          let newX = newState.position.x + Math.cos(newState.direction) * speed;
          let newY = newState.position.y + Math.sin(newState.direction) * speed;
          
          // Cat size boundaries (64px cat = 32px radius)
          const catRadius = 32;
          const margin = 10;
          
          // Keep cat within visible screen boundaries
          if (newX < catRadius + margin) {
            newX = catRadius + margin;
            newState.direction = Math.PI - newState.direction; // bounce off left
            newState.facingLeft = false;
          }
          if (newX > containerSize.width - catRadius - margin) {
            newX = containerSize.width - catRadius - margin;
            newState.direction = Math.PI - newState.direction; // bounce off right
            newState.facingLeft = true;
          }
          if (newY < catRadius + margin) {
            newY = catRadius + margin;
            newState.direction = -newState.direction; // bounce off top
          }
          if (newY > containerSize.height - catRadius - margin) {
            newY = containerSize.height - catRadius - margin;
            newState.direction = -newState.direction; // bounce off bottom
          }
          
          // Add some randomness to movement
          if (Math.random() < 0.03) {
            newState.direction += (Math.random() - 0.5) * 0.5; // slight direction change
            newState.facingLeft = Math.cos(newState.direction) < 0;
          }
          
          // Occasionally do a complete direction change
          if (Math.random() < 0.008) {
            newState.direction = Math.random() * Math.PI * 2;
            newState.facingLeft = Math.cos(newState.direction) < 0;
          }
          
          newState.position = { x: newX, y: newY };
          lastMoveTime.current = now;
        }
        
        return newState;
      });
      
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [containerSize, isPausedByUser]);

  return (
    <>
      <div ref={containerRef} className="fixed inset-0 pointer-events-none z-10" />
      
      {/* Cat */}
      <div
        className={`fixed pointer-events-auto z-10 cursor-pointer transition-all duration-300 hover:scale-125 hover:drop-shadow-xl ${
          catState.isMoving && !catState.isPaused ? 'animate-cat-walk' : 'animate-cat-idle'
        }`}
        style={{
          left: `${catState.position.x}px`,
          top: `${catState.position.y}px`,
          transform: 'translate(-50%, -50%)',
          willChange: 'transform',
          filter: isPausedByUser ? 'brightness(1.1) drop-shadow(0 0 10px rgba(255, 140, 66, 0.6))' : 'none'
        }}
        onMouseEnter={() => setIsPausedByUser(true)}
        onMouseLeave={() => setIsPausedByUser(false)}
        title="Кот-талисман челленджа! 🐱"
      >
        <CatSprite 
          isBlinking={catState.isBlinking} 
          facingLeft={catState.facingLeft}
        />
        
        {/* Hover tooltip */}
        {isPausedByUser && (
          <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap animate-fade-in">
            Мяу! 🐾 (Наведи мышку для паузы)
          </div>
        )}
      </div>

      {/* Cat control panel (optional, can be removed) */}
      {isPausedByUser && (
        <div className="fixed bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-lg z-20 animate-fade-in">
          <div className="text-xs text-gray-600 mb-2">🐱 Кот-талисман</div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setCatState(prev => ({
                  ...prev,
                  position: { 
                    x: Math.random() * (containerSize.width - 128) + 64, 
                    y: Math.random() * (containerSize.height - 128) + 64 
                  },
                  direction: Math.random() * Math.PI * 2,
                  facingLeft: Math.random() > 0.5
                }));
              }}
              className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors"
            >
              📍 Телепорт
            </button>
            <button
              onClick={() => {
                setCatState(prev => ({
                  ...prev,
                  isBlinking: true
                }));
                setTimeout(() => {
                  setCatState(prev => ({ ...prev, isBlinking: false }));
                }, 200);
              }}
              className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
            >
              😉 Подмигнуть
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AnimatedCat;