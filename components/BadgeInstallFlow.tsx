'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface BadgeInstallProps {
  unitId: string;
  baseUrl?: string;
}

export function BadgeInstallFlow({ unitId, baseUrl = window.location.origin }: BadgeInstallProps) {
  const [copied, setCopied] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pollCount, setPollCount] = useState(0);

  // Generate badge snippet for the unit
  const badgeSnippet = `<script src="${baseUrl}/api/badge.js?id=${unitId}" async></script>
<div id="fairvia-trust-badge" data-unit="${unitId}"></div>`;

  // Copy badge snippet to clipboard
  const copySnippet = () => {
    navigator.clipboard.writeText(badgeSnippet).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    });
  };

  // Verify badge installation
  const verifyBadge = async () => {
    try {
      setVerifying(true);
      setError(null);
      
      const response = await fetch(`/api/internal/badge-ping?unitId=${unitId}`);
      
      if (!response.ok) {
        throw new Error("Could not verify badge installation");
      }
      
      const data = await response.json();
      
      if (data.installed) {
        setVerified(true);
      } else {
        setError("Badge not detected yet. Please make sure it is installed correctly.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setVerifying(false);
    }
  };

  // Auto-detect installation
  useEffect(() => {
    if (verified || pollCount >= 10) return;
    
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/internal/badge-ping?unitId=${unitId}&poll=true`);
        
        if (response.ok) {
          const data = await response.json();
          if (data.installed) {
            setVerified(true);
            clearInterval(pollInterval);
          }
        }
        
        setPollCount(prev => prev + 1);
        
        if (pollCount >= 9) {
          clearInterval(pollInterval);
        }
      } catch (error) {
        console.error('Auto-detect error:', error);
      }
    }, 3000);
    
    return () => clearInterval(pollInterval);
  }, [unitId, verified, pollCount]);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <span aria-hidden="true">🏆</span>
            <span>Trust Badge Installation</span>
          </CardTitle>
          {verified && (
            <Badge className="bg-green-100 text-green-800">
              <span aria-hidden="true">✓</span> Verified
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded border border-red-200" role="alert">
            {error}
          </div>
        )}
        
        <div className="mb-4">
          <label htmlFor="badge-snippet" className="block text-sm font-medium text-gray-700 mb-1">
            Copy this code to your website:
          </label>
          <div className="relative">
            <pre
              id="badge-snippet"
              className="p-3 bg-gray-50 rounded border border-gray-200 text-sm overflow-x-auto"
              tabIndex={0}
            >{badgeSnippet}</pre>
            <button
              onClick={copySnippet}
              aria-label="Copy badge code to clipboard"
              className="absolute right-2 top-2 bg-gray-100 hover:bg-gray-200 text-gray-800 p-1 rounded text-sm"
            >
              {copied ? 'Copied ✓' : 'Copy'}
            </button>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex gap-3 items-center">
            <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-800 font-medium">1</div>
            <p>Copy the code above and paste it into your website's HTML</p>
          </div>
          
          <div className="flex gap-3 items-center">
            <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-800 font-medium">2</div>
            <p>Add it before the closing <code>&lt;/body&gt;</code> tag</p>
          </div>
          
          <div className="flex gap-3 items-center">
            <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-800 font-medium">3</div>
            <p>Publish your site with the new code</p>
          </div>
        </div>
        
        <div className="mt-6 flex gap-4">
          <button
            onClick={verifyBadge}
            disabled={!!verified || verifying}
            className="px-4 py-3 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed h-[44px]"
            aria-label="Verify badge installation"
          >
            {verifying ? 'Verifying...' : verified ? 'Verified ✓' : 'Verify Installation'}
          </button>
          
          {!!verified && (
            <a
              href="/dashboard"
              className="px-4 py-3 bg-green-600 text-white rounded font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 h-[44px] inline-flex items-center"
            >
              Go to Dashboard →
            </a>
          )}
        </div>
        
        {!!verified && (
          <div className="mt-4 text-sm text-gray-600">
            <p>🔒 Installation confirmed. Your badge is now active and collecting signals securely.</p>
          </div>
        )}
        
        {(!verified && pollCount > 0) && (
          <div className="mt-4 text-sm text-gray-600">
            <p>👀 Waiting for badge signals... ({pollCount}/10)</p>
          </div>
        )}
        
        <div className="mt-6 text-xs text-gray-500 border-t pt-4">
          <p>Data collected by this badge is stored securely with field-level access control</p>
        </div>
      </CardContent>
    </Card>
  );
}