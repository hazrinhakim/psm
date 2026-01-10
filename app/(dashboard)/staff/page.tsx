import Link from 'next/link'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

const shortcuts = [
  {
    title: 'View Assets',
    description: 'Browse inventory and verify asset details.',
    href: '/staff/assets',
  },
  {
    title: 'Scan QR',
    description: 'Retrieve asset details using a QR code.',
    href: '/staff/scan',
  },
  {
    title: 'Maintenance Request',
    description: 'Report issues and track service status.',
    href: '/staff/maintenance',
  },
  {
    title: 'Notifications',
    description: 'See updates on maintenance and reminders.',
    href: '/staff/notifications',
  },
  {
    title: 'Feedback',
    description: 'Share suggestions with the asset team.',
    href: '/staff/feedback',
  },
]

export default function StaffDashboard() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Staff Dashboard
        </h1>
        <p className="text-sm text-muted-foreground">
          Access assets, requests, and updates in one place.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {shortcuts.map(item => (
          <Link key={item.title} href={item.href}>
            <Card className="h-full transition hover:border-foreground/40">
              <CardHeader className="space-y-1">
                <CardTitle className="text-base">
                  {item.title}
                </CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Open module
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
