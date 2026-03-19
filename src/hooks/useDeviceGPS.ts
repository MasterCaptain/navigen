import { useState, useEffect, useCallback, useRef } from 'react';

export interface DeviceGPSConfig {
  enabled: boolean;
  highAccuracy?: boolean; // Use high accuracy mode (slower but more precise)
  updateInterval?: number; // Milliseconds between position updates
  timeout?: number; // Milliseconds to wait for position
  maximumAge?: number; // Maximum age of cached position
}

export interface DeviceGPSData {
  position: { lat: number; lng: number };
  heading: number | null; // Heading from device compass (if available)
  speed: number | null; // Speed in m/s
  accuracy: number | null; // Position accuracy in meters
  altitude: number | null; // Altitude in meters
  timestamp: Date;
}

export interface DeviceGPSState extends DeviceGPSData {
  isEnabled: boolean;
  isTracking: boolean;
  error: string | null;
  permissionGranted: boolean | null;
}

export function useDeviceGPS(config: DeviceGPSConfig) {
  const [state, setState] = useState<DeviceGPSState>({
    position: { lat: 78.2232, lng: 15.6267 }, // Default: Longyearbyen
    heading: null,
    speed: null,
    accuracy: null,
    altitude: null,
    timestamp: new Date(),
    isEnabled: config.enabled,
    isTracking: false,
    error: null,
    permissionGranted: null,
  });

  const watchIdRef = useRef<number | null>(null);

  // Handle geolocation success
  const handleSuccess = useCallback((pos: GeolocationPosition) => {
    const { latitude, longitude, altitude, accuracy, heading, speed } = pos.coords;
    
    console.log('📍 Device GPS update:', {
      lat: latitude,
      lng: longitude,
      accuracy: accuracy,
      heading: heading,
      speed: speed
    });

    setState(prev => ({
      ...prev,
      position: { lat: latitude, lng: longitude },
      heading: heading, // Can be null if device doesn't have compass
      speed: speed, // Speed in m/s
      accuracy: accuracy,
      altitude: altitude,
      timestamp: new Date(pos.timestamp),
      isTracking: true,
      error: null,
      permissionGranted: true,
    }));
  }, []);

  // Handle geolocation error
  const handleError = useCallback((err: GeolocationPositionError) => {
    // Check if it's a permissions policy issue (common in iframes/sandboxed environments)
    const isPermissionsPolicy = err.message.includes('permissions policy') || err.message.includes('disabled in this document');
    
    if (isPermissionsPolicy) {
      // This is expected in sandboxed environments - log as info, not error
      console.info('ℹ️ Device GPS not available (Permissions Policy):', {
        code: err.code,
        message: err.message
      });
    } else {
      // Real error - log full details
      console.error('❌ Device GPS error:', {
        code: err.code,
        message: err.message,
        PERMISSION_DENIED: err.PERMISSION_DENIED,
        POSITION_UNAVAILABLE: err.POSITION_UNAVAILABLE,
        TIMEOUT: err.TIMEOUT
      });
    }
    
    let errorMessage = 'GPS error';
    
    switch (err.code) {
      case err.PERMISSION_DENIED:
        if (isPermissionsPolicy) {
          errorMessage = 'Device GPS is not available in this environment. Use Simulation mode instead.';
        } else {
          errorMessage = 'GPS permission denied. Please allow location access.';
        }
        setState(prev => ({ ...prev, permissionGranted: false }));
        break;
      case err.POSITION_UNAVAILABLE:
        errorMessage = 'GPS position unavailable. Check device settings.';
        break;
      case err.TIMEOUT:
        errorMessage = 'GPS request timeout. Retrying...';
        break;
      default:
        errorMessage = `GPS error: ${err.message}`;
    }
    
    setState(prev => ({
      ...prev,
      error: errorMessage,
      isTracking: false,
    }));
  }, []);

  // Start GPS tracking
  const startTracking = useCallback(() => {
    // Check if geolocation is available
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      console.error('❌ Geolocation API not available');
      setState(prev => ({
        ...prev,
        error: 'Geolocation is not supported by your browser',
        isTracking: false,
        permissionGranted: false,
      }));
      return;
    }

    console.log('🛰️ Starting device GPS tracking...');
    console.log('📱 Browser:', navigator.userAgent);
    console.log('🌐 Secure context (HTTPS):', window.isSecureContext);

    const options: PositionOptions = {
      enableHighAccuracy: config.highAccuracy ?? true,
      timeout: config.timeout ?? 10000,
      maximumAge: config.maximumAge ?? 0,
    };

    console.log('⚙️ GPS options:', options);

    // Use watchPosition for continuous updates
    try {
      watchIdRef.current = navigator.geolocation.watchPosition(
        handleSuccess,
        handleError,
        options
      );
      console.log('✅ GPS watch started, ID:', watchIdRef.current);
      setState(prev => ({ ...prev, isTracking: true, error: null }));
    } catch (err) {
      console.error('❌ Failed to start GPS watch:', err);
      setState(prev => ({
        ...prev,
        error: `Failed to start GPS: ${err}`,
        isTracking: false,
      }));
    }
  }, [config.highAccuracy, config.timeout, config.maximumAge, handleSuccess, handleError]);

  // Stop GPS tracking
  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
      console.log('🛑 Stopped device GPS tracking');
    }
    
    setState(prev => ({ ...prev, isTracking: false }));
  }, []);

  // Request one-time position (for testing)
  const requestPosition = useCallback(() => {
    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        error: 'Geolocation is not supported',
      }));
      return;
    }

    console.log('📍 Requesting device GPS position (one-time)...');

    const options: PositionOptions = {
      enableHighAccuracy: config.highAccuracy ?? true,
      timeout: config.timeout ?? 10000,
      maximumAge: config.maximumAge ?? 0,
    };

    navigator.geolocation.getCurrentPosition(
      handleSuccess,
      handleError,
      options
    );
  }, [config.highAccuracy, config.timeout, config.maximumAge, handleSuccess, handleError]);

  // Auto-start/stop based on config
  useEffect(() => {
    if (config.enabled) {
      startTracking();
    } else {
      stopTracking();
    }

    return () => {
      stopTracking();
    };
  }, [config.enabled, startTracking, stopTracking]);

  return {
    ...state,
    startTracking,
    stopTracking,
    requestPosition,
  };
}