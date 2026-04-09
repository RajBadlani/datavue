import { END, START, StateGraph } from "@langchain/langgraph";
import { AgentState, AgentStateType } from "./state";

import { classifyIntentNode } from "./nodes/classify-intent.node";
import { schemaContextNode } from "./nodes/schema-context.node";
import { generateGeneralResponseNode } from "./nodes/generate-general-response.node";
import { generateSchemaResponseNode } from "./nodes/generate-schema-response.node";
import { generateSQLNode } from "./nodes/generate-sql.node";
import { validateSQLNode } from "./nodes/validator-sql.node";
import { executeSQLNode } from "./nodes/execute-sql.node";
import { incrementRetryNode } from "./nodes/incrementRetry.node";
import { generateResponseNode } from "./nodes/generate-response.node";

const MAX_RETRIES = 2;

// ─── Router: After Intent Classification ─────────────────────────────────────
function routeAfterIntent(
    state: AgentStateType,
): "generateGeneralResponse" | "schemaContext" {
    if (state.intent === "general_chat") {
        console.log(
            "[routeAfterIntent] general_chat → generateGeneralResponse",
        );
        return "generateGeneralResponse";
    }

    console.log(`[routeAfterIntent] ${state.intent} → schemaContext`);
    return "schemaContext";
}

// ─── Router: After Schema Context ────────────────────────────────────────────
function routeAfterSchemaContext(
    state: AgentStateType,
): "generateSchemaResponse" | "generateSQL" {
    if (state.intent === "schema_explanation") {
        console.log(
            "[routeAfterSchemaContext] schema_explanation → generateSchemaResponse",
        );
        return "generateSchemaResponse";
    }

    console.log("[routeAfterSchemaContext] data_query → generateSQL");
    return "generateSQL";
}

// ─── Router: After SQL Validation ────────────────────────────────────────────
function routeAfterValidation(
    state: AgentStateType,
): "generateResponse" | "executeSQL" {
    if (state.isBlocked) {
        console.log("[routeAfterValidation] SQL blocked → generateResponse");
        return "generateResponse";
    }

    console.log("[routeAfterValidation] SQL valid → executeSQL");
    return "executeSQL";
}

// ─── Router: After SQL Execution ─────────────────────────────────────────────
function routeAfterExecution(
    state: AgentStateType,
): "generateResponse" | "incrementRetry" {
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

// ─── Graph Builder ───────────────────────────────────────────────────────────
export function buildAgentGraph() {
    const graph = new StateGraph(AgentState)
        // Nodes
        .addNode("classifyIntent", classifyIntentNode)
        .addNode("generateGeneralResponse", generateGeneralResponseNode)
        .addNode("schemaContext", schemaContextNode)
        .addNode("generateSchemaResponse", generateSchemaResponseNode)
        .addNode("generateSQL", generateSQLNode)
        .addNode("validateSQL", validateSQLNode)
        .addNode("executeSQL", executeSQLNode)
        .addNode("incrementRetry", incrementRetryNode)
        .addNode("generateResponse", generateResponseNode)

        // Direct edges
        .addEdge(START, "classifyIntent")
        .addEdge("generateGeneralResponse", END)
        .addEdge("generateSchemaResponse", END)
        .addEdge("generateSQL", "validateSQL")
        .addEdge("incrementRetry", "generateSQL")
        .addEdge("generateResponse", END)

        // Conditional edges
        .addConditionalEdges("classifyIntent", routeAfterIntent, {
            generateGeneralResponse: "generateGeneralResponse",
            schemaContext: "schemaContext",
        })
        .addConditionalEdges("schemaContext", routeAfterSchemaContext, {
            generateSchemaResponse: "generateSchemaResponse",
            generateSQL: "generateSQL",
        })
        .addConditionalEdges("validateSQL", routeAfterValidation, {
            generateResponse: "generateResponse",
            executeSQL: "executeSQL",
        })
        .addConditionalEdges("executeSQL", routeAfterExecution, {
            generateResponse: "generateResponse",
            incrementRetry: "incrementRetry",
        });

    return graph.compile();
}

export const agentGraph = buildAgentGraph();