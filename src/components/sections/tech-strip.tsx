export function TechStrip() {
  return (
    <div className="fixed top-20 w-full z-40 tech-strip py-2">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-center space-x-6 text-sm text-gray-300">
          <span className="flex items-center">
            <svg className="w-4 h-4 mr-1 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7v10c0 5.55 3.84 9.739 9 11 5.16-1.261 9-5.45 9-11V7l-10-5z"/>
            </svg>
            Next.js
          </span>
          <span className="text-gray-500">•</span>
          <span className="flex items-center">
            <svg className="w-4 h-4 mr-1 text-cyan-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12.001 4.8c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624C13.666 10.618 15.027 12 18.001 12c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C16.337 6.182 14.976 4.8 12.001 4.8zm-6 7.2c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624 1.177 1.194 2.538 2.576 5.512 2.576 3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C10.337 13.382 8.976 12 6.001 12z"/>
            </svg>
            Tailwind
          </span>
          <span className="text-gray-500">•</span>
          <span className="flex items-center">
            <svg className="w-4 h-4 mr-1 text-indigo-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M21.8065 8.367L12.0305 2.592L2.1935 8.367V15.633L12.0305 21.408L21.8065 15.633V8.367Z"/>
            </svg>
            Prisma
          </span>
          <span className="text-gray-500">•</span>
          <span className="flex items-center">
            <svg className="w-4 h-4 mr-1 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.5594 13.7547L17.9767 3.2734C17.7444 2.8516 17.2781 2.6406 16.8125 2.7891L1.4063 7.5469C0.9844 7.6797 0.6875 8.0625 0.6875 8.5078V19.5C0.6875 19.9453 0.9844 20.3281 1.4063 20.4609L16.8125 25.2188C17.2781 25.3672 17.7444 25.1563 17.9767 24.7344L23.5594 14.2531C23.8125 13.7891 23.8125 13.2188 23.5594 13.7547Z"/>
            </svg>
            PostgreSQL
          </span>
          <span className="text-gray-500">•</span>
          <span className="flex items-center">
            <svg className="w-4 h-4 mr-1 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 22.525H0l12-21.05 12 21.05z"/>
            </svg>
            Vercel
          </span>
        </div>
      </div>
    </div>
  )
}