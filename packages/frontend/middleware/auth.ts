export default defineNuxtRouteMiddleware(() => {
    const user = useUser();
    if (user.value.userId === "") {
        return navigateTo("/auth");
    }
});