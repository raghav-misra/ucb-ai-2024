export default defineNuxtRouteMiddleware(() => {
    const user = useUser();
    if (user.value.userId === -1) {
        return navigateTo("/auth");  
    }
});