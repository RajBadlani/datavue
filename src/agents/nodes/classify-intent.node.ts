import { generateCompletion } from "@/lib/llm";
import { AgentIntent, AgentStateType } from "../state";

const INTENT_CLASSIFIER_PROMPT = `You are an intent classifier for a database assistant.
Your job is to classify the user's message into exactly ONE of these labels:
1. general_chat
   - greetings, thanks, casual chat, general knowledge, or questions that do NOT require the connected database
2. schema_explanation
   - requests asking to explain the database structure, schema, tables, columns, relationships, or what the database contains conceptually
3. data_query
   - requests asking for actual data, counts, records, trends, filters, aggregations, or anything that requires querying the database rows
RULES:
- Return exactly one label
- Do not explain your answer
- Do not use markdown
- Do not return any text other than one of:
general_chat
schema_explanation
data_query
`;

function normalizeIntent(text: string): AgentIntent {
    const normalized = text.trim().toLowerCase();
    if (normalized === "schema_explanation") {
        return "schema_explanation";
    }
    if (normalized === "data_query") {
        return "data_query";
    }
    return "general_chat";
}

export async function classifyIntentNode(
    state: AgentStateType,
): Promise<Partial<AgentStateType>> {
    console.log(`[classifyIntent] Classifying query : "${state.nlQuery}"`);
    const userPrompt = `USER MESSAGE : ${state.nlQuery} 
    Return the correct intent label from the following options:
    1. general_chat
    2. schema_explanation
    3. data_query
    Return only the label, nothing else.`;

    try {
        const result = await generateCompletion(
            [
                {
                    role: "user",
                    content: userPrompt,
                },
            ],
            {
                systemPrompt: INTENT_CLASSIFIER_PROMPT,
                maxTokens: 20,
                temperature: 0,
            },
        );

        const intent = normalizeIntent(result.text);
        console.log(`[classifyIntent] Classified as ${intent}`);

        return { intent };
    } catch (error) {
        console.error(
            `[classifyIntent] Classification failed , defaulting to general_chat`,
            error,
        );
        return { intent: "general_chat" };
    }
}
