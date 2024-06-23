export default defineNuxtRouteMiddleware(() => {
    const userId = useUserId();
    if (userId.value === null) {
        return navigateTo("/auth");
    }
});