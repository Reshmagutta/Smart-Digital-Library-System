import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';

export default function PageNotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="text-center space-y-8 px-4">
        {/* 404 Icon */}
        <div className="flex justify-center">
          <div className="text-8xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
            404
          </div>
        </div>

        {/* Message */}
        <div className="space-y-3">
          <h1 className="text-4xl font-bold text-slate-900">Page Not Found</h1>
          <p className="text-lg text-slate-600 max-w-md mx-auto">
            Sorry, the page you're looking for doesn't exist. It might have been removed or the URL might be incorrect.
          </p>
        </div>

        {/* Action Button */}
        <Link to="/">
          <Button className="gap-2 px-6 py-3 text-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
            <Home className="w-5 h-5" />
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
