const useMessageQueue = () => useState<{
    characterName: string;
    message: string;
}[]>("messageQueue", () => []);

export function useDialog() {
    const messageQueue = useMessageQueue();

    const dialogOptions = useState("dialogOptions", () => ({
        isOpen: false,
        title: "",
        text: "",
    }));

    function showDialog(title: string, text: string) {
        dialogOptions.value.title = title;
        dialogOptions.value.text = text;
        dialogOptions.value.isOpen = true;
    }

    function queueDialog(characterName: string, message: string) {
        messageQueue.value.push({ characterName, message });
    }

    function hideDialog() {
        messageQueue.value.shift();
    }

    return { showDialog, hideDialog, queueDialog, dialogOptions, messageQueue };
}