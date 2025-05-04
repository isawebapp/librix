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

// global.d.ts
declare module 'node-cron' {
  import { EventEmitter } from 'events';

  /** Create a scheduled task */
  export function schedule(
    cronExpression: string,
    func: ((now: Date | 'manual' | 'init') => void) | string,
    options?: ScheduleOptions,
  ): ScheduledTask;

  /** Validate a cron expression */
  export function validate(cronExpression: string): boolean;

  /** Get all registered tasks */
  export function getTasks(): Map<string, ScheduledTask>;

  export interface ScheduledTask extends EventEmitter {
    /** Manually trigger the task */
    now: (now?: Date) => void;
    start(): void;
    stop(): void;
  }

  export interface ScheduleOptions {
    scheduled?: boolean;
    timezone?: string;
    recoverMissedExecutions?: boolean;
    name?: string;
    runOnInit?: boolean;
  }
}

declare module 'better-sqlite3';