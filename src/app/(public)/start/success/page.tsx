import Link from "next/link";
import { CheckCircle } from "lucide-react";

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20 text-center">
          <div className="flex justify-center mb-6">
            <CheckCircle className="w-20 h-20 text-green-400" />
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-4">
            Request Submitted!
          </h1>
          
          <p className="text-gray-300 mb-6">
            Thank you for submitting your project request. Our team will review it and get back to you within 24 hours.
          </p>
          
          <div className="space-y-3">
            <Link
              href="/"
              className="block w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
            >
              Return Home
            </Link>
            
            <Link
              href="/login"
              className="block w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 border border-white/20"
            >
              Sign In to Track Status
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
