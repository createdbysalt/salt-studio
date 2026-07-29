import {AddIcon, DragHandleIcon, EditIcon, EyeOpenIcon, TrashIcon} from '@sanity/icons'
import {Box, Button, Card, Flex, Grid, Stack, Text} from '@sanity/ui'
import {ComponentType} from 'react'

/**
 * Advanced Page Builder
 *
 * A visual page building interface that shows what's possible with Sanity Studio.
 * This is a demonstration of custom tool capabilities.
 */

// Component library for the page builder
const COMPONENT_LIBRARY = [
  {
    id: 'hero',
    name: 'Hero Section',
    description: 'Large banner with headline and CTA',
    icon: '🎯',
    color: '#F5A3C7',
  },
  {
    id: 'text',
    name: 'Text Block',
    description: 'Rich text content section',
    icon: '📝',
    color: '#3B3BD9',
  },
  {
    id: 'image',
    name: 'Image Gallery',
    description: 'Grid or carousel of images',
    icon: '🖼️',
    color: '#2D8A4E',
  },
  {
    id: 'testimonials',
    name: 'Testimonials',
    description: 'Client quotes and reviews',
    icon: '💬',
    color: '#D97706',
  },
  {
    id: 'faq',
    name: 'FAQ Section',
    description: 'Frequently asked questions',
    icon: '❓',
    color: '#E86A5C',
  },
  {
    id: 'cta',
    name: 'Call to Action',
    description: 'Conversion-focused section',
    icon: '🚀',
    color: '#F5A3C7',
  },
  {
    id: 'logos',
    name: 'Logo Carousel',
    description: 'Partner or client logos',
    icon: '🏢',
    color: '#3B3BD9',
  },
  {
    id: 'contact',
    name: 'Contact Form',
    description: 'Lead capture form',
    icon: '✉️',
    color: '#2D8A4E',
  },
]

/**
 * Page Builder Component
 *
 * This demonstrates a visual drag-and-drop style interface.
 * In a real implementation, this would integrate with Sanity's document editing.
 */
export function PageBuilderTool() {
  return (
    <Box style={{background: '#F5F0E8', minHeight: '100vh'}}>
      {/* Header */}
      <Box
        padding={4}
        style={{
          background: '#0A0A0A',
          borderBottom: '1px solid #262625',
        }}
      >
        <Flex justify="space-between" align="center">
          <Stack space={2}>
            <Text
              style={{
                color: '#F5F0E8',
                fontFamily: 'ui-serif, Georgia, serif',
                fontSize: '24px',
                letterSpacing: '-0.02em',
              }}
            >
              Page Builder
            </Text>
            <Text size={1} style={{color: '#737370'}}>
              Visual content composition tool
            </Text>
          </Stack>
          <Flex gap={2}>
            <Button icon={EyeOpenIcon} text="Preview" mode="ghost" style={{color: '#F5F0E8'}} />
            <Button
              icon={EditIcon}
              text="Publish"
              tone="primary"
              style={{background: '#F5A3C7', color: '#0A0A0A'}}
            />
          </Flex>
        </Flex>
      </Box>

      <Grid columns={[1, 1, 2]} style={{height: 'calc(100vh - 80px)'}}>
        {/* Component Library */}
        <Box
          padding={4}
          style={{
            background: '#0A0A0A',
            borderRight: '1px solid #262625',
            overflowY: 'auto',
          }}
        >
          <Stack space={4}>
            <Flex justify="space-between" align="center">
              <Text
                size={1}
                style={{
                  color: '#F5F0E8',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                }}
              >
                Components
              </Text>
              <Text size={0} style={{color: '#52524F'}}>
                Drag to add
              </Text>
            </Flex>

            <Grid columns={2} gap={3}>
              {COMPONENT_LIBRARY.map((component) => (
                <ComponentCard key={component.id} component={component} />
              ))}
            </Grid>
          </Stack>
        </Box>

        {/* Canvas */}
        <Box padding={5} style={{overflowY: 'auto'}}>
          <Stack space={4}>
            <Flex justify="space-between" align="center">
              <Text
                size={1}
                style={{
                  color: '#0A0A0A',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                }}
              >
                Page Canvas
              </Text>
              <Text size={0} style={{color: '#52524F'}}>
                Drop components here
              </Text>
            </Flex>

            {/* Example placed components */}
            <Stack space={3}>
              <PlacedComponent
                name="Hero Section"
                icon="🎯"
                color="#F5A3C7"
                fields={['Headline', 'Subheadline', 'CTA Button', 'Background Image']}
              />
              <PlacedComponent
                name="Text Block"
                icon="📝"
                color="#3B3BD9"
                fields={['Title', 'Body Content']}
              />
              <PlacedComponent
                name="Testimonials"
                icon="💬"
                color="#D97706"
                fields={['Section Title', '3 Testimonials']}
              />
            </Stack>

            {/* Drop Zone */}
            <Card
              padding={5}
              radius={0}
              style={{
                border: '2px dashed #D4D4CF',
                background: 'transparent',
              }}
            >
              <Flex justify="center" align="center" direction="column" gap={3}>
                <Box
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    background: '#E5E5E0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <AddIcon style={{fontSize: 24, color: '#737370'}} />
                </Box>
                <Text size={1} style={{color: '#737370'}}>
                  Drag a component here to add it to your page
                </Text>
              </Flex>
            </Card>
          </Stack>
        </Box>
      </Grid>
    </Box>
  )
}

function ComponentCard({component}: {component: (typeof COMPONENT_LIBRARY)[0]}) {
  return (
    <Card
      padding={3}
      radius={0}
      style={{
        background: '#171716',
        border: '1px solid #262625',
        cursor: 'grab',
        transition: 'all 0.2s ease',
      }}
      // @ts-ignore
      onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
        e.currentTarget.style.borderColor = component.color
        e.currentTarget.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
        e.currentTarget.style.borderColor = '#262625'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      <Stack space={2}>
        <Flex justify="space-between" align="center">
          <Text style={{fontSize: '24px'}}>{component.icon}</Text>
          <Box
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: component.color,
            }}
          />
        </Flex>
        <Text size={1} weight="medium" style={{color: '#F5F0E8'}}>
          {component.name}
        </Text>
        <Text size={0} style={{color: '#52524F'}}>
          {component.description}
        </Text>
      </Stack>
    </Card>
  )
}

function PlacedComponent({
  name,
  icon,
  color,
  fields,
}: {
  name: string
  icon: string
  color: string
  fields: string[]
}) {
  return (
    <Card
      padding={0}
      radius={0}
      style={{
        background: '#FFFFFF',
        border: '1px solid #E5E5E0',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Flex
        padding={3}
        justify="space-between"
        align="center"
        style={{
          background: '#FAFAF9',
          borderBottom: '1px solid #E5E5E0',
        }}
      >
        <Flex align="center" gap={2}>
          <DragHandleIcon style={{color: '#A8A8A3', cursor: 'grab'}} />
          <Text style={{fontSize: '16px'}}>{icon}</Text>
          <Text size={1} weight="medium" style={{color: '#0A0A0A'}}>
            {name}
          </Text>
        </Flex>
        <Flex gap={1}>
          <Button icon={EditIcon} mode="bleed" padding={2} style={{color: '#737370'}} />
          <Button icon={TrashIcon} mode="bleed" padding={2} style={{color: '#DC2626'}} />
        </Flex>
      </Flex>

      {/* Field Preview */}
      <Box padding={3}>
        <Flex gap={2} wrap="wrap">
          {fields.map((field) => (
            <Box
              key={field}
              padding={2}
              style={{
                background: '#F5F0E8',
                borderLeft: `3px solid ${color}`,
              }}
            >
              <Text size={0} style={{color: '#52524F'}}>
                {field}
              </Text>
            </Box>
          ))}
        </Flex>
      </Box>
    </Card>
  )
}

/**
 * Export as a Sanity Tool
 */
export const pageBuilderTool = () => ({
  name: 'page-builder',
  title: 'Page Builder',
  icon: () => <span style={{fontSize: '18px'}}>🏗️</span>,
  component: PageBuilderTool,
})
