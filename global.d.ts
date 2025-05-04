// global.d.ts
// ————————————————————————————————————————————————————————————————————————
// CSS modules & plain CSS
declare module '*.module.css';
declare module '*.module.scss';
declare module '*.module.sass';
declare module '*.css';
declare module '*.scss';
declare module '*.sass';

// Static assets
declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.gif';
declare module '*.webp';
declare module '*.avif';

// SVGs (with optional ReactComponent import)
declare module '*.svg' {
  import React from 'react';
  export const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  const src: string;
  export default src;
}
