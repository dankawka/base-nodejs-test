import Bottleneck from "bottleneck";

export const iconikLimiter = new Bottleneck({
  reservoir: 1000, // Allow up to 1000 requests in 20s
  reservoirRefreshAmount: 1000,
  reservoirRefreshInterval: 20 * 1000, // Refill every 20 seconds

  minTime: 20, // At least 20ms between requests (~50 req/sec)
  maxConcurrent: 5, // Prevent overloading local resources
});

iconikLimiter.on("failed", async (error, jobInfo) => {
  const id = jobInfo.options.id;
  console.warn(`Job ${id} failed: ${error}`);

  if (jobInfo.retryCount < 3) {
    const nextRetry = 2000 * jobInfo.retryCount;
    console.log(`Retrying job ${id} in ${nextRetry}!`);
    return nextRetry;
  }
});
iconikLimiter.on("retry", (error, jobInfo) =>
  console.log(`Now retrying ${jobInfo.options.id}`)
);

export const frameLimiter = new Bottleneck({
  reservoir: 100, // Allow up to 100 requests in 60s
  reservoirRefreshAmount: 100,
  reservoirRefreshInterval: 60 * 1000, // Refill every 60 seconds

  minTime: 60, // At least 60ms between requests
  maxConcurrent: 5, // Prevent overloading local resources
});

frameLimiter.on("failed", async (error, jobInfo) => {
  const id = jobInfo.options.id;
  console.warn(`Job ${id} failed: ${error}`);

  if (jobInfo.retryCount < 3) {
    const nextRetry = 2000 * jobInfo.retryCount;
    console.log(`Retrying job ${id} in ${nextRetry}!`);
    return nextRetry;
  }
});
frameLimiter.on("retry", (error, jobInfo) =>
  console.log(`Now retrying ${jobInfo.options.id}`)
);
