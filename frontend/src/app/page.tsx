'use client';

import { useState, useEffect } from 'react';
import EmissionsChart from '@/components/EmissionsChart';

interface QuarterlyDeviation {
  vesselId: string;
  vesselName: string;
  quarter: string;
  year: number;
  actualEmissions: number;
  baseline: number;
  deviation: number;
  date: string;
}

interface Vessel {
  id: number;
  name: string;
  imoNo: string;
  vesselType: number;
  dwt?: number;
  _count: {
    emissions: number;
  };
}

export default function Home() {
  const [deviations, setDeviations] = useState<QuarterlyDeviation[]>([]);
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [deviationsRes, vesselsRes] = await Promise.all([
        fetch(`${apiUrl}/api/emissions/deviations`),
        fetch(`${apiUrl}/api/emissions/vessels`)
      ]);

      if (!deviationsRes.ok || !vesselsRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const deviationsData = await deviationsRes.json();
      const vesselsData = await vesselsRes.json();

      setDeviations(deviationsData);
      setVessels(vesselsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleImportData = async () => {
    try {
      setImporting(true);
      setError(null);

      const response = await fetch(`${apiUrl}/api/emissions/import`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to import data');
      }

      await response.json();

      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed');
    } finally {
      setImporting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-14 h-14 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-slate-600 font-medium">Loading vessel data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white py-6">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold mb-1">Vessel Emissions Monitor</h1>
              <p className="text-blue-100 text-sm">Poseidon Principles Compliance Dashboard</p>
            </div>
            <button
              onClick={handleImportData}
              disabled={importing}
              className={`px-5 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 ${importing
                  ? 'bg-white/20 text-white/60 cursor-not-allowed'
                  : 'bg-white text-blue-700 hover:bg-blue-50 shadow-sm hover:shadow-md'
                }`}
            >
              {importing ? 'Syncing...' : 'Sync Data'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded-r-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <span className="inline-block w-5 h-5 bg-red-100 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-red-600 text-xs font-bold">!</span>
                </span>
              </div>
              <div className="ml-3">
                <h4 className="text-red-800 font-semibold text-sm">Error occurred</h4>
                <p className="text-red-700 text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200/60">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
              </div>
              <span className="text-xs text-gray-500 font-medium">FLEET</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">{vessels.length}</div>
            <div className="text-sm text-gray-600">Active Vessels</div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200/60">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-xs text-gray-500 font-medium">REPORTS</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">{deviations.length}</div>
            <div className="text-sm text-gray-600">Quarterly Reports</div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200/60 md:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <span className="text-xs text-gray-500 font-medium">DEVIATION</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {deviations.length > 0
                ? `${(deviations.reduce((sum, d) => sum + d.deviation, 0) / deviations.length).toFixed(1)}%`
                : '—'
              }
            </div>
            <div className="text-sm text-gray-600">Average Deviation</div>
          </div>
        </div>

        {/* Main Content */}
        {deviations.length > 0 ? (
          <div className="space-y-8">
            <EmissionsChart data={deviations} />
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200/60 p-12 text-center">
            <div className="w-20 h-20 mx-auto bg-gray-100 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No emissions data found</h3>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto leading-relaxed">
              Get started by importing your vessel emissions data to see compliance analytics and deviation trends.
            </p>
            <button
              onClick={handleImportData}
              disabled={importing}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${importing
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md'
                }`}
            >
              {importing ? 'Importing...' : 'Import Data'}
            </button>
          </div>
        )}

        {/* Vessel Table */}
        {vessels.length > 0 && (
          <div className="mt-8 bg-white rounded-xl border border-gray-200/60 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="font-semibold text-gray-900">Fleet Overview</h3>
              <p className="text-sm text-gray-600 mt-0.5">All registered vessels and their emission records</p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50/30">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Vessel Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      IMO Number
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      DWT (tons)
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Records
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {vessels.map((vessel, index) => (
                    <tr key={vessel.id} className={`hover:bg-blue-50/30 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/20'}`}>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {vessel.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 font-mono">
                        {vessel.imoNo}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        Type {vessel.vesselType}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {vessel.dwt ? vessel.dwt.toLocaleString() : '—'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {vessel._count.emissions} reports
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}