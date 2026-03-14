import { EventEmitter } from 'events';
export interface MCPServerConfig {
    id: string;
    name: string;
    command: string;
    args: string[];
    env?: Record<string, string>;
}
export declare class MCPClientService extends EventEmitter {
    private servers;
    private availableTools;
    constructor();
    connectServer(config: MCPServerConfig): Promise<{
        inputSchema: {
            [x: string]: unknown;
            type: "object";
            properties?: Record<string, object> | undefined;
            required?: string[] | undefined;
        };
        name: string;
        description?: string | undefined;
        outputSchema?: {
            [x: string]: unknown;
            type: "object";
            properties?: Record<string, object> | undefined;
            required?: string[] | undefined;
        } | undefined;
        annotations?: {
            title?: string | undefined;
            readOnlyHint?: boolean | undefined;
            destructiveHint?: boolean | undefined;
            idempotentHint?: boolean | undefined;
            openWorldHint?: boolean | undefined;
        } | undefined;
        execution?: {
            taskSupport?: "optional" | "required" | "forbidden" | undefined;
        } | undefined;
        _meta?: Record<string, unknown> | undefined;
        icons?: {
            src: string;
            mimeType?: string | undefined;
            sizes?: string[] | undefined;
            theme?: "light" | "dark" | undefined;
        }[] | undefined;
        title?: string | undefined;
    }[]>;
    executeTool(serverId: string, toolName: string, args: any): Promise<{
        [x: string]: unknown;
        content: ({
            type: "text";
            text: string;
            annotations?: {
                audience?: ("user" | "assistant")[] | undefined;
                priority?: number | undefined;
                lastModified?: string | undefined;
            } | undefined;
            _meta?: Record<string, unknown> | undefined;
        } | {
            type: "image";
            data: string;
            mimeType: string;
            annotations?: {
                audience?: ("user" | "assistant")[] | undefined;
                priority?: number | undefined;
                lastModified?: string | undefined;
            } | undefined;
            _meta?: Record<string, unknown> | undefined;
        } | {
            type: "audio";
            data: string;
            mimeType: string;
            annotations?: {
                audience?: ("user" | "assistant")[] | undefined;
                priority?: number | undefined;
                lastModified?: string | undefined;
            } | undefined;
            _meta?: Record<string, unknown> | undefined;
        } | {
            type: "resource";
            resource: {
                uri: string;
                text: string;
                mimeType?: string | undefined;
                _meta?: Record<string, unknown> | undefined;
            } | {
                uri: string;
                blob: string;
                mimeType?: string | undefined;
                _meta?: Record<string, unknown> | undefined;
            };
            annotations?: {
                audience?: ("user" | "assistant")[] | undefined;
                priority?: number | undefined;
                lastModified?: string | undefined;
            } | undefined;
            _meta?: Record<string, unknown> | undefined;
        } | {
            uri: string;
            name: string;
            type: "resource_link";
            description?: string | undefined;
            mimeType?: string | undefined;
            annotations?: {
                audience?: ("user" | "assistant")[] | undefined;
                priority?: number | undefined;
                lastModified?: string | undefined;
            } | undefined;
            _meta?: {
                [x: string]: unknown;
            } | undefined;
            icons?: {
                src: string;
                mimeType?: string | undefined;
                sizes?: string[] | undefined;
                theme?: "light" | "dark" | undefined;
            }[] | undefined;
            title?: string | undefined;
        })[];
        _meta?: {
            [x: string]: unknown;
            progressToken?: string | number | undefined;
            "io.modelcontextprotocol/related-task"?: {
                taskId: string;
            } | undefined;
        } | undefined;
        structuredContent?: Record<string, unknown> | undefined;
        isError?: boolean | undefined;
    } | {
        [x: string]: unknown;
        toolResult: unknown;
        _meta?: {
            [x: string]: unknown;
            progressToken?: string | number | undefined;
            "io.modelcontextprotocol/related-task"?: {
                taskId: string;
            } | undefined;
        } | undefined;
    }>;
    getAllTools(): any[];
    disconnectAll(): Promise<void>;
}
