import React from 'react';

import {
  SlideTransition,
  FadeTransition,
  ScaleTransition,
  TransformTransition,
  CompoundTransition,
} from './index';

// Pre-configured animation components
export const AnimationPresets = {
  // Page transitions
  PageSlideIn: ({ children, ...props }: any) => (
    <SlideTransition direction='right' duration={400} {...props}>
      {children}
    </SlideTransition>
  ),

  PageFadeIn: ({ children, ...props }: any) => (
    <FadeTransition duration={300} {...props}>
      {children}
    </FadeTransition>
  ),

  // Modal animations
  ModalSlideUp: ({ children, ...props }: any) => (
    <CompoundTransition
      transitions={[
        { type: 'fade', props: { from: 0, to: 1 } },
        { type: 'slide', props: { direction: 'up', distance: '100%' } },
      ]}
      duration={300}
      {...props}
    >
      {children}
    </CompoundTransition>
  ),

  // List item animations
  ListItemStagger: ({ children, index = 0, ...props }: any) => (
    <CompoundTransition
      transitions={[
        { type: 'fade', props: { from: 0, to: 1 } },
        { type: 'slide', props: { direction: 'up', distance: 20 } },
      ]}
      duration={300}
      delay={index * 50}
      {...props}
    >
      {children}
    </CompoundTransition>
  ),

  // Button press animation
  ButtonPress: ({ children, ...props }: any) => (
    <ScaleTransition from={0.95} to={1} duration={150} {...props}>
      {children}
    </ScaleTransition>
  ),

  // Card hover animation
  CardHover: ({ children, isHovered, ...props }: any) => (
    <TransformTransition
      in={isHovered}
      from={{ scale: 1, y: 0 }}
      to={{ scale: 1.02, y: -4 }}
      duration={200}
      {...props}
    >
      {children}
    </TransformTransition>
  ),
};
