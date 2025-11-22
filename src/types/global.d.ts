import type { IMapAPI } from '@/services/map/types';
import type { RouteRecordNameGeneric } from 'vue-router';

declare global {
  interface Window {
    mapAPI: IMapAPI;
    mapAPIInstances: Map<RouteRecordNameGeneric, IMapAPI | undefined>
  }
}

export {}; // This file needs to be a module.
