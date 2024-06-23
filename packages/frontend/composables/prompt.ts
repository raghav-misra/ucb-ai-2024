import '../assets/nprogress.css'
import { useNProgress } from '@vueuse/integrations/useNProgress'

export function usePrompt(successCallback?: (text: string) => void) {
    const { isLoading } = useNProgress()
    isLoading.value = true
    const prompt = ref("");
    const wsClient = useWSClient();
    function sendPrompt(evt: KeyboardEvent) {
        if (evt.shiftKey) return;
    
        evt.preventDefault(); 
    
        if (prompt.value === "") return; // no empty
    
        wsClient.value.room?.send("NEW_MESSAGE", prompt.value);

        successCallback?.(prompt.value);
        prompt.value = "";
    
        return false;
    }

    return {
        prompt,
        sendPrompt
    };
}
