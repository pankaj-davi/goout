export const animations = {
  // Timings (in ms)
  duration: {
    fast: 200,
    normal: 300,
    slow: 500,
  },
  
  // Easing functions
  easing: {
    easeOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },

  // Common animations
  transitions: {
    fadeIn: {
      from: { opacity: 0 },
      to: { opacity: 1 },
    },
    fadeOut: {
      from: { opacity: 1 },
      to: { opacity: 0 },
    },
    slideUp: {
      from: { translateY: 100, opacity: 0 },
      to: { translateY: 0, opacity: 1 },
    },
    slideDown: {
      from: { translateY: -100, opacity: 0 },
      to: { translateY: 0, opacity: 1 },
    },
    scale: {
      from: { scale: 0.9, opacity: 0 },
      to: { scale: 1, opacity: 1 },
    },
  },

  // Dating app specific animations
  dating: {
    likeAnimation: {
      from: { scale: 1, rotate: '0deg' },
      to: { scale: 1.2, rotate: '15deg' },
      duration: 300,
    },
    matchAnimation: {
      from: { scale: 0.5, opacity: 0 },
      to: { scale: 1, opacity: 1 },
      duration: 500,
    },
    heartbeat: {
      keyframes: [
        { scale: 1, time: 0 },
        { scale: 1.2, time: 0.2 },
        { scale: 1, time: 0.4 },
        { scale: 1.1, time: 0.6 },
        { scale: 1, time: 0.8 },
      ],
      duration: 1000,
    }
  }
}