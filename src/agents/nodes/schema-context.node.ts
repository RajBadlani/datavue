import prisma from "@/lib/prisma";
import { AgentStateType, RelevantTable, SchemaColumn } from "../state";

const SMALL_DB_THRESHOLD = 50;

function normalizeColumn(raw: unknown): SchemaColumn {
    const col = raw as Record<string, unknown>;

    return {
        name: String(col.name ?? ""),
        type: String(col.type ?? "text"),
        nullable: Boolean(col.nullable ?? true),
        isPrimaryKey: Boolean(col.isPrimaryKey ?? false),
        isForeignKey: Boolean(col.isForeignKey ?? false),
        enumValues: Array.isArray(col.enumValues)
            ? col.enumValues.map(String)
            : null,
    };
}

function buildCompactSummary(tables: RelevantTable[]): string {
    return tables
        .map((table) => {
            const cols = table.columns.map((col) => {
                let colStr = `"${col.name}" (${col.type}`;
                if (
                    Array.isArray(col.enumValues) &&
                    col.enumValues.length > 0
                ) {
                    colStr += `: ${col.enumValues.join("|")}`;
                }
                if (col.isPrimaryKey) {
                    colStr += ", PK";
                } else if (col.isForeignKey) {
                    const fk = table.foreignKeys.find(
                        (f) => f.columnName === col.name,
                    );
                    if (fk) {
                        colStr += `, FK→${fk.referencedTable}.${fk.referencedColumn}`;
                    }
                }
                if (!col.nullable && !col.isPrimaryKey) {
                    colStr += ", NOT NULL";
                }
                colStr += ")";
                return colStr;
            });

            return `${table.tableName}: ${cols.join(", ")}`;
        })
        .join("\n");
}

export async function schemaContextNode(
    state: AgentStateType,
): Promise<Partial<AgentStateType>> {
    const rawMetadata = await prisma.schemaMetadata.findMany({
        where: { connectionId: state.connectionId },
        select: {
            tableName: true,
            schemaName: true,
            columns: true,
            primaryKeys: true,
            foreignKeys: true,
            rowEstimate: true,
        },
    });

    if (rawMetadata.length === 0) {
        console.warn(
            `[schemaContext] No metadata found for connection ${state.connectionId}`,
        );
        return { relevantTables: [] };
    }

    const allTables: RelevantTable[] = rawMetadata
        .filter((row) => !row.tableName.startsWith("_"))
        .map((row) => ({
            tableName: row.tableName,
            schemaName: row.schemaName,
            columns: (row.columns as unknown[]).map(normalizeColumn), // ← normalized
            primaryKeys: row.primaryKeys,
            foreignKeys: row.foreignKeys as RelevantTable["foreignKeys"],
            rowEstimate: Number(row.rowEstimate),
        }));

    let relevantTables: RelevantTable[];

    if (allTables.length <= SMALL_DB_THRESHOLD) {
        relevantTables = allTables;
        console.log(
            `[schemaContext] Small DB — ${allTables.length} tables, using compact summary`,
        );
    } else {
        // TODO Phase 3: replace with pgvector semantic search
        // For now return all tables — large DB support is deferred
        relevantTables = allTables;
        console.log(
            `[schemaContext] Large DB — ${allTables.length} tables, semantic search deferred to Phase 3`,
        );
    }

    return { relevantTables };
}

export function buildSchemaString(
    tables: RelevantTable[],
    totalTableCount: number,
): string {
    if (totalTableCount <= SMALL_DB_THRESHOLD) {
        return buildCompactSummary(tables);
    }
    // TODO Phase 3: detailed format after pgvector selection
    return buildCompactSummary(tables);
}
