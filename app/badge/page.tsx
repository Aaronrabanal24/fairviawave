'use client';

// Force dynamic for interactive content
export const dynamic = 'force-dynamic';

export default function BadgePage() {
  const handleTrustView = async () => {
    try {
      await fetch('/api/signals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'view_trust',
          unitId: 'demo-unit',
          meta: { 
            source: 'badge',
            path: '/badge',
            ref: 'trust-badge'
          }
        })
      });
    } catch (error) {
      console.error('Signal failed:', error);
    }
  };

  // Emit signal on page load
  if (typeof window !== 'undefined') {
    setTimeout(handleTrustView, 500);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-8">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* Trust Badge */}
        <div className="mb-6">
          <div className="w-24 h-24 mx-auto bg-green-500 rounded-full flex items-center justify-center text-white text-3xl font-bold mb-4">
            ✓
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Verified Property
          </h1>
          <p className="text-gray-600">
            This property is verified through Fairvia&apos;s trust and compliance network
          </p>
        </div>

        {/* Property Info */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h2 className="font-semibold text-gray-900 mb-2">Demo Unit 001</h2>
          <div className="text-sm text-gray-600 space-y-1">
            <div>📍 123 Example Street, Demo City</div>
            <div>🏠 2 bed • 1 bath • 850 sq ft</div>
            <div>💰 $1,200/month</div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button 
            onClick={() => {
              fetch('/api/signals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  type: 'precheck_start',
                  unitId: 'demo-unit',
                  meta: { source: 'badge', path: '/badge', ref: 'precheck-button' }
                })
              });
              alert('Precheck started! (Signal emitted)');
            }}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            📝 Start Precheck
          </button>
          
          <button 
            onClick={() => {
              fetch('/api/signals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  type: 'tour_request',
                  unitId: 'demo-unit',
                  meta: { source: 'badge', path: '/badge', ref: 'tour-button' }
                })
              });
              alert('Tour requested! (Signal emitted)');
            }}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            🏠 Request Tour
          </button>

          <button 
            onClick={() => window.open('/timeline', '_blank')}
            className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            📋 View Timeline
          </button>
        </div>

        {/* Trust Indicators */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="text-xs text-gray-500 space-y-1">
            <div>✅ Compliance verified</div>
            <div>🔒 Data protected</div>
            <div>⚡ Signals tracked</div>
          </div>
        </div>
      </div>
    </div>
  );
}