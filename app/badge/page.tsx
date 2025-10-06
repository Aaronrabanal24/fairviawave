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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4 sm:p-8">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-6 sm:p-8 text-center">
        {/* Trust Badge */}
        <div className="mb-6">
          <div 
            className="w-24 h-24 mx-auto bg-green-500 rounded-full flex items-center justify-center text-white text-3xl font-bold mb-4"
            role="img"
            aria-label="Verified property badge"
          >
            ✓
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Verified Property
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            This property is verified through Fairvia&apos;s trust and compliance network
          </p>
        </div>

        {/* Property Info */}
        <section className="bg-gray-50 rounded-lg p-4 mb-6" aria-labelledby="property-heading">
          <h2 id="property-heading" className="font-semibold text-gray-900 mb-2">Demo Unit 001</h2>
          <div className="text-sm text-gray-600 space-y-1">
            <div><span aria-hidden="true">📍</span> <span className="sr-only">Location:</span>123 Example Street, Demo City</div>
            <div><span aria-hidden="true">🏠</span> <span className="sr-only">Details:</span>2 bed • 1 bath • 850 sq ft</div>
            <div><span aria-hidden="true">💰</span> <span className="sr-only">Rent:</span>$1,200/month</div>
          </div>
        </section>

        {/* Actions */}
        <nav className="space-y-3" aria-label="Property actions">
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
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors min-h-[44px]"
            aria-label="Start precheck process"
          >
            <span aria-hidden="true">📝 </span>Start Precheck
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
            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 transition-colors min-h-[44px]"
            aria-label="Request a property tour"
          >
            <span aria-hidden="true">🏠 </span>Request Tour
          </button>

          <button 
            onClick={() => window.open('/timeline', '_blank')}
            className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600 transition-colors min-h-[44px]"
            aria-label="View property timeline"
          >
            <span aria-hidden="true">📋 </span>View Timeline
          </button>
        </nav>

        {/* Trust Indicators */}
        <aside className="mt-6 pt-6 border-t border-gray-200" aria-label="Trust indicators">
          <ul className="text-xs text-gray-500 space-y-1 list-none">
            <li><span aria-hidden="true">✅ </span>Compliance verified</li>
            <li><span aria-hidden="true">🔒 </span>Data protected</li>
            <li><span aria-hidden="true">⚡ </span>Signals tracked</li>
          </ul>
        </aside>
      </div>
    </div>
  );
}