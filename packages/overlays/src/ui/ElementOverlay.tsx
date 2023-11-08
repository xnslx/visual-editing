import { studioPath } from '@sanity/client/csm'
import { Box, Card, Flex, Text } from '@sanity/ui'
import { memo, useEffect, useMemo, useRef } from 'react'
import scrollIntoView from 'scroll-into-view-if-needed'
import styled from 'styled-components'
import { pathToUrlString } from 'visual-editing-helpers'

import {
  ElementFocusedState,
  OverlayRect,
  SanityNode,
  SanityNodeLegacy,
} from '../types'

const Root = styled(Card)`
  background-color: var(--overlay-bg);
  border-radius: 3px;
  pointer-events: none;
  position: absolute;
  will-change: transform;
  box-shadow: var(--overlay-box-shadow);
  transition: none;

  --overlay-bg: transparent;
  --overlay-box-shadow: inset 0 0 0 1px transparent;

  [data-overlays] & {
    --overlay-bg: color-mix(
      in srgb,
      transparent 95%,
      var(--card-focus-ring-color)
    );
    --overlay-box-shadow: inset 0 0 0 2px
      color-mix(in srgb, transparent 50%, var(--card-focus-ring-color));
  }

  [data-fading-out] & {
    transition:
      box-shadow 1550ms,
      background-color 1550ms;

    --overlay-bg: rgba(0, 0, 255, 0);
    --overlay-box-shadow: inset 0 0 0 1px transparent;
  }

  &[data-focused] {
    --overlay-box-shadow: inset 0 0 0 1px var(--card-focus-ring-color);
  }

  &[data-hovered]:not([data-focused]) {
    transition: none;
    --overlay-box-shadow: inset 0 0 0 2px var(--card-focus-ring-color);
  }

  /* [data-unmounted] & {
    --overlay-box-shadow: inset 0 0 0 1px var(--card-focus-ring-color);
  } */
`

const Actions = styled(Flex)`
  bottom: 100%;
  cursor: pointer;
  pointer-events: none;
  position: absolute;
  right: 0;

  [data-hovered] & {
    pointer-events: all;
  }
`

const ActionOpen = styled(Card)`
  background-color: var(--card-focus-ring-color);
  right: 0;
  border-radius: 3px;

  & [data-ui='Text'] {
    color: var(--card-bg-color);
    white-space: nowrap;
  }
`

function createIntentLink(node: SanityNode) {
  const { projectId, dataset, id, type, path, baseUrl, tool, workspace } = node

  const parts = [
    ['project', projectId],
    ['dataset', dataset],
    ['id', id],
    ['type', type],
    ['path', pathToUrlString(studioPath.fromString(path))],
    ['workspace', workspace],
    ['tool', tool],
  ]

  const intent = parts
    .filter(([, value]) => !!value)
    .map((part) => part.join('='))
    .join(';')

  return `${baseUrl}/intent/edit/${intent}`
}

export const ElementOverlay = memo(function ElementOverlay(props: {
  focused: ElementFocusedState
  hovered: boolean
  rect: OverlayRect
  showActions: boolean
  sanity: SanityNode | SanityNodeLegacy
}) {
  const { focused, hovered, rect, showActions, sanity } = props

  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (focused === true && ref.current) {
      scrollIntoView(ref.current, {
        behavior: 'smooth',
        scrollMode: 'if-needed',
        block: 'center',
        inline: 'nearest',
      })
    }
  }, [focused])

  const style = useMemo(
    () => ({
      width: `${rect.w}px`,
      height: `${rect.h}px`,
      transform: `translate(${rect.x}px, ${rect.y}px)`,
    }),
    [rect],
  )

  const href = 'path' in sanity ? createIntentLink(sanity) : sanity.href

  return (
    <Root
      data-focused={focused ? '' : undefined}
      data-hovered={hovered ? '' : undefined}
      ref={ref}
      style={style}
    >
      {showActions && hovered ? (
        <Actions gap={1} paddingBottom={1}>
          <Box as="a" href={href}>
            <ActionOpen padding={2}>
              <Text size={1} weight="medium">
                Open in Studio
              </Text>
            </ActionOpen>
          </Box>
        </Actions>
      ) : null}
    </Root>
  )
})
