export function useDialog() {
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

    function hideDialog() {
        dialogOptions.value.isOpen = false;
    }

    return { showDialog, hideDialog, dialogOptions };
}