import {Box, Card, Flex, Stack, Text} from '@sanity/ui'
import type {ReactNode} from 'react'

/**
 * Custom Studio Logo
 *
 * Shows CLIENT branding at top. Placeholder logo mark + client name.
 * Salt Studio appears subtly in footer via layout.
 */
export function StudioLogo() {
  // Client name from environment
  const projectTitle = process.env.NEXT_PUBLIC_SANITY_PROJECT_TITLE || 'Client Portal'
  const clientName = projectTitle.split(' - ')[0] || projectTitle

  return (
    <Flex align="center" gap={3}>
      {/* Client logo placeholder - rounded square */}
      <Box
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: 'linear-gradient(135deg, #000 0%, #333 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#FFF',
          fontWeight: 700,
          fontSize: 16,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}
      >
        {clientName.charAt(0).toUpperCase()}
      </Box>
      {/* Client name */}
      <Text
        size={2}
        weight="bold"
        style={{
          letterSpacing: '-0.02em',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}
      >
        {clientName}
      </Text>
    </Flex>
  )
}

/**
 * Salt Studio Footer Branding
 *
 * Subtle "powered by salt studio" at the bottom.
 */
export function SaltStudioBadge() {
  return (
    <Flex
      align="center"
      justify="center"
      gap={2}
      padding={3}
      style={{
        borderTop: '1px solid #E5E5E5',
        background: '#FAFAFA',
      }}
    >
      <Text
        size={0}
        style={{
          color: '#A3A3A3',
          fontSize: '11px',
          letterSpacing: '0.02em',
        }}
      >
        powered by
      </Text>
      <Text
        size={0}
        weight="bold"
        style={{
          color: '#000',
          fontSize: '11px',
          fontWeight: 800,
          letterSpacing: '-0.02em',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}
      >
        salt studio
      </Text>
    </Flex>
  )
}

/**
 * Custom Navbar Actions
 *
 * Adds a "Powered by Salt Studio" badge and help link.
 */
export function StudioNavbar(props: {renderDefault: (props: unknown) => ReactNode}) {
  return <Stack>{props.renderDefault(props)}</Stack>
}

/**
 * Custom Tool Menu
 *
 * Wraps the default tool menu with Salt Studio branding.
 */
export function StudioToolMenu(props: {renderDefault: (props: unknown) => ReactNode}) {
  return <>{props.renderDefault(props)}</>
}

/**
 * Footer badge shown at bottom of Studio
 */
export function StudioFooter() {
  return (
    <Card
      padding={2}
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'var(--card-bg-color)',
        borderTop: '1px solid var(--card-border-color)',
        zIndex: 100,
      }}
    >
      <Flex justify="center" align="center" gap={2}>
        <Text size={0} muted>
          Powered by
        </Text>
        <Text size={0} weight="semibold" style={{color: '#3B82F6'}}>
          Salt Studio
        </Text>
      </Flex>
    </Card>
  )
}
