'use client'

import {BookIcon, EarthGlobeIcon} from '@sanity/icons'
import {Box, Card, Flex, Spinner, Text} from '@sanity/ui'
import {useEffect} from 'react'
import {type Tool} from 'sanity'

/**
 * Custom tools that appear in the Studio toolbar alongside
 * Presentation, Structure, Media.
 *
 * When clicked, opens the page in a new tab.
 */

function createLinkComponent(url: string, label: string) {
  return function LinkComponent() {
    useEffect(() => {
      window.open(url, '_blank', 'noopener,noreferrer')
    }, [])

    return (
      <Card padding={5} sizing="border" style={{minHeight: '100%'}}>
        <Flex align="center" justify="center" direction="column" gap={4}>
          <Spinner muted />
          <Text muted>Opening {label} in new tab...</Text>
          <Box marginTop={2}>
            <Text size={1} muted>
              <a href={url} target="_blank" rel="noopener noreferrer">
                Click here if it didn&apos;t open automatically
              </a>
            </Text>
          </Box>
        </Flex>
      </Card>
    )
  }
}

export function helpTool(): Tool {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:4000'
  return {
    name: 'help',
    title: 'Help',
    icon: BookIcon,
    component: createLinkComponent(`${siteUrl}/docs`, 'Help'),
  }
}

export function viewSiteTool(): Tool {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:4000'
  return {
    name: 'view-site',
    title: 'View Site',
    icon: EarthGlobeIcon,
    component: createLinkComponent(siteUrl, 'Site'),
  }
}
