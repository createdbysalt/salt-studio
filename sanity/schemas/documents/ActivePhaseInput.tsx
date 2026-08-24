import {Card, Flex, Radio, Stack, Text} from '@sanity/ui'
import {useEffect, useState} from 'react'
import {set, unset, useClient, useFormValue, type StringInputProps} from 'sanity'

type Phase = {_key: string; name: string}

const PHASES_BY_ID = `*[_id in [$id, "drafts." + $id]] | order(_updatedAt desc)[0]{ phases[]{ _key, name } }`

/**
 * Radios from the Project Phases kit this table uses.
 * Empty value = checklist ticks still drive the red dot.
 */
export function ActivePhaseInput(props: StringInputProps) {
  const {value, onChange, readOnly, id} = props
  const phasesRef = useFormValue(['projectPhases']) as {_ref?: string} | undefined
  const client = useClient({apiVersion: '2025-02-27'})
  const [phases, setPhases] = useState<Phase[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false
    const idRef = phasesRef?._ref
    const query = idRef ? PHASES_BY_ID : null

    if (!query) {
      setPhases([])
      setLoaded(true)
      return
    }

    client
      .fetch<{phases?: Array<Phase | null> | null} | null>(query, {id: idRef})
      .then((doc) => {
        if (cancelled) return
        setPhases((doc?.phases ?? []).filter((phase): phase is Phase => Boolean(phase?._key && phase.name)))
        setLoaded(true)
      })
      .catch(() => {
        if (cancelled) return
        setPhases([])
        setLoaded(true)
      })

    return () => {
      cancelled = true
    }
  }, [client, phasesRef?._ref])

  const pick = (next: string) => {
    onChange(next ? set(next) : unset())
  }

  if (!loaded) {
    return (
      <Text size={1} muted>
        Loading phases…
      </Text>
    )
  }

  if (!phases.length) {
    return (
      <Text size={1} muted>
        No phases yet. Add them under Table → Project Phases.
      </Text>
    )
  }

  return (
    <Stack space={2}>
      <PhaseRow
        inputId={`${id}-auto`}
        checked={!value}
        disabled={readOnly}
        label="Automatic"
        hint="Follows the checklist ticks"
        onPick={() => pick('')}
      />
      {phases.map((phase) => (
        <PhaseRow
          key={phase._key}
          inputId={`${id}-${phase._key}`}
          checked={value === phase._key}
          disabled={readOnly}
          label={phase.name}
          onPick={() => pick(phase._key)}
        />
      ))}
    </Stack>
  )
}

function PhaseRow({
  inputId,
  checked,
  disabled,
  label,
  hint,
  onPick,
}: {
  inputId: string
  checked: boolean
  disabled?: boolean
  label: string
  hint?: string
  onPick: () => void
}) {
  return (
    <Card
      as="button"
      type="button"
      padding={3}
      radius={2}
      border
      tone={checked ? 'primary' : 'transparent'}
      disabled={disabled}
      onClick={onPick}
    >
      <Flex align="flex-start" gap={3}>
        <Radio id={inputId} checked={checked} disabled={disabled} readOnly style={{marginTop: 2}} />
        <Stack space={2}>
          <Text size={1} weight="medium">
            {label}
          </Text>
          {hint ? (
            <Text size={1} muted>
              {hint}
            </Text>
          ) : null}
        </Stack>
      </Flex>
    </Card>
  )
}
