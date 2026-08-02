export default function OfficialAppLoading() {
  return (
    <div className="min-h-screen animate-pulse bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="h-5 w-24 rounded bg-gray-200" />
        <div className="flex gap-5 rounded-2xl border border-gray-100 bg-white p-6">
          <div className="h-20 w-20 shrink-0 rounded-2xl bg-gray-200" />
          <div className="flex-1 space-y-3">
            <div className="h-7 w-2/3 rounded bg-gray-200" />
            <div className="h-4 w-full rounded bg-gray-100" />
            <div className="h-4 w-4/5 rounded bg-gray-100" />
          </div>
        </div>
        <div className="h-12 rounded-lg bg-gray-200" />
        <div className="h-80 rounded-2xl border border-gray-100 bg-white" />
      </div>
    </div>
  );
}
