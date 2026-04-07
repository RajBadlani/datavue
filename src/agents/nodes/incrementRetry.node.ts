import { AgentStateType } from "../state";

export async function incrementRetryNode(
  state: AgentStateType
): Promise<Partial<AgentStateType>> {
  return {
    retryCount: state.retryCount + 1,
    queryResult: null,
    isBlocked: false,
    blockedReason: '',
    finalResponse: '',
  }
}