import {Card, Stack, Text, Flex, Box, Spinner} from '@sanity/ui'
import {
  DocumentIcon,
  CogIcon,
  ImageIcon,
  EyeOpenIcon,
  HomeIcon,
  HelpCircleIcon,
  EditIcon,
  LaunchIcon,
  ClockIcon,
  CheckmarkCircleIcon,
  DocumentsIcon,
} from '@sanity/icons'
import {DashboardWidget, LayoutConfig} from '@sanity/dashboard'
import {useState, useEffect} from 'react'
import {useClient} from 'sanity'

interface RecentDocument {
  _id: string
  _type: string
  _updatedAt: string
  title?: string
}

interface ContentStats {
  published: number
  drafts: number
}

/**
 * Clean, Minimal Dashboard
 *
 * All white, properly aligned, no visual clutter.
 * Client logo placeholder at top, Salt Studio subtle at bottom (outside content).
 */
function WelcomeWidgetComponent() {
  const projectTitle = process.env.NEXT_PUBLIC_SANITY_PROJECT_TITLE || 'Client Portal'
  const clientName = projectTitle.split(' - ')[0] || projectTitle
  const isStaging = projectTitle.toLowerCase().includes('staging')
  const liveUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:4000'

  const client = useClient({apiVersion: '2025-02-27'})
  const [recentDocs, setRecentDocs] = useState<RecentDocument[]>([])
  const [stats, setStats] = useState<ContentStats>({published: 0, drafts: 0})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch recently edited documents
        const recent = await client.fetch<RecentDocument[]>(`
          *[_type in ["page", "project", "home", "settings"] && !(_id in path("drafts.**"))] | order(_updatedAt desc)[0...5] {
            _id,
            _type,
            _updatedAt,
            title
          }
        `)
        setRecentDocs(recent)

        // Fetch content stats
        const publishedCount = await client.fetch<number>(`count(*[_type in ["page", "project"] && !(_id in path("drafts.**"))])`)
        const draftsCount = await client.fetch<number>(`count(*[_type in ["page", "project"] && _id in path("drafts.**")])`)
        setStats({published: publishedCount, drafts: draftsCount})
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [client])

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  const getDocTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      page: 'Page',
      project: 'Project',
      home: 'Homepage',
      settings: 'Settings',
    }
    return labels[type] || type
  }

  return (
    <Box style={{background: '#F7F7F7', minHeight: '80vh', display: 'flex', flexDirection: 'column'}}>
      {/* Main Content Area - White */}
      <Box
        padding={5}
        style={{
          background: '#FFFFFF',
          flex: 1,
          borderRadius: '0 0 16px 16px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}
      >
        {/* Header with Client Logo */}
        <Flex justify="space-between" align="center" wrap="wrap" gap={4} style={{marginBottom: 40}}>
          <Flex align="center" gap={4}>
            {/* Client Logo Placeholder - Replace with actual logo */}
            <Box
              style={{
                width: 56,
                height: 56,
                borderRadius: 14,
                background: '#000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFF',
                fontSize: 24,
                fontWeight: 700,
              }}
            >
              {clientName.charAt(0)}
            </Box>
            <Box>
              <Text
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  letterSpacing: '-0.02em',
                  color: '#000',
                  lineHeight: 1.2,
                  display: 'block',
                  marginBottom: 10,
                }}
              >
                {clientName}
              </Text>
              <Text size={1} style={{color: '#888', fontSize: 14, display: 'block'}}>
                Content Management
              </Text>
            </Box>
          </Flex>

          <Flex align="center" gap={3}>
            {/* Environment Badge */}
            {isStaging && (
              <Box
                style={{
                  padding: '8px 16px',
                  background: '#FEF3C7',
                  borderRadius: 8,
                }}
              >
                <Text size={1} style={{color: '#92400E', fontWeight: 600}}>
                  Staging
                </Text>
              </Box>
            )}

            {/* Live Site Button */}
            <LiveSiteButton url={liveUrl} />
          </Flex>
        </Flex>

        {/* Stats Row */}
        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 16,
            marginBottom: 32,
          }}
        >
          <StatCard
            icon={<CheckmarkCircleIcon />}
            value={loading ? '...' : stats.published.toString()}
            label="Published"
            color="#22C55E"
          />
          <StatCard
            icon={<EditIcon />}
            value={loading ? '...' : stats.drafts.toString()}
            label="Drafts"
            color="#F59E0B"
          />
          <StatCard
            icon={<DocumentsIcon />}
            value={loading ? '...' : (stats.published + stats.drafts).toString()}
            label="Total Content"
            color="#3B82F6"
          />
        </Box>

        {/* Recently Edited */}
        <Box style={{marginBottom: 32}}>
          <Text
            style={{
              color: '#999',
              marginBottom: 16,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              fontSize: 11,
              fontWeight: 600,
              display: 'block',
            }}
          >
            Recently Edited
          </Text>

          {loading ? (
            <Flex align="center" justify="center" padding={4}>
              <Spinner muted />
            </Flex>
          ) : recentDocs.length === 0 ? (
            <Box
              style={{
                background: '#FAFAFA',
                borderRadius: 12,
                padding: '20px 24px',
                border: '1px solid #F0F0F0',
              }}
            >
              <Text style={{color: '#888', fontSize: 14}}>
                No recent edits yet. Start by editing your homepage or creating a new page.
              </Text>
            </Box>
          ) : (
            <Box
              style={{
                background: '#FAFAFA',
                borderRadius: 12,
                border: '1px solid #F0F0F0',
                overflow: 'hidden',
              }}
            >
              {recentDocs.map((doc, index) => (
                <RecentDocRow
                  key={doc._id}
                  doc={doc}
                  formatTimeAgo={formatTimeAgo}
                  getDocTypeLabel={getDocTypeLabel}
                  isLast={index === recentDocs.length - 1}
                />
              ))}
            </Box>
          )}
        </Box>

        {/* Quick Actions */}
        <Box style={{marginBottom: 32}}>
          <Text
            style={{
              color: '#999',
              marginBottom: 16,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              fontSize: 11,
              fontWeight: 600,
              display: 'block',
            }}
          >
            Quick Actions
          </Text>

          <Box
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 16,
            }}
          >
            <ActionCard
              href="/admin/presentation"
              icon={<EyeOpenIcon />}
              title="Preview"
              subtitle="View your live site"
            />
            <ActionCard
              href="/admin/structure/home"
              icon={<HomeIcon />}
              title="Homepage"
              subtitle="Edit homepage content"
            />
            <ActionCard
              href="/admin/structure/page"
              icon={<DocumentIcon />}
              title="Pages"
              subtitle="Create & edit pages"
            />
            <ActionCard
              href="/admin/media"
              icon={<ImageIcon />}
              title="Media"
              subtitle="Upload images & files"
            />
          </Box>
        </Box>

        {/* Settings & Help */}
        <Box>
          <Text
            style={{
              color: '#999',
              marginBottom: 16,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              fontSize: 11,
              fontWeight: 600,
              display: 'block',
            }}
          >
            Settings & Help
          </Text>

          <Box
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 16,
            }}
          >
            <ActionCard
              href="/admin/structure/settings"
              icon={<CogIcon />}
              title="Site Settings"
              subtitle="Navigation, SEO & more"
            />
            <ActionCard
              href="/admin/structure/project"
              icon={<EditIcon />}
              title="Projects"
              subtitle="Manage portfolio items"
            />
            <ActionCard
              href="mailto:hello@createdbysalt.com"
              icon={<HelpCircleIcon />}
              title="Get Help"
              subtitle="Contact support"
              external
            />
          </Box>
        </Box>
      </Box>

      {/* Footer - Outside the white box */}
      <Flex
        justify="center"
        align="center"
        gap={2}
        style={{
          padding: '24px 0',
        }}
      >
        <Text size={0} style={{color: '#999', fontSize: 11}}>
          powered by
        </Text>
        <Text
          size={0}
          style={{
            color: '#666',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '-0.01em',
          }}
        >
          salt studio
        </Text>
      </Flex>
    </Box>
  )
}

function LiveSiteButton({url}: {url: string}) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <Card
      as="a"
      // @ts-ignore
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      padding={3}
      radius={2}
      style={{
        background: isHovered ? '#000' : '#FAFAFA',
        border: `1px solid ${isHovered ? '#000' : '#E5E5E5'}`,
        textDecoration: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        transition: 'all 0.2s ease',
        cursor: 'pointer',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <LaunchIcon style={{color: isHovered ? '#FFF' : '#666', fontSize: 16}} />
      <Text
        size={1}
        weight="medium"
        style={{
          color: isHovered ? '#FFF' : '#333',
          fontSize: 13,
        }}
      >
        View Live Site
      </Text>
    </Card>
  )
}

function StatCard({
  icon,
  value,
  label,
  color,
}: {
  icon: React.ReactNode
  value: string
  label: string
  color: string
}) {
  return (
    <Box
      style={{
        background: '#FAFAFA',
        borderRadius: 12,
        padding: '20px 24px',
        border: '1px solid #F0F0F0',
      }}
    >
      <Flex align="center" gap={3}>
        <Box
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: `${color}15`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: color,
            fontSize: 18,
          }}
        >
          {icon}
        </Box>
        <Box>
          <Text
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: '#000',
              letterSpacing: '-0.02em',
              display: 'block',
              lineHeight: 1,
              marginBottom: 8,
            }}
          >
            {value}
          </Text>
          <Text
            size={1}
            style={{
              color: '#777',
              fontSize: 13,
              display: 'block',
            }}
          >
            {label}
          </Text>
        </Box>
      </Flex>
    </Box>
  )
}

function RecentDocRow({
  doc,
  formatTimeAgo,
  getDocTypeLabel,
  isLast,
}: {
  doc: RecentDocument
  formatTimeAgo: (date: string) => string
  getDocTypeLabel: (type: string) => string
  isLast: boolean
}) {
  const [isHovered, setIsHovered] = useState(false)

  // Build the edit URL based on document type
  const getEditUrl = () => {
    if (doc._type === 'home' || doc._type === 'settings') {
      return `/admin/structure/${doc._type}`
    }
    return `/admin/structure/${doc._type};${doc._id}`
  }

  return (
    <Card
      as="a"
      // @ts-ignore
      href={getEditUrl()}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 20px',
        background: isHovered ? '#F5F5F5' : 'transparent',
        borderBottom: isLast ? 'none' : '1px solid #F0F0F0',
        textDecoration: 'none',
        transition: 'background 0.15s ease',
        cursor: 'pointer',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Flex align="center" gap={3}>
        <Box
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: '#FFF',
            border: '1px solid #E8E8E8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#666',
            fontSize: 14,
          }}
        >
          <ClockIcon />
        </Box>
        <Box>
          <Text
            size={1}
            weight="medium"
            style={{
              color: '#000',
              fontSize: 14,
              display: 'block',
              marginBottom: 2,
            }}
          >
            {doc.title || 'Untitled'}
          </Text>
          <Text
            size={0}
            style={{
              color: '#888',
              fontSize: 12,
              display: 'block',
            }}
          >
            {getDocTypeLabel(doc._type)}
          </Text>
        </Box>
      </Flex>
      <Text
        size={0}
        style={{
          color: '#999',
          fontSize: 12,
        }}
      >
        {formatTimeAgo(doc._updatedAt)}
      </Text>
    </Card>
  )
}

function ActionCard({
  href,
  icon,
  title,
  subtitle,
  external = false,
}: {
  href: string
  icon: React.ReactNode
  title: string
  subtitle: string
  external?: boolean
}) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <Card
      as="a"
      // @ts-ignore
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      padding={4}
      radius={3}
      style={{
        background: isHovered ? '#F5F5F5' : '#FAFAFA',
        border: `1px solid ${isHovered ? '#E0E0E0' : '#EBEBEB'}`,
        textDecoration: 'none',
        display: 'block',
        transition: 'all 0.2s ease',
        cursor: 'pointer',
        transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: isHovered ? '0 4px 12px rgba(0,0,0,0.08)' : '0 1px 3px rgba(0,0,0,0.02)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Stack space={4}>
        <Box
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: isHovered ? '#000' : '#FFF',
            border: isHovered ? 'none' : '1px solid #E8E8E8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: isHovered ? '#FFF' : '#000',
            fontSize: 20,
            transition: 'all 0.2s ease',
          }}
        >
          {icon}
        </Box>
        <Box>
          <Text
            size={2}
            weight="semibold"
            style={{
              color: '#000',
              letterSpacing: '-0.01em',
              fontSize: 15,
              marginBottom: 10,
              display: 'block',
            }}
          >
            {title}
          </Text>
          <Text
            size={1}
            style={{
              color: '#777',
              fontSize: 13,
              lineHeight: 1.4,
              display: 'block',
            }}
          >
            {subtitle}
          </Text>
        </Box>
      </Stack>
    </Card>
  )
}

export function welcomeWidget(): DashboardWidget {
  return {
    name: 'welcome',
    component: WelcomeWidgetComponent,
    layout: {width: 'full'} as LayoutConfig,
  }
}
