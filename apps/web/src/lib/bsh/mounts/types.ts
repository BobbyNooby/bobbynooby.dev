import type { LiveStatus } from '../types';

/** What mounts read at the moment a file is opened, so live files show current values. */
export type MountEnv = { live: () => LiveStatus; now: () => Date; timeZone?: string };
