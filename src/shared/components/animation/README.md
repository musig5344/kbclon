# Animation System Documentation

## Overview

This animation system is designed to provide smooth 60fps animations for the KB StarBanking app. It includes performance monitoring, GPU-accelerated transitions, spring physics, gesture handling, and the FLIP technique for layout animations.

## Key Features

- **60fps Performance**: All animations are optimized for smooth 60fps performance
- **GPU Acceleration**: Uses transform and opacity for hardware acceleration
- **Performance Monitoring**: Built-in FPS tracking and performance metrics
- **Reduced Motion Support**: Respects user preferences for reduced motion
- **Spring Physics**: Natural motion with configurable spring animations
- **Gesture Support**: Touch and mouse gesture handling with momentum
- **FLIP Animations**: Smooth layout transitions using the FLIP technique
- **Virtual Scrolling**: Optimized list rendering for large datasets

## Quick Start

### Basic Fade Animation

```tsx
import { FadeTransition } from '@/shared/components/animation';

function MyComponent() {
  const [isVisible, setIsVisible] = useState(false);
  
  return (
    <FadeTransition in={isVisible} duration={300}>
      <div>Animated content</div>
    </FadeTransition>
  );
}
```

### Spring Animation

```tsx
import { SpringTransform, springPresets } from '@/shared/components/animation';

function BouncyCard() {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <SpringTransform
      scale={expanded ? 1.1 : 1}
      config={springPresets.wobbly}
    >
      <Card onClick={() => setExpanded(!expanded)}>
        Click me!
      </Card>
    </SpringTransform>
  );
}
```

### Gesture Handling

```tsx
import { Draggable } from '@/shared/components/animation';

function DraggableCard() {
  return (
    <Draggable
      onDragEnd={(velocity) => console.log('Released with velocity:', velocity)}
      bounds={{ left: -100, right: 100 }}
    >
      <Card>Drag me!</Card>
    </Draggable>
  );
}
```

### FLIP Animation

```tsx
import { useFlip } from '@/shared/components/animation';

function SortableList({ items, onSort }) {
  const { ref, flip } = useFlip();
  
  const handleSort = () => {
    flip(() => {
      // This callback runs between "First" and "Last"
      onSort(items);
    });
  };
  
  return (
    <div ref={ref}>
      {items.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
      <button onClick={handleSort}>Sort</button>
    </div>
  );
}
```

## Performance Monitoring

### Enable Global Monitoring

```tsx
import { PerformanceUtils } from '@/shared/components/animation';

// In your app initialization
PerformanceUtils.startMonitoring();

// Subscribe to FPS updates
const unsubscribe = PerformanceUtils.subscribeToMetrics((metrics) => {
  console.log('Current FPS:', metrics.fps);
  if (metrics.fps < 55) {
    console.warn('Performance degradation detected');
  }
});
```

### Monitor Specific Animations

```tsx
import { PerformanceUtils } from '@/shared/components/animation';

await PerformanceUtils.monitorAnimation('page-transition', async () => {
  // Your animation code here
  await navigateToPage('/next');
});
```

## Animation Hooks

### useAnimation

Basic animation from one value to another:

```tsx
const { value, start, stop } = useAnimation(0, 100, {
  duration: 500,
  easing: 'easeInOut',
  onComplete: () => console.log('Animation complete'),
});

// Start animation
useEffect(() => {
  start();
}, []);
```

### useScrollAnimation

Trigger animations based on scroll position:

```tsx
const ref = useRef<HTMLDivElement>(null);
const { value, isVisible } = useScrollAnimation(ref, {
  threshold: 0.5,
  triggerOnce: true,
});

return (
  <div
    ref={ref}
    style={{
      opacity: value,
      transform: `translateY(${(1 - value) * 50}px)`,
    }}
  >
    Scroll-triggered content
  </div>
);
```

### useParallax

Create parallax scrolling effects:

```tsx
const ref = useRef<HTMLDivElement>(null);
const { style } = useParallax(ref, {
  speed: 0.5,
  offset: 100,
});

return (
  <div ref={ref} style={style}>
    <img src="background.jpg" alt="Parallax background" />
  </div>
);
```

## Optimized Components

### ScrollOptimizedList

Virtual scrolling for large lists:

```tsx
import { ScrollOptimizedList } from '@/shared/components/animation';

<ScrollOptimizedList
  items={data}
  renderItem={(item, index) => <ListItem key={item.id} {...item} />}
  itemHeight={80}
  containerHeight={600}
  enableAnimations
  overscan={3}
/>
```

### OptimizedKBToast

Performance-optimized toast notifications:

```tsx
import { useToastContext } from '@/components/common/OptimizedKBToast';

const { showSuccess, showError } = useToastContext();

// Show notifications
showSuccess('Operation completed successfully');
showError('An error occurred');
```

## Best Practices

### 1. Use GPU-Accelerated Properties

Always animate `transform` and `opacity` instead of layout properties:

```tsx
// Good - GPU accelerated
<div style={{ transform: `translateX(${x}px)` }} />

// Bad - causes layout recalculation
<div style={{ left: `${x}px` }} />
```

### 2. Apply Containment

Use CSS containment to isolate animations:

```tsx
import { AnimationStyles } from '@/shared/components/animation';

const AnimatedBox = styled.div`
  ${AnimationStyles.contained}
  ${AnimationStyles.gpuAccelerated}
`;
```

### 3. Manage will-change

Only apply `will-change` during animations:

```tsx
import { willChange } from '@/shared/components/animation';

const handleAnimationStart = (element) => {
  willChange.manage('transform', 300).onAnimationStart(element);
};

const handleAnimationEnd = (element) => {
  willChange.manage('transform', 300).onAnimationEnd(element);
};
```

### 4. Batch DOM Operations

Prevent layout thrashing:

```tsx
import { batchDOM } from '@/shared/components/animation';

batchDOM.batch([
  {
    read: () => element.getBoundingClientRect(),
    write: (rect) => {
      element.style.transform = `translateX(${rect.width}px)`;
    },
  },
  // More operations...
]);
```

### 5. Respect User Preferences

Always check for reduced motion:

```tsx
import { AnimationUtils } from '@/shared/components/animation';

if (AnimationUtils.shouldAnimate()) {
  // Run animations
} else {
  // Skip animations or use instant transitions
}
```

## Spring Presets

Available spring configurations:

- `default`: Balanced spring (stiffness: 170, damping: 26)
- `gentle`: Soft spring (stiffness: 120, damping: 14)
- `wobbly`: Bouncy spring (stiffness: 180, damping: 12)
- `stiff`: Quick spring (stiffness: 210, damping: 20)
- `slow`: Slow spring (stiffness: 70, damping: 16)
- `quick`: Fast spring (stiffness: 300, damping: 30)
- `bounce`: Very bouncy (stiffness: 600, damping: 15)
- `noWobble`: No overshoot (stiffness: 170, damping: 40)

## Easing Functions

Available easing functions:

- Linear: `linear`
- Ease: `easeIn`, `easeOut`, `easeInOut`
- Power: `easeInCubic`, `easeOutCubic`, `easeInOutCubic`
- Trigonometric: `easeInSine`, `easeOutSine`, `easeInOutSine`
- Exponential: `easeInExpo`, `easeOutExpo`, `easeInOutExpo`
- Back: `easeInBack`, `easeOutBack`, `easeInOutBack`
- Elastic: `elasticOut`
- Bounce: `bounceOut`

## Troubleshooting

### Animations are janky

1. Check if you're animating GPU-accelerated properties
2. Enable performance monitoring to identify bottlenecks
3. Reduce the number of simultaneous animations
4. Use `will-change` strategically
5. Consider using `contain` CSS property

### Animations don't run

1. Check if user has reduced motion enabled
2. Verify the component is properly mounted
3. Check animation duration isn't 0
4. Ensure `in` prop is changing for transitions

### Memory leaks

1. Always cleanup animation frames in useEffect
2. Clear timeouts when components unmount
3. Unsubscribe from performance monitoring

## Examples

See the `/examples` directory for complete working examples of:
- Page transitions
- Modal animations
- List animations
- Gesture-based interactions
- Parallax scrolling
- Loading states