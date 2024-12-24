import { Socket } from 'socket.io';
import { llmService } from '../services/llmService';

export const setupLLMHandlers = (socket: Socket) => {
    console.log('Client connected to LLM service');

    socket.on('chat message', async (message: string) => {
        try {
            console.log('Received chat message:', message);

            // Send start marker
            socket.emit('chat response', '[START]');

            // Process the message using the LLM service with streaming
            await llmService.streamMessage(message, (token) => {
                socket.emit('chat response', token);
            });

            // Send end marker
            socket.emit('chat response', '[END]');
        } catch (error) {
            console.error('Error in LLMHandler:', error);

            // Handle errors with proper type narrowing
            let errorMessage = '[ERROR] An unexpected error occurred';
            if (error instanceof Error) {
                errorMessage = `[ERROR] ${error.message}`;
            }

            // Emit error response to the client
            socket.emit('chat response', errorMessage);
        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected from LLM service');
    });
};
