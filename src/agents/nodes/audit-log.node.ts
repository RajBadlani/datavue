import prisma from "@/lib/prisma";
import { QueryStatus } from "@/generated/prisma/enums";
import { AgentStateType } from "../state";
import { Prisma } from "@/generated/prisma/client";

function resolveStatus(state: AgentStateType): QueryStatus {
    if (state.isBlocked) {
        return QueryStatus.BLOCKED;
    }

    const error = state.lastError.toLowerCase();

    if (
        error.includes("statement timeout") ||
        error.includes("canceling statement due to") ||
        error.includes("query_canceled")
    ) {
        return QueryStatus.TIMEOUT;
    }

    if (state.queryResult !== null) {
        return QueryStatus.SUCCESS;
    }

    return QueryStatus.FAILED;
}

function resolveFinalSQL(state: AgentStateType): string | null {
    if (state.sqlAttempts.length > 0) {
        const successfulAttempt = [...state.sqlAttempts]
            .reverse()
            .find((attempt) => attempt.error === null);

        if (successfulAttempt) {
            return successfulAttempt.sql;
        }

        return state.sqlAttempts[state.sqlAttempts.length - 1]?.sql ?? null;
    }

    if (state.currentSql.trim() !== "") {
        return state.currentSql;
    }

    return null;
}

export async function auditLog(
    state: AgentStateType,
): Promise<Partial<AgentStateType>> {
    const status = resolveStatus(state);
    const finalSql = resolveFinalSQL(state);
    const executionMs = Date.now() - state.startedAt;
    const rowCount = state.queryResult?.rowCount ?? null;
    const chartType = state.chartConfig?.type ?? null;
    const errorMessage = state.lastError.trim() || null;

    console.log(
        `[auditLog] Writing — status=${status}, executionMs=${executionMs}ms, rowCount=${rowCount ?? "N/A"}`,
    );

    try {
        await prisma.auditLog.create({
            data: {
                userId: state.userId,
                connectionId: state.connectionId,
                nlQuery: state.nlQuery,
                sqlAttempts: state.sqlAttempts as unknown as Prisma.InputJsonValue,
                finalSql,
                executionMs,
                rowCount,
                chartType,
                status,
                errorMessage,
            },
        });

        console.log(
            `[auditLog] ✅ Written — status=${status}, executionMs=${executionMs}ms`,
        );
    } catch (error) {
        console.error("[auditLog] ❌ Failed to write audit log:", error);
    }

    return {};
}