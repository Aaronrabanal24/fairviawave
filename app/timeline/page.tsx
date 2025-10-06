export default function TimelinePage() {
  const events = [
    { id: 1, type: 'Unit Published', time: '2024-10-01 09:00', icon: '🏠' },
    { id: 2, type: 'Trust Badge Installed', time: '2024-10-01 09:15', icon: '✅' },
    { id: 3, type: 'First Trust View', time: '2024-10-01 10:30', icon: '👀' },
    { id: 4, type: 'Precheck Started', time: '2024-10-01 14:20', icon: '📝' },
    { id: 5, type: 'Tour Requested', time: '2024-10-02 11:45', icon: '🏠' },
    { id: 6, type: 'Application Started', time: '2024-10-03 16:10', icon: '📄' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              📋 Public Timeline
            </h1>
            <p className="text-gray-600">
              Transparent activity log for Demo Unit 001
            </p>
          </div>

          <div className="space-y-6">
            {events.map((event, index) => (
              <div key={event.id} className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-xl">
                  {event.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">
                      {event.type}
                    </h3>
                    <time className="text-sm text-gray-500">
                      {event.time}
                    </time>
                  </div>
                  <p className="text-gray-600 text-sm mt-1">
                    {index === 0 && "Unit was published and made available for viewing"}
                    {index === 1 && "Trust badge was installed and verification completed"}
                    {index === 2 && "First visitor viewed the trust badge"}
                    {index === 3 && "Prospective tenant started the precheck process"}
                    {index === 4 && "Tour was requested for this property"}
                    {index === 5 && "Rental application process was initiated"}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-500">
              🔒 This timeline shows public events only. Sensitive information is protected.
            </p>
            <div className="mt-4 space-x-4">
              <button 
                onClick={() => window.open('/badge', '_blank')}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                🏠 View Property
              </button>
              <button 
                onClick={() => window.open('/wave2-demo', '_blank')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                🚀 Demo Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}