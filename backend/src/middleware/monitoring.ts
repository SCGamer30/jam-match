/**
 * Monitoring and logging middleware for production
 */

import { Request, Response, NextFunction } from "express";

// Request logging middleware
export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const start = Date.now();

  // Log request
  console.log(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
      userAgent: req.get("User-Agent"),
      ip: req.ip,
      type: "request",
    })
  );

  // Log response when finished
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        duration,
        type: "response",
      })
    );
  });

  next();
};

// Error logging middleware
export const errorLogger = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      error: {
        name: err.name,
        message: err.message,
        stack: err.stack,
      },
      request: {
        method: req.method,
        url: req.url,
        headers: req.headers,
        body: req.body,
      },
      type: "error",
    })
  );

  next(err);
};

// Health check endpoint
export const healthCheck = (req: Request, res: Response) => {
  const healthData = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version || "1.0.0",
    environment: process.env.NODE_ENV || "development",
  };

  res.status(200).json(healthData);
};

// Metrics endpoint
export const metrics = (req: Request, res: Response) => {
  const metrics = {
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    cpu: process.cpuUsage(),
    version: process.env.npm_package_version || "1.0.0",
    environment: process.env.NODE_ENV || "development",
    platform: process.platform,
    nodeVersion: process.version,
  };

  res.status(200).json(metrics);
};

// Performance monitoring middleware
export const performanceMonitor = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const start = process.hrtime.bigint();

  res.on("finish", () => {
    const end = process.hrtime.bigint();
    const duration = Number(end - start) / 1000000; // Convert to milliseconds

    // Log slow requests (> 1 second)
    if (duration > 1000) {
      console.warn(
        JSON.stringify({
          timestamp: new Date().toISOString(),
          type: "slow_request",
          method: req.method,
          url: req.url,
          duration,
          statusCode: res.statusCode,
        })
      );
    }

    // Log performance metrics
    if (process.env.LOG_LEVEL === "debug") {
      console.debug(
        JSON.stringify({
          timestamp: new Date().toISOString(),
          type: "performance",
          method: req.method,
          url: req.url,
          duration,
          statusCode: res.statusCode,
          memory: process.memoryUsage(),
        })
      );
    }
  });

  next();
};
