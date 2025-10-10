import Link from 'next/link';

export default function SignupPlaceholder() {
	return (
		<div className="min-h-screen flex items-center justify-center bg-black text-white p-6">
			<div className="text-center space-y-4">
				<h1 className="text-3xl font-bold">Account Creation</h1>
				<p className="text-white/60 max-w-sm">We use Google Sign-In for account creation. Use the Sign In button to get started.</p>
				<Link href="/login" className="inline-flex items-center px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 transition-colors">Go to Sign In</Link>
			</div>
		</div>
	);
}
