import Bottleneck from "bottleneck";

export const iconikLimiter = new Bottleneck({
  reservoir: 1000, // Allow up to 1000 requests in 20s
  reservoirRefreshAmount: 1000,
  reservoirRefreshInterval: 20 * 1000, // Refill every 20 seconds

  minTime: 20, // At least 20ms between requests (~50 req/sec)
  maxConcurrent: 5, // Prevent overloading local resources

  retryLimit: 5, // Retry up to 5 times on 429 errors
  retryDelay: 2000, // Wait 2s before retrying
});
