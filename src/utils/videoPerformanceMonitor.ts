'use client';

interface VideoPerformanceMetrics {
  videoId: string;
  loadTime: number;
  bufferSize: number;
  playbackQuality: string;
  errorCount: number;
  lastError?: string;
  isPlaying: boolean;
  bufferEvents: number;
  cleanup?: () => void;
}

interface VideoPerformanceOptions {
  enableLogging?: boolean;
  logInterval?: number;
  enableErrorTracking?: boolean;
}

class VideoPerformanceMonitor {
  private metrics: Map<string, VideoPerformanceMetrics> = new Map();
  private observers: Map<string, PerformanceObserver> = new Map();
  private options: VideoPerformanceOptions;
  
  constructor(options: VideoPerformanceOptions = {}) {
    this.options = {
      enableLogging: process.env.NODE_ENV === 'development',
      logInterval: 5000,
      enableErrorTracking: true,
      ...options
    };
  }

  // Start monitoring a video
  startMonitoring(videoId: string, videoElement: HTMLVideoElement): void {
    if (this.metrics.has(videoId)) {
      return; // Already monitoring
    }

    const metrics: VideoPerformanceMetrics = {
      videoId,
      loadTime: 0,
      bufferSize: 0,
      playbackQuality: 'unknown',
      errorCount: 0,
      isPlaying: false,
      bufferEvents: 0
    };

    this.metrics.set(videoId, metrics);
    this.setupEventListeners(videoId, videoElement);
    
    if (this.options.enableLogging) {
      console.log(`Started monitoring video: ${videoId}`);
    }
  }

  // Stop monitoring a video
  stopMonitoring(videoId: string): void {
    const observer = this.observers.get(videoId);
    if (observer) {
      observer.disconnect();
      this.observers.delete(videoId);
    }

    const metrics = this.metrics.get(videoId);
    if (metrics) {
      // Call cleanup function to remove event listeners
      if (metrics.cleanup) {
        metrics.cleanup();
      }
      
      if (this.options.enableLogging) {
        console.log(`Stopped monitoring video: ${videoId}`, metrics);
      }
    }
  }

  // Get metrics for a specific video
  getMetrics(videoId: string): VideoPerformanceMetrics | undefined {
    return this.metrics.get(videoId);
  }

  // Get all metrics
  getAllMetrics(): VideoPerformanceMetrics[] {
    return Array.from(this.metrics.values());
  }

  // Setup event listeners for video element
  private setupEventListeners(videoId: string, videoElement: HTMLVideoElement): void {
    const metrics = this.metrics.get(videoId);
    if (!metrics) return;

    const loadStartTime = performance.now();

    // Track load time
    const handleLoadStart = () => {
      metrics.loadTime = performance.now() - loadStartTime;
    };

    // Track buffer events
    const handleBuffer = () => {
      metrics.bufferEvents++;
      if (this.options.enableLogging) {
        console.warn(`Buffer event for video ${videoId}`);
      }
    };

    // Track errors
    const handleError = (e: Event) => {
      metrics.errorCount++;
      const error = (e as ErrorEvent).message || 'Unknown error';
      metrics.lastError = error;
      
      if (this.options.enableErrorTracking) {
        console.error(`Video error for ${videoId}:`, error);
      }
    };

    // Track playback state
    const handlePlay = () => {
      metrics.isPlaying = true;
    };

    const handlePause = () => {
      metrics.isPlaying = false;
    };

    // Track quality changes
    const handleQualityChange = () => {
      if (videoElement.getVideoPlaybackQuality) {
        const quality = videoElement.getVideoPlaybackQuality();
        metrics.bufferSize = quality.totalVideoFrames;
        
        // Determine playback quality based on dropped frames
        const droppedFrameRatio = quality.droppedVideoFrames / quality.totalVideoFrames;
        if (droppedFrameRatio < 0.05) {
          metrics.playbackQuality = 'excellent';
        } else if (droppedFrameRatio < 0.1) {
          metrics.playbackQuality = 'good';
        } else if (droppedFrameRatio < 0.2) {
          metrics.playbackQuality = 'fair';
        } else {
          metrics.playbackQuality = 'poor';
        }
      }
    };

    // Add event listeners
    videoElement.addEventListener('loadstart', handleLoadStart);
    videoElement.addEventListener('waiting', handleBuffer);
    videoElement.addEventListener('error', handleError);
    videoElement.addEventListener('play', handlePlay);
    videoElement.addEventListener('pause', handlePause);
    videoElement.addEventListener('timeupdate', handleQualityChange);

    // Set up Performance Observer for resource timing
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.name.includes(videoId)) {
            const resourceEntry = entry as PerformanceResourceTiming;
            if (this.options.enableLogging) {
              console.log(`Resource timing for ${videoId}:`, {
                duration: resourceEntry.duration,
                size: resourceEntry.transferSize,
                encodedSize: resourceEntry.encodedBodySize
              });
            }
          }
        });
      });

      observer.observe({ entryTypes: ['resource'] });
      this.observers.set(videoId, observer);
    }

    // Store cleanup function
    const cleanup = () => {
      videoElement.removeEventListener('loadstart', handleLoadStart);
      videoElement.removeEventListener('waiting', handleBuffer);
      videoElement.removeEventListener('error', handleError);
      videoElement.removeEventListener('play', handlePlay);
      videoElement.removeEventListener('pause', handlePause);
      videoElement.removeEventListener('timeupdate', handleQualityChange);
    };

    // Store cleanup function in metrics for later use
    metrics.cleanup = cleanup;
  }

  // Generate performance report
  generateReport(): string {
    const allMetrics = this.getAllMetrics();
    if (allMetrics.length === 0) {
      return 'No videos monitored';
    }

    let report = 'Video Performance Report\n';
    report += '========================\n\n';

    allMetrics.forEach(metrics => {
      report += `Video ID: ${metrics.videoId}\n`;
      report += `  Load Time: ${metrics.loadTime.toFixed(2)}ms\n`;
      report += `  Buffer Events: ${metrics.bufferEvents}\n`;
      report += `  Error Count: ${metrics.errorCount}\n`;
      report += `  Playback Quality: ${metrics.playbackQuality}\n`;
      report += `  Currently Playing: ${metrics.isPlaying}\n`;
      
      if (metrics.lastError) {
        report += `  Last Error: ${metrics.lastError}\n`;
      }
      
      report += '\n';
    });

    return report;
  }

  // Check if videos are performing well
  checkPerformanceThresholds(): {
    videosWithIssues: string[];
    recommendations: string[];
  } {
    const videosWithIssues: string[] = [];
    const recommendations: string[] = [];

    this.getAllMetrics().forEach(metrics => {
      // Check load time
      if (metrics.loadTime > 3000) {
        videosWithIssues.push(metrics.videoId);
        recommendations.push(`${metrics.videoId}: Consider optimizing video size or format for faster loading`);
      }

      // Check buffer events
      if (metrics.bufferEvents > 5) {
        videosWithIssues.push(metrics.videoId);
        recommendations.push(`${metrics.videoId}: High buffer count detected, consider preloading or using adaptive bitrate`);
      }

      // Check errors
      if (metrics.errorCount > 0) {
        videosWithIssues.push(metrics.videoId);
        recommendations.push(`${metrics.videoId}: Error detected - ${metrics.lastError}`);
      }

      // Check playback quality
      if (metrics.playbackQuality === 'poor') {
        videosWithIssues.push(metrics.videoId);
        recommendations.push(`${metrics.videoId}: Poor playback quality detected, consider reducing video resolution`);
      }
    });

    return { videosWithIssues, recommendations };
  }
}

// Create a singleton instance
const videoPerformanceMonitor = new VideoPerformanceMonitor();

export default videoPerformanceMonitor;
export { VideoPerformanceMonitor };
export type { VideoPerformanceMetrics };