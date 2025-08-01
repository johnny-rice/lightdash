import { type AgentToolCallArgs, type ToolName } from '@lightdash/common';
import {
    configureStore,
    createSlice,
    type PayloadAction,
} from '@reduxjs/toolkit';

type ToolCall = {
    toolCallId: string;
    toolName: ToolName;
    toolArgs: AgentToolCallArgs;
};

export interface StreamingState {
    threadUuid: string;
    messageUuid: string;
    content: string;
    isStreaming: boolean;
    toolCalls: ToolCall[];
    error?: string;
}

type State = Record<string, StreamingState>;

const initialState: State = {};
const initialThread: Omit<StreamingState, 'threadUuid' | 'messageUuid'> = {
    content: '',
    isStreaming: true,
    toolCalls: [],
};

const threadStreamSlice = createSlice({
    name: 'threadStream',
    initialState,
    reducers: {
        startStreaming: (
            state,
            action: PayloadAction<{ threadUuid: string; messageUuid: string }>,
        ) => {
            const { threadUuid, messageUuid } = action.payload;

            state[threadUuid] = {
                threadUuid,
                messageUuid,
                ...initialThread,
            };
        },
        appendToMessage: (
            state,
            action: PayloadAction<{
                threadUuid: string;
                content: string;
            }>,
        ) => {
            const { threadUuid, content } = action.payload;

            const streamingThread = state[threadUuid];
            if (streamingThread) {
                streamingThread.content += content;
            } else {
                console.warn('Streaming thread or message not found:', {
                    threadUuid,
                });
            }
        },
        stopStreaming: (
            state,
            action: PayloadAction<{ threadUuid: string }>,
        ) => {
            const { threadUuid } = action.payload;

            state[threadUuid].isStreaming = false;
        },
        addToolCall: (
            state,
            action: PayloadAction<ToolCall & { threadUuid: string }>,
        ) => {
            const { threadUuid, toolCallId, toolName, toolArgs } =
                action.payload;
            const streamingThread = state[threadUuid];
            if (streamingThread) {
                const existingIndex = streamingThread.toolCalls.findIndex(
                    (tc) => tc.toolCallId === toolCallId,
                );
                if (existingIndex !== -1) {
                    streamingThread.toolCalls[existingIndex] = {
                        ...streamingThread.toolCalls[existingIndex],
                        toolName,
                        toolArgs,
                    };
                } else {
                    streamingThread.toolCalls.push({
                        toolCallId,
                        toolName,
                        toolArgs,
                    });
                }
            }
        },
        setError: (
            state,
            action: PayloadAction<{ threadUuid: string; error: string }>,
        ) => {
            const { threadUuid, error } = action.payload;
            console.error('Setting error for thread:', threadUuid, error);

            const streamingThread = state[threadUuid];
            if (streamingThread) {
                streamingThread.isStreaming = false;
                streamingThread.error = error;
            }
        },
    },
});

export const {
    startStreaming,
    appendToMessage,
    stopStreaming,
    setError,
    addToolCall,
} = threadStreamSlice.actions;

export const store = configureStore({
    reducer: {
        threads: threadStreamSlice.reducer,
    },
});

export type AiAgentThreadStreamState = ReturnType<typeof store.getState>;
export type AiAgentThreadStreamDispatch = typeof store.dispatch;
