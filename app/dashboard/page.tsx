import { redirect } from 'next/navigation'
import { getCurrentUserContext } from '@/lib/currentUser'

export default async function DashboardIndexPage() {
  const { user, basePath } = await getCurrentUserContext()

  if (!user) {
    redirect('/login')
  }

  redirect(basePath)
}
