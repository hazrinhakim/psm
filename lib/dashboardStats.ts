import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export async function getDashboardStats() {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: async () => (await cookies()).getAll(),
        setAll: () => {},
      },
    }
  )

  const { count: totalAssets } = await supabase
    .from('assets')
    .select('*', { count: 'exact', head: true })

  const { data: byCategory } = await supabase
    .from('assets')
    .select('category_id, asset_categories(name)', { count: 'exact' })

  // simple reduce
  const categoryMap: Record<string, number> = {}
  byCategory?.forEach((row: any) => {
    const name = row.asset_categories?.name ?? 'Unknown'
    categoryMap[name] = (categoryMap[name] || 0) + 1
  })

  return { totalAssets: totalAssets ?? 0, categoryMap }
}
