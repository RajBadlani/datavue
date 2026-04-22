import { redirect } from 'next/navigation'

type ChatPageProps = {
  params: Promise<{ connectionId: string }>
}

export default async function ChatPage({ params }: ChatPageProps) {
  const { connectionId } = await params

  redirect(`/connections/${connectionId}/chat`)
}
