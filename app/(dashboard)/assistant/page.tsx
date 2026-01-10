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
    title: 'Assets',
    description: 'Register and update asset records.',
    href: '/assistant/assets',
  },
  {
    title: 'Maintenance',
    description: 'Review and update maintenance requests.',
    href: '/assistant/maintenance',
  },
  {
    title: 'QR Codes',
    description: 'Generate QR codes for assets.',
    href: '/assistant/qr',
  },
  {
    title: 'Reports',
    description: 'View asset distribution and maintenance history.',
    href: '/assistant/reports',
  },
  {
    title: 'Feedback',
    description: 'Send feedback to the asset team.',
    href: '/assistant/feedback',
  },
]

export default function AssistantDashboard() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Admin Assistant Dashboard
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage assets, maintenance, and reporting workflows.
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
