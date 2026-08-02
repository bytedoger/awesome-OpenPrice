export default function BlogPostLoading() {
  return (
    <div className="min-h-screen animate-pulse bg-white">
      <div className="border-b border-gray-100 bg-gray-50 px-4 py-10">
        <div className="mx-auto max-w-3xl space-y-4">
          <div className="h-4 w-24 rounded bg-gray-200" />
          <div className="h-8 w-4/5 rounded bg-gray-200" />
          <div className="h-5 w-full rounded bg-gray-200" />
        </div>
      </div>
      <div className="mx-auto mt-8 max-w-3xl space-y-4 px-4">
        <div className="h-64 rounded-lg bg-gray-100" />
        <div className="h-4 w-full rounded bg-gray-100" />
        <div className="h-4 w-11/12 rounded bg-gray-100" />
        <div className="h-4 w-4/5 rounded bg-gray-100" />
      </div>
    </div>
  );
}
