import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { requireCurrentUser } from '@/lib/server/resolve-user'
import { ChatView } from '@/components/chat/chat-view'
import type { ChatMessage } from '@/components/chat/use-chat-stream'

type ChatPageProps = {
  params: Promise<{ connectionId: string }>
}

export default async function ChatPage({ params }: ChatPageProps) {
  const { connectionId } = await params
  const user = await requireCurrentUser()

  // Verify connection ownership
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
    },
  })

  if (!connection) {
    redirect('/connections')
  }

  // Load conversation history
  const conversation = await prisma.conversation.findUnique({
    where: {
      connectionId_userId: { connectionId, userId: user.id },
    },
    select: { messages: true },
  })

  // Transform stored messages into ChatMessage format
  const rawMessages = (conversation?.messages ?? []) as unknown as Array<{
    role: 'user' | 'assistant'
    content: string
    sql?: string
    timestamp: string
  }>

  const initialMessages: ChatMessage[] = rawMessages.map((msg, idx) => ({
    id: `history-${idx}`,
    role: msg.role,
    content: msg.content,
    timestamp: msg.timestamp,
    ...(msg.role === 'assistant'
      ? {
          turn: {
            reasoning: [],
            sql: msg.sql ?? null,
            sqlAttempt: null,
            chartConfig: null,
            queryResult: null,
            response: msg.content,
            error: null,
            isBlocked: false,
          },
        }
      : {}),
  }))

  return (
    <ChatView
      connectionId={connectionId}
      connection={{
        id: connection.id,
        label: connection.label,
        dbType: connection.dbType,
        syncStatus: connection.syncStatus,
      }}
      initialMessages={initialMessages}
    />
  )
}
