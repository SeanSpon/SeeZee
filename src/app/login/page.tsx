'use client';

import { signIn } from 'next-auth/react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useEffect } from 'react';

export default function LoginPage() {
	const { data: session, status } = useSession();
	const router = useRouter();
	const searchParams = useSearchParams();
	const error = searchParams.get('error');
	const callbackUrl = searchParams.get('callbackUrl') || '/dashboard/overview';

	useEffect(() => {
		if (status === 'authenticated') {
			router.push(callbackUrl);
		}
	}, [status, router, callbackUrl]);

	// Log the error for debugging
	if (error) {
		console.log('[LOGIN ERROR]', error);
	}

	const handleGoogleSignIn = async () => {
		try {
			await signIn('google', { 
				callbackUrl,
				redirect: true 
			});
		} catch (error) {
			console.error('[SIGNIN ERROR]', error);
		}
	};

	if (status === 'loading') {
		return (
			<div className="min-h-screen flex items-center justify-center bg-black text-white">
				<div className="text-center">
					<div className="animate-spin h-8 w-8 border-2 border-white/20 border-t-white rounded-full mx-auto mb-4"></div>
					<p>Loading...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-black text-white p-6">
			<div className="w-full max-w-md space-y-6">
				<div className="text-center space-y-2">
					<h1 className="text-3xl font-bold">Sign In</h1>
					<p className="text-white/60 text-sm">Use your Google account to continue</p>
				</div>
				
				{error && (
					<div className="bg-red-500/20 border border-red-500/40 rounded-lg p-3 text-center">
						<p className="text-red-300 text-sm">
							Sign-in error: {error}
						</p>
					</div>
				)}

				<div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
					<button
						onClick={handleGoogleSignIn}
						className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-500 transition-colors px-4 py-3 font-medium"
					>
						<span>Continue with Google</span>
					</button>
					<p className="text-xs text-center text-white/40">By continuing you agree to our terms.</p>
				</div>
				<div className="text-center">
					<Link href="/" className="text-sm text-white/60 hover:text-white transition-colors">Return Home</Link>
				</div>
			</div>
		</div>
	);
}
