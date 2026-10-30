export default function LoadingSpinner({ size = 'md', text }: { size?: 'sm' | 'md' | 'lg'; text?: string }) {
  const sizeMap = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };

  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] gap-3" role="status" aria-label={text || 'Loading'}>
      <div className={`${sizeMap[size]} border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin`} aria-hidden="true" />
      {text && <p className="text-sm text-gray-500">{text}</p>}
    </div>
  );
}

export function FullPageLoader() {
  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center z-50" role="status">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4" aria-hidden="true" />
        <p className="text-gray-500">Loading StyleGuru...</p>
      </div>
    </div>
  );
}

