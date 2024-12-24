import ollama from 'ollama';
import * as process from 'process';
import { Tool } from '../types/llm';
import { Request } from '../models/Request';

const tools: Tool[] = [
    {
        type: 'function',
        function: {
            name: 'create_request',
            description: 'Create a patient assistance request',
            parameters: {
                type: 'object',
                properties: {
                    priority: { type: 'string', enum: ['low', 'medium', 'high'], description: 'Priority level' },
                    description: { type: 'string', description: 'Detailed description of the assistance needed' },
                    department: {
                        type: 'string',
                        enum: [
                            'Emergency',
                            'Intensive Care',
                            'Pediatrics',
                            'Maternity',
                            'Oncology',
                            'Cardiology',
                            'Neurology',
                            'Orthopedics',
                            'Psychiatry',
                            'Rehabilitation',
                            'Geriatrics',
                            'Surgery',
                            'Outpatient',
                        ],
                        description: 'Department responsible for handling the request',
                    },
                },
                required: ['priority', 'description', 'department'],
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'get_patient_requests',
            description: 'Retrieve patient requests',
            parameters: {
                type: 'object',
                properties: {
                    status: { type: 'string', enum: ['pending', 'in_progress', 'completed', 'cancelled'], description: 'Status' },
                    patientId: { type: 'string', description: 'ID of the patient' },
                },
                required: ['patientId'],
            },
        },
    },
];

interface AssistanceRequest {
    priority: string;
    description: string;
    department: string;
    status: string;
    room: string;
    patient: string;
}

class LLMService {
    private ollamaHost: string;
    private context: any;

    constructor() {
        this.ollamaHost = 'http://localhost:11434';
        console.log('Ollama Host:', this.ollamaHost);
    }

    private systemPrompt = `You are a helpful hospital assistant for admitted patients.`;

    async streamMessage(userMessage: string, onToken: (token: string) => void): Promise<void> {
        const messages = [{ role: 'system', content: this.systemPrompt }, { role: 'user', content: userMessage }];
        const stream = await ollama.chat({
            model: 'granite3.1-dense:8b',
            messages,
            stream: true,
            options: { temperature: 0.7 },
        });

        for await (const part of stream) {
            if (part.message?.content) onToken(part.message.content);
        }
    }

    async handleFunctionCall(functionCall: any): Promise<{ text: string } | null> {
        switch (functionCall.name) {
            case 'create_request': {
                const { priority, description, department } = functionCall.parameters;
                const room = this.context?.room || 'Unknown';
                const patient = this.context?.patientId || 'Unknown';
                const request = new Request({ priority, description, department, room, patient, status: 'PENDING' });
                await request.save();
                return { text: 'Request created successfully.' };
            }
            case 'get_patient_requests': {
                const { status, patientId } = functionCall.parameters;
                const requests = await Request.find({ status, patientId });
                return { text: requests.map(r => `${r.priority}: ${r.description}`).join('\n') || 'No requests found.' };
            }
            default:
                return { text: 'Unknown function call.' };
        }
    }
}

export const llmService = new LLMService();
