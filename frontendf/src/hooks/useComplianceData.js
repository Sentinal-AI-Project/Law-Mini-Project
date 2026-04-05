import { useState, useEffect, useCallback } from 'react';
import { complianceAPI } from '../services/api';

/**
 * Shared hook to fetch and keep global compliance dashboard data consistent
 * across Executive Summary, Risk Dashboard, and Compliance Dashboard.
 */
export const useComplianceData = (refreshInterval = 30000) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    try {
      // Use the single source of truth endpoint
      const dashboardData = await complianceAPI.dashboard();
      setStats({
         dashboard: dashboardData,
         findings: dashboardData.findings || { total: 0, by_severity: [], by_risk_type: [] },
      });
      setError(null);
    } catch (err) {
      console.error('Failed to fetch compliance stats:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    if (refreshInterval > 0) {
      const interval = setInterval(fetchStats, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchStats, refreshInterval]);

  return { stats, loading, error, refetch: fetchStats };
};
