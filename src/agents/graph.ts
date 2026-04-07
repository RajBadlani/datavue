import { END, START, StateGraph } from "@langchain/langgraph";
import { AgentState, AgentStateType } from "./state";
import { schemaContextNode } from "./nodes/schema-context.node";
import { generateSQLNode } from "./nodes/generate-sql.node";
import { validateSQLNode } from "./nodes/validator-sql.node";
import { executeSQLNode } from "./nodes/execute-sql.node";
import { incrementRetryNode } from "./nodes/incrementRetry.node";
import { generateResponseNode } from "./nodes/generate-response.node";

const MAX_RETRIES = 2;

function routerAfterValidation(state: AgentStateType): string {
    if (state.isBlocked) {
        console.log(`[routeAfterValidation] SQL blocked -> generateResponse`);
        return "generateResponse";
    }
    console.log(`[routeAfterValidation] SQL valid -> executeSQL`);
    return "executeSQL";
}

function routeAfterExecution(state: AgentStateType): string {
    if (state.isBlocked) {
        console.log(
            "[routeAfterExecution] Execution hard-blocked → generateResponse",
        );
        return "generateResponse";
    }
    if (state.queryResult) {
        console.log(
            "[routeAfterExecution] Execution succeeded → generateResponse",
        );
        return "generateResponse";
    }
    if (state.queryResult) {
        console.log(
            "[routeAfterExecution] Execution succeeded → generateResponse",
        );
        return "generateResponse";
    }
    if (state.lastError.trim() !== "" && state.retryCount < MAX_RETRIES) {
        console.log(
            `[routeAfterExecution] Execution failed with retryable error → incrementRetry (retryCount=${state.retryCount}, max=${MAX_RETRIES})`,
        );
        return "incrementRetry";
    }
    console.log(
        "[routeAfterExecution] Retries exhausted or unrecoverable failure → generateResponse",
    );
    return "generateResponse";
}

export function buildAgentGraph() {
    const graph = new StateGraph(AgentState)
        .addNode("schemaContext", schemaContextNode)
        .addNode("generateSQL", generateSQLNode)
        .addNode("validateSQL", validateSQLNode)
        .addNode("executeSQL", executeSQLNode)
        .addNode("incrementRetry", incrementRetryNode)
        .addNode("generateResponse", generateResponseNode)

        .addEdge(START, "schemaContext")
        .addEdge("schemaContext", "generateSQL")
        .addEdge("generateSQL", "validateSQL")
        .addEdge("incrementRetry", "generateSQL")
        .addEdge("generateResponse", END)

        .addConditionalEdges("validateSQL", routerAfterValidation, {
            generateResponse: "generateResponse",
            executeSQL: "executeSQL",
        })
        .addConditionalEdges("executeSQL", routeAfterExecution, {
            incrementRetry: "incrementRetry",
            generateResponse: "generateResponse",
        });

    return graph.compile()
}

export const agentGraph = buildAgentGraph()
