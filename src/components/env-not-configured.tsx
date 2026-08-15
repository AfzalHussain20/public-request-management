export default function EnvNotConfigured() {
  return (
    <div className="rounded-lg border border-amber-300 bg-amber-50 p-6 text-center">
      <h2 className="mb-2 text-lg font-semibold text-amber-800">
        Setup required / அமைப்பு தேவை
      </h2>
      <p className="text-sm text-amber-700">
        Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY to your .env.local file.
      </p>
      <p className="mt-1 text-sm text-amber-700">
        சுபாபேஸ் கட்டமைக்கப்படவில்லை. .env.local கோப்பில் மேலே உள்ள மதிப்புகளைச் சேர்க்கவும்.
      </p>
    </div>
  )
}
