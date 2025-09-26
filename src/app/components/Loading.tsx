// FILE: src/app/import/loading.tsx
export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Main animated circle */}
      <div className="relative">
        {/* Outer glowing circle */}
        <div className="absolute inset-0 animate-ping rounded-full h-32 w-32 border-4 border-blue-200 opacity-75" />
        
        {/* Main spinning circle */}
        <div className="relative animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-r-4 border-l-4 border-t-blue-600 border-b-indigo-600 border-r-purple-600 border-l-pink-600" />
        
        {/* Inner pulsing circle */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full h-16 w-16 bg-gradient-to-r from-blue-400 to-purple-500" />
        
        {/* Center dot */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full h-4 w-4 bg-white" />
      </div>

      {/* Text with animation */}
      <div className="mt-8 text-center">
        <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Searching Books...
        </p>
        <p className="mt-2 text-gray-600 text-lg">Scanning libraries worldwide</p>
        
        {/* Animated dots */}
        <div className="flex justify-center space-x-1 mt-3">
          <div className="animate-bounce h-2 w-2 bg-blue-500 rounded-full" style={{ animationDelay: '0ms' }} />
          <div className="animate-bounce h-2 w-2 bg-indigo-500 rounded-full" style={{ animationDelay: '150ms' }} />
          <div className="animate-bounce h-2 w-2 bg-purple-500 rounded-full" style={{ animationDelay: '300ms' }} />
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-8 w-64 bg-gray-200 rounded-full h-2">
        <div className="animate-pulse bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full w-3/4" />
      </div>

      {/* Floating books animation */}
      <div className="absolute bottom-20 left-1/4 animate-float" style={{ animationDelay: '0s' }}>
        <div className="text-4xl">📚</div>
      </div>
      <div className="absolute bottom-32 right-1/4 animate-float" style={{ animationDelay: '1s' }}>
        <div className="text-4xl">📖</div>
      </div>
      <div className="absolute top-1/3 left-1/5 animate-float" style={{ animationDelay: '2s' }}>
        <div className="text-3xl">🔍</div>
      </div>
    </div>
  )
}