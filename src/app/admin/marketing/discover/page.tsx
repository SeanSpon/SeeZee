'use client';

import { useState } from 'react';
import { Database, Search, Globe, Building2, MapPin, TrendingUp } from 'lucide-react';
import { discoverProspectsAction } from '@/server/actions/outreach';

export default function DiscoverProspectsPage() {
  const [source, setSource] = useState<'google_places' | 'apollo'>('google_places');
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('Louisville, KY');
  const [category, setCategory] = useState('');
  const [maxResults, setMaxResults] = useState(200);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  async function handleDiscover() {
    setLoading(true);
    setResult(null);

    const res = await discoverProspectsAction({
      source,
      query: query || undefined,
      location: location || undefined,
      category: category || undefined,
      maxResults,
    });

    setResult(res);
    setLoading(false);
  }

  return (
    <div className="min-h-screen p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Database className="w-8 h-8 text-cyan-400" />
          Discover Prospects
        </h1>
        <p className="text-slate-400 mt-2">
          Pull hundreds of businesses from external databases
        </p>
      </div>

      {/* Source Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => setSource('google_places')}
          className={`p-6 rounded-xl border-2 transition-all ${
            source === 'google_places'
              ? 'border-cyan-500 bg-cyan-500/10'
              : 'border-slate-700 bg-slate-800 hover:border-slate-600'
          }`}
        >
          <div className="flex items-center gap-3 mb-3">
            <Globe className="w-8 h-8 text-cyan-400" />
            <h3 className="text-xl font-semibold text-white">Google Places</h3>
          </div>
          <p className="text-slate-400 text-sm">
            Find local businesses with ratings, reviews, and contact info. Great for Louisville area nonprofits.
          </p>
          <div className="mt-3 text-cyan-400 text-sm font-medium">
            ✓ Free • ✓ Local Focus • ✓ Verified Data
          </div>
        </button>

        <button
          onClick={() => setSource('apollo')}
          className={`p-6 rounded-xl border-2 transition-all ${
            source === 'apollo'
              ? 'border-purple-500 bg-purple-500/10'
              : 'border-slate-700 bg-slate-800 hover:border-slate-600'
          }`}
        >
          <div className="flex items-center gap-3 mb-3">
            <Building2 className="w-8 h-8 text-purple-400" />
            <h3 className="text-xl font-semibold text-white">Apollo.io</h3>
          </div>
          <p className="text-slate-400 text-sm">
            B2B contact database with decision-makers, emails, and company details. Requires API key.
          </p>
          <div className="mt-3 text-purple-400 text-sm font-medium">
            ✓ B2B Focus • ✓ Contact Emails • ✓ Company Data
          </div>
        </button>
      </div>

      {/* Discovery Form */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-4">
        <h3 className="text-xl font-semibold text-white mb-4">Search Parameters</h3>

        {source === 'google_places' ? (
          <>
            <div>
              <label className="block text-sm text-slate-300 mb-2">
                Search Query (optional)
              </label>
              <input
                type="text"
                placeholder="e.g., 'nonprofit organizations' or leave blank for auto-categories"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
              />
              <p className="text-slate-500 text-xs mt-1">
                Leave blank to search multiple nonprofit categories automatically
              </p>
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-2">
                Location
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Louisville, KY"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-2">
                Category (optional)
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="">All Categories</option>
                <option value="nonprofit_organization">Nonprofit Organizations</option>
                <option value="church">Churches</option>
                <option value="school">Schools</option>
                <option value="hospital">Healthcare</option>
                <option value="museum">Arts & Museums</option>
                <option value="library">Libraries</option>
              </select>
            </div>
          </>
        ) : (
          <>
            <div>
              <label className="block text-sm text-slate-300 mb-2">
                Location/Region
              </label>
              <input
                type="text"
                placeholder="Louisville, Kentucky"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-2">
                Industry
              </label>
              <input
                type="text"
                placeholder="e.g., Nonprofit, Education, Healthcare"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </>
        )}

        <div>
          <label className="block text-sm text-slate-300 mb-2">
            Maximum Results: {maxResults}
          </label>
          <input
            type="range"
            min="50"
            max="500"
            step="50"
            value={maxResults}
            onChange={(e) => setMaxResults(parseInt(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>50</span>
            <span>250</span>
            <span>500</span>
          </div>
        </div>

        <button
          onClick={handleDiscover}
          disabled={loading}
          className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Discovering Prospects...
            </>
          ) : (
            <>
              <Search className="w-5 h-5" />
              Start Discovery
            </>
          )}
        </button>
      </div>

      {/* Results */}
      {result && (
        <div className={`p-6 rounded-xl border ${
          result.success
            ? 'bg-green-500/10 border-green-500/30'
            : 'bg-red-500/10 border-red-500/30'
        }`}>
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-lg ${
              result.success ? 'bg-green-500/20' : 'bg-red-500/20'
            }`}>
              <TrendingUp className={`w-6 h-6 ${
                result.success ? 'text-green-400' : 'text-red-400'
              }`} />
            </div>
            <div className="flex-1">
              <h3 className={`text-xl font-semibold mb-2 ${
                result.success ? 'text-green-400' : 'text-red-400'
              }`}>
                {result.success ? 'Discovery Complete!' : 'Discovery Failed'}
              </h3>
              {result.success ? (
                <div className="space-y-2 text-white">
                  <p className="text-lg">
                    <strong>{result.imported}</strong> new prospects imported
                  </p>
                  <p className="text-slate-300">
                    Found: {result.discovered} total • Skipped: {result.skipped} duplicates
                  </p>
                  {result.errors && result.errors.length > 0 && (
                    <details className="mt-3">
                      <summary className="text-yellow-400 cursor-pointer hover:text-yellow-300">
                        {result.errors.length} errors occurred
                      </summary>
                      <div className="mt-2 p-3 bg-slate-900 rounded text-sm text-slate-400 max-h-40 overflow-y-auto">
                        {result.errors.map((err: string, i: number) => (
                          <div key={i}>{err}</div>
                        ))}
                      </div>
                    </details>
                  )}
                  <div className="mt-4 pt-4 border-t border-slate-700">
                    <a
                      href="/admin/marketing/prospects"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
                    >
                      View Prospects →
                    </a>
                  </div>
                </div>
              ) : (
                <p className="text-red-300">{result.error || 'An unknown error occurred'}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-slate-800 border border-slate-700 rounded-lg">
          <h4 className="text-white font-semibold mb-2">🔍 Smart Discovery</h4>
          <p className="text-slate-400 text-sm">
            Automatically searches multiple categories to maximize results
          </p>
        </div>
        <div className="p-4 bg-slate-800 border border-slate-700 rounded-lg">
          <h4 className="text-white font-semibold mb-2">🚫 Duplicate Detection</h4>
          <p className="text-slate-400 text-sm">
            Skips prospects already in your database
          </p>
        </div>
        <div className="p-4 bg-slate-800 border border-slate-700 rounded-lg">
          <h4 className="text-white font-semibold mb-2">📊 Auto Scoring</h4>
          <p className="text-slate-400 text-sm">
            AI analyzes and scores each prospect automatically
          </p>
        </div>
      </div>

      {/* Setup Instructions */}
      <div className="p-6 bg-amber-500/10 border border-amber-500/30 rounded-xl">
        <h3 className="text-lg font-semibold text-amber-400 mb-3">API Keys Required</h3>
        <div className="space-y-2 text-slate-300 text-sm">
          <p>
            <strong>Google Places:</strong> Set <code className="px-2 py-1 bg-slate-900 rounded">GOOGLE_PLACES_API_KEY</code> in your environment variables
          </p>
          <p>
            <strong>Apollo.io:</strong> Set <code className="px-2 py-1 bg-slate-900 rounded">APOLLO_API_KEY</code> (requires paid plan)
          </p>
          <p>
            <strong>Hunter.io:</strong> Set <code className="px-2 py-1 bg-slate-900 rounded">HUNTER_API_KEY</code> for email finding
          </p>
        </div>
      </div>
    </div>
  );
}
