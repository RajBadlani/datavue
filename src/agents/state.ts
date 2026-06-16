import { Annotation } from "@langchain/langgraph";

export interface ConversationMessage {
    role: "user" | "assistant";
    content: string;
    sql?: string;
    rowCount?: number;
    timestamp: string;
    // Optional rich turn metadata, persisted so a reloaded conversation keeps
    // its reasoning, SQL attempt number, chart, and result table instead of
    // collapsing to plain text. Only set on assistant data-query turns.
    reasoning?: string[];
    sqlAttempt?: number;
    chartConfig?: ChartConfig | null;
    queryResult?: QueryResult | null;
}

export interface SchemaColumn {
    name: string;
    type: string;
    nullable: boolean;
    isPrimaryKey: boolean;
    isForeignKey: boolean;
    enumValues: string[] | null;
}

export interface RelevantTable {
    tableName: string;
    schemaName: string;
    columns: SchemaColumn[];
    primaryKeys: string[];
    foreignKeys: {
        columnName: string;
        referencedTable: string;
        referencedColumn: string;
    }[];
    rowEstimate: number;
}

export interface QueryResult {
    rows: Record<string, unknown>[];
    rowCount: number;
    returnedRowCount: number;
    fields: string[];
    isTruncated: boolean;
}

export interface SqlAttempt {
    attempt: number;
    sql: string;
    error: string | null;
    generatedAt: string;
}

export interface ChartConfig {
    type:
        | "line"
        | "bar"
        | "pie"
        | "area"
        | "scatter"
        | "table"
        | "metric_card"
        | "none";
    xKey?: string;
    yKey?: string;
    series?: string[];
    xLabel?: string;
    yLabel?: string;
    color?: string;
    title?: string;
    isTruncated?: boolean;
    // metric_card specific
    value?: string;
    label?: string;
}

export type AgentIntent = "general_chat" | "schema_explanation" | "data_query";

export const AgentState = Annotation.Root({
    nlQuery: Annotation<string>({
        reducer: (_, newVal) => newVal,
        default: () => "",
    }),

    intent: Annotation<AgentIntent>({
        reducer: (_, newVal) => newVal,
        default: () => "general_chat",
    }),

    connectionId: Annotation<string>({
        reducer: (_, newVal) => newVal,
        default: () => "",
    }),
    userId: Annotation<string>({
        reducer: (_, newVal) => newVal,
        default: () => "",
    }),
    conversationHistory: Annotation<ConversationMessage[]>({
        reducer: (_, newVal) => newVal,
        default: () => [],
    }),
    relevantTables: Annotation<RelevantTable[]>({
        reducer: (_, newVal) => newVal,
        default: () => [],
    }),
    currentSql: Annotation<string>({
        reducer: (_, newVal) => newVal,
        default: () => "",
    }),
    sqlAttempts: Annotation<SqlAttempt[]>({
        reducer: (_, newVal) => newVal,
        default: () => [],
    }),
    isBlocked: Annotation<boolean>({
        reducer: (_, newVal) => newVal,
        default: () => false,
    }),
    blockedReason: Annotation<string>({
        reducer: (_, newVal) => newVal,
        default: () => "",
    }),
    queryResult: Annotation<QueryResult | null>({
        reducer: (_, newVal) => newVal,
        default: () => null,
    }),
    maskedColumns: Annotation<string[]>({
        reducer: (_, newVal) => newVal,
        default: () => [],
    }),
    lastError: Annotation<string>({
        reducer: (_, newVal) => newVal,
        default: () => "",
    }),
    retryCount: Annotation<number>({
        reducer: (_, newVal) => newVal,
        default: () => 0,
    }),
    finalResponse: Annotation<string>({
        reducer: (_, newVal) => newVal,
        default: () => "",
    }),
    startedAt: Annotation<number>({
        reducer: (_, newVal) => newVal,
        default: () => Date.now(),
    }),
    chartConfig: Annotation<ChartConfig | null>({
        reducer: (_, newVal) => newVal,
        default: () => null,
    })
});

// ─── Export the inferred type ──────────────────────────────────────────────────
// Use this type everywhere you need to type agent state
// e.g. function myNode(state: AgentStateType): Partial<AgentStateType>
export type AgentStateType = typeof AgentState.State;
