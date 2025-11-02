import type { IMapAPI } from '@/services/map/types';

declare global {
  interface Window {
    mapAPI: IMapAPI;
  }
}

export {}; // This file needs to be a module.
