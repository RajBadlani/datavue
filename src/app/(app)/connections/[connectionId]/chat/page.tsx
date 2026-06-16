import prisma from '@/lib/prisma'
import { requireUserOrRedirect } from '@/lib/server/resolve-user'
import { ConnectionChatPage } from '@/components/chat'
import { Prisma } from '@/generated/prisma/client'
import type { StoredConversationMessage } from '@/components/chat/connection-chat-page'

type ConnectionScopedChatPageProps = {
  params: Promise<{ connectionId: string }>
}

export default async function ConnectionScopedChatPage({ params }: ConnectionScopedChatPageProps) {
  const user = await requireUserOrRedirect()
  const { connectionId } = await params

  const connection = await prisma.connection.findFirst({
    where: {
      id: connectionId,
      userId: user.id,
      isArchived: false,
    },
    select: {
      id: true,
      label: true,
      dbType: true,
      syncStatus: true,
      schemaMetadata: {
        select: {
          tableName: true,
        },
        orderBy: {
          tableName: 'asc',
        },
        take: 3,
      },
    },
  })

  const conversation = connection
    ? await prisma.conversation.findUnique({
        where: {
          connectionId_userId: {
            connectionId: connection.id,
            userId: user.id,
          },
        },
        select: {
          messages: true,
        },
      })
    : null

  const initialMessages = Array.isArray(conversation?.messages)
    ? (conversation.messages as Prisma.JsonArray).flatMap((message): StoredConversationMessage[] => {
        if (!message || typeof message !== 'object' || Array.isArray(message)) {
          return []
        }

        const nextMessage = message as Record<string, unknown>
        const role = nextMessage.role
        const content = nextMessage.content
        const timestamp = nextMessage.timestamp

        if ((role !== 'user' && role !== 'assistant') || typeof content !== 'string' || typeof timestamp !== 'string') {
          return []
        }

        return [{
          role,
          content,
          timestamp,
          ...(typeof nextMessage.sql === 'string' ? { sql: nextMessage.sql } : {}),
          ...(typeof nextMessage.sqlAttempt === 'number' ? { sqlAttempt: nextMessage.sqlAttempt } : {}),
          ...(Array.isArray(nextMessage.reasoning)
            ? { reasoning: nextMessage.reasoning.filter((step): step is string => typeof step === 'string') }
            : {}),
          ...(nextMessage.chartConfig && typeof nextMessage.chartConfig === 'object'
            ? { chartConfig: nextMessage.chartConfig as StoredConversationMessage['chartConfig'] }
            : {}),
          ...(nextMessage.queryResult && typeof nextMessage.queryResult === 'object'
            ? { queryResult: nextMessage.queryResult as StoredConversationMessage['queryResult'] }
            : {}),
        }]
      })
    : []

  return (
    <ConnectionChatPage
      connection={connection ? {
        id: connection.id,
        label: connection.label,
        dbType: connection.dbType,
        syncStatus: connection.syncStatus,
        schemaPreview: connection.schemaMetadata.map(table => table.tableName),
      } : null}
      initialMessages={initialMessages}
    />
  )
}
