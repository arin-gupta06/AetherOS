/**
 * AetherOS Shared Services
 * 
 * Utility services and helpers used across modules
 */

export { cacheService, cacheKeys } from '../../services/cache';
export { queuePrefetch, getPrefetchStatus } from '../../services/prefetch';
export { api } from '../../lib/api';

// Service factories
export { createApiClient } from './apiClientFactory';
export { createLogger } from './loggerService';
export { createEventBus } from './eventBusService';
export { createErrorHandler } from './errorHandlerService';
