import prisma from "@/lib/prisma";
import { AgentStateType, RelevantTable, SchemaColumn } from "../state";

const SMALL_DB_THRESHOLD = 50;

function buildCompactSummary(tables: RelevantTable[]): string {
    return tables
        .map((table) => {
            const cols = table.columns.map((col) => {
                // Start without closing paren — we close it at the end
                let colStr = `${col.name} (${col.type}`;

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

                colStr += ")"; // single closing paren at the end

                return colStr; // ← was missing, cols was array of undefined
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

    const allTables: RelevantTable[] = rawMetadata.filter((row) => !row.tableName.startsWith('_')).map((row) => ({
        tableName: row.tableName,
        schemaName: row.schemaName,
        columns: row.columns as unknown as SchemaColumn[],
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

export function buildSchemaString(tables: RelevantTable[],totalTableCount: number,): string {
    if (totalTableCount <= SMALL_DB_THRESHOLD) {
        return buildCompactSummary(tables);
    }
    // TODO Phase 3: detailed format after pgvector selection
    return buildCompactSummary(tables);
}
