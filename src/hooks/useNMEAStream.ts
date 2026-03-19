import { useState, useEffect, useCallback, useRef } from 'react';
import { parseNMEA, generateSimulatedNMEA, type NMEAData } from '../utils/nmea-parser';
import { useDeviceGPS } from './useDeviceGPS';

export interface NMEAStreamConfig {
  // WebSocket URL for live NMEA stream (e.g., ws://192.168.1.100:2947 for gpsd)
  websocketUrl?: string;
  
  // HTTP polling URL for NMEA data
  httpUrl?: string;
  httpInterval?: number; // milliseconds
  
  // Use device GPS (browser Geolocation API)
  useDeviceGPS?: boolean;
  deviceGPSHighAccuracy?: boolean;
  
  // Simulation mode for testing
  simulate?: boolean;
  simulationInterval?: number; // milliseconds
  
  // Initial position for simulation
  initialPosition?: { lat: number; lng: number };
  initialHeading?: number;
  initialSpeed?: number; // knots
  initialCourse?: number; // degrees
}

export interface NMEAStreamState {
  position: { lat: number; lng: number };
  heading: number;
  speed: number;
  course: number;
  isConnected: boolean;
  isLive: boolean;
  lastUpdate: Date | null;
  error: string | null;
}

export function useNMEAStream(config: NMEAStreamConfig) {
  const [state, setState] = useState<NMEAStreamState>({
    position: config.initialPosition || { lat: 78.2232, lng: 15.6267 },
    heading: config.initialHeading || 42,
    speed: config.initialSpeed || 0,
    course: config.initialCourse || 0,
    isConnected: false,
    isLive: false,
    lastUpdate: null,
    error: null
  });

  const wsRef = useRef<WebSocket | null>(null);
  const intervalRef = useRef<number | null>(null);
  const gpsWatchIdRef = useRef<number | null>(null);
  
  // Simulation state - use ref to track current position/heading in simulation mode
  const simulationStateRef = useRef({
    position: config.initialPosition || { lat: 78.2232, lng: 15.6267 },
    heading: config.initialHeading || 42,
  });

  // Device GPS integration
  const deviceGPS = useDeviceGPS({
    enabled: config.useDeviceGPS || false,
    highAccuracy: config.deviceGPSHighAccuracy ?? true,
  });

  // Sync device GPS data to state
  useEffect(() => {
    if (config.useDeviceGPS && deviceGPS.isTracking) {
      setState(prev => ({
        ...prev,
        position: deviceGPS.position,
        // Only update heading if device provides it (some devices don't have compass)
        heading: deviceGPS.heading !== null ? deviceGPS.heading : prev.heading,
        speed: deviceGPS.speed !== null ? deviceGPS.speed * 1.94384 : prev.speed, // m/s to knots
        // Only update course if device provides heading
        course: deviceGPS.heading !== null ? deviceGPS.heading : prev.course,
        isConnected: true,
        isLive: true,
        lastUpdate: deviceGPS.timestamp,
        error: deviceGPS.error,
      }));
    } else if (config.useDeviceGPS && !deviceGPS.isTracking && deviceGPS.error) {
      // Update error state even when not tracking
      setState(prev => ({
        ...prev,
        error: deviceGPS.error,
        isConnected: false,
        isLive: false,
      }));
    }
  }, [config.useDeviceGPS, deviceGPS.position, deviceGPS.heading, deviceGPS.speed, deviceGPS.isTracking, deviceGPS.timestamp, deviceGPS.error]);

  // Process incoming NMEA data
  const processNMEAData = useCallback((data: NMEAData) => {
    setState(prev => {
      const newState = {
        ...prev,
        position: data.position ? { lat: data.position.lat, lng: data.position.lng } : prev.position,
        heading: data.heading?.heading ?? prev.heading,
        speed: data.speed?.sog ?? prev.speed,
        course: data.speed?.cog ?? prev.course,
        lastUpdate: new Date(),
        isLive: true
      };
      
      // Update simulation state ref for continuous movement
      if (data.position) {
        simulationStateRef.current.position = { lat: data.position.lat, lng: data.position.lng };
      }
      if (data.heading) {
        simulationStateRef.current.heading = data.heading.heading;
      }
      
      return newState;
    });
  }, []);

  // Connect to WebSocket
  const connectWebSocket = useCallback((url: string) => {
    try {
      console.log('🔌 Connecting to NMEA WebSocket:', url);
      const ws = new WebSocket(url);
      
      ws.onopen = () => {
        console.log('✅ NMEA WebSocket connected');
        setState(prev => ({ ...prev, isConnected: true, error: null }));
      };
      
      ws.onmessage = (event) => {
        const sentences = event.data.split('\n');
        sentences.forEach((sentence: string) => {
          const data = parseNMEA(sentence.trim());
          if (data) processNMEAData(data);
        });
      };
      
      ws.onerror = (error) => {
        console.error('❌ NMEA WebSocket error:', error);
        setState(prev => ({ ...prev, error: 'WebSocket connection failed', isConnected: false }));
      };
      
      ws.onclose = () => {
        console.log('🔌 NMEA WebSocket disconnected');
        setState(prev => ({ ...prev, isConnected: false, isLive: false }));
      };
      
      wsRef.current = ws;
    } catch (err) {
      setState(prev => ({ ...prev, error: 'Failed to create WebSocket', isConnected: false }));
    }
  }, [processNMEAData]);

  // Start HTTP polling
  const startHTTPPolling = useCallback((url: string, interval: number) => {
    console.log('🔄 Starting NMEA HTTP polling:', url);
    
    const poll = async () => {
      try {
        const response = await fetch(url);
        const text = await response.text();
        const sentences = text.split('\n');
        
        sentences.forEach((sentence: string) => {
          const data = parseNMEA(sentence.trim());
          if (data) processNMEAData(data);
        });
        
        setState(prev => ({ ...prev, isConnected: true, error: null }));
      } catch (err) {
        console.error('❌ NMEA HTTP polling error:', err);
        setState(prev => ({ ...prev, error: 'HTTP polling failed', isConnected: false }));
      }
    };
    
    // Initial poll
    poll();
    
    // Set up interval
    intervalRef.current = window.setInterval(poll, interval);
  }, [processNMEAData]);

  // Start simulation
  const startSimulation = useCallback((interval: number) => {
    console.log('🎮 Starting NMEA simulation mode');
    
    setState(prev => ({ ...prev, isConnected: true, isLive: true, error: null }));
    
    intervalRef.current = window.setInterval(() => {
      const sentences = generateSimulatedNMEA(
        simulationStateRef.current.position, 
        simulationStateRef.current.heading,
        config.initialSpeed || 8.5,
        config.initialCourse || simulationStateRef.current.heading
      );
      sentences.forEach(sentence => {
        const data = parseNMEA(sentence);
        if (data) processNMEAData(data);
      });
    }, interval);
  }, [processNMEAData, config.initialSpeed, config.initialCourse]);

  // Initialize connection based on config
  useEffect(() => {
    // Only initialize one source at a time
    if (config.useDeviceGPS) {
      // Device GPS is handled by useDeviceGPS hook
      console.log('📱 Using Device GPS source');
    } else if (config.websocketUrl) {
      connectWebSocket(config.websocketUrl);
    } else if (config.httpUrl) {
      startHTTPPolling(config.httpUrl, config.httpInterval || 1000);
    } else if (config.simulate) {
      startSimulation(config.simulationInterval || 1000);
    } else {
      // No source configured - static mode
      console.log('⚓ Static mode - vessel position fixed');
      setState(prev => ({ ...prev, isConnected: false, isLive: false }));
    }

    // Cleanup
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [config.websocketUrl, config.httpUrl, config.simulate, config.useDeviceGPS, config.simulationInterval, connectWebSocket, startHTTPPolling, startSimulation]);

  // Disconnect function
  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setState(prev => ({ ...prev, isConnected: false, isLive: false }));
  }, []);

  return {
    ...state,
    disconnect
  };
}