import type { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { createOpenAI } from '@ai-sdk/openai';
import { generateText, streamText, type CoreSystemMessage, type CoreUserMessage, type CoreAssistantMessage, type CoreToolMessage, CoreTool, generateObject } from 'ai';
import { corsHeaders } from './cors.ts'

export class Thread {
    static CopyThread(thread: Thread) {
        return new Thread(thread.messages.map(msg => ({ ...msg })))
    }

    id?: string

    messages: (CoreSystemMessage | CoreUserMessage | CoreAssistantMessage | CoreToolMessage)[] = []

    state = {} as any

    constructor(msgs: (CoreSystemMessage | CoreUserMessage | CoreAssistantMessage | CoreToolMessage)[] = [], state?: any) {
        this.messages = msgs
        if (state) {
            this.state = state
        }
    }

    add(role: (CoreSystemMessage | CoreUserMessage | CoreAssistantMessage)["role"], content: string) {
        this.messages.push({
            role,
            content
        })
        return this
    }

    getSystemPrompt() {
        return this.messages.find(msg => msg.role === 'system')?.content as string || ''
    }

    setSystemPrompt(content: string) {
        const systemPrompt = this.messages.find(msg => msg.role === 'system')
        if (systemPrompt) {
            systemPrompt.content = content
        } else {
            //add to front
            this.messages.unshift({
                role: 'system',
                content
            })
        }
    }

    getMessages() {
        return this.messages
    }

    setState(context: any) {
        this.state = context
        return this
    }

    getState() {
        return this.state
    }

    getAllNonSystemMessages() {
        return this.messages.filter(msg => msg.role !== 'system')
    }

    last() {
        return this.messages[this.messages.length - 1]?.content || null
    }
}

const providers = {
    openai: {
        defaultModel: "gpt-4o",
        apiKey: process.env.OPENAI_KEY,
        baseURL: "https://api.openai.com/v1/",
        client: createOpenAI({
            baseURL: "https://api.openai.com/v1/",
            apiKey: process.env.OPENAI_KEY
        })
    },
    groq: {
        defaultModel: "llama3-70b-8192",
        apiKey: process.env.GROQ_KEY,
        baseURL: "https://api.groq.com/openai/v1/",
        client: createOpenAI({
            baseURL: "https://api.groq.com/openai/v1/",
            apiKey: process.env.GROQ_KEY
        })
    }

}

const genHeaders = (provider: keyof typeof providers) => {
    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${providers[provider].apiKey}`
    }
}

export interface InferenceOptions {
    thread: Thread,
    provider?: keyof typeof providers,
    model?: string,
    max_tokens?: number,
    temperature?: number,
    //  userID: string,
    response_format?: 'json_object' | 'text',
    tools?: Record<string, CoreTool>,
    maxToolRoundtrips?: number
}

export interface AICallbacks {
    onStart?: () => void,
    onText?: (text: string) => void,
    onCompletion?: (completion: string) => void,
}

export async function streamThread(options: InferenceOptions) {
    const provider = options.provider ?? 'openai'
    const stream = await streamText({
        model: providers[provider].client.chat(providers[provider].defaultModel),
        messages: options.thread.getMessages(),
    })
    return stream.toAIStreamResponse({
        headers: corsHeaders
    })
}

export async function genText(options: InferenceOptions) {
    const provider = options.provider ?? 'openai'
    const thread = Thread.CopyThread(options.thread)
    const reply = await generateText({
        model: providers[provider].client.chat(providers[provider].defaultModel),
        messages: thread.getMessages(),
        tools: options.tools,
        maxTokens: options.max_tokens || 1000,
        maxToolRoundtrips: options.maxToolRoundtrips || 10
    })

    if (reply.finishReason === 'content-filter') {
        throw new Error('Your message was flagged as inappropriate.')
    }

    let text = reply.text

    //If the AI stopped early, ask it to continue   
    if (reply.finishReason === 'length') {
        thread.add('assistant', reply.text)
        thread.add('system', 'continue')
        const reply2 = await genText(options)
        text += reply2
    }

    //console.log(JSON.stringify(reply.responseMessages,null,2),'[AI]')
    return text
}

interface JSONInferenceOptions<T> extends InferenceOptions {
    schema: z.Schema<T>;
}

export async function genJSON<T>(options: JSONInferenceOptions<T>) {
    const provider = options.provider ?? 'openai'
    const thread = Thread.CopyThread(options.thread)
    thread.setSystemPrompt(thread.getSystemPrompt() + await injectJsonSchemaIntoSystem({
        system: thread.getSystemPrompt(),
        schema: options.schema
    }))

    const object = await generateObject({
        model: providers[provider].client.chat(providers[provider].defaultModel),
        messages: thread.getMessages(),
        schema: options.schema
    })

    if (!object.object) {
        throw new Error(`Unable to generate response. Please try again.`)
    }

    return object.object
}

export async function genImage(options: {

}) {
    // fetch GET http://localhost:25756/sdxl/?prompt={}&type={bg|normal}
}

async function injectJsonSchemaIntoSystem({
    system,
    schema,
    schemaPrefix = "\n# JSON OUTPUT SCHEMA\n",
    schemaSuffix = "You MUST reply with a SINGLE JSON object that matches the schema above."
}: {
    system?: string;
    schema: z.Schema<unknown>;
    schemaPrefix?: string;
    schemaSuffix?: string;
}): Promise<string> {
    const jsonSchema = zodToJsonSchema(schema);

    return [
        system,
        system != null ? '' : null, // add a newline if system is not null
        schemaPrefix,
        JSON.stringify(jsonSchema),
        schemaSuffix,
    ]
        .filter(line => line != null)
        .join('\n');
}