import { useEffect } from 'react';
import { api } from '@/lib/axios';

/**
 * Custom hook to keep the Render backend active by pinging the health endpoint.
 * This is useful for free-tier hosting that spins down after inactivity.
 * @param interval - Interval in milliseconds (default: 30 seconds)
 */
export function useKeepAlive(interval: number = 30000) {
  useEffect(() => {
    const keepAlive = async () => {
      try {
        await api.get('/health');
        // console.log('Keep-alive ping successful');
      } catch (error) {
        // console.error('Keep-alive ping failed:', error);
      }
    };

    // Initial ping
    keepAlive();

    const timer = setInterval(keepAlive, interval);

    return () => clearInterval(timer);
  }, [interval]);
}
