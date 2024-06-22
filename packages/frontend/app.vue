<template>
    <main>
        <header class="bg-black p-3 d-flex">
            <h1 class="h3 text-white">TwizzApp</h1>
            <div class="ms-auto">
                <input type="text" class="form-control" placeholder="Search games...">
            </div>
        </header>
        <NuxtPage />
    </main>
</template>

<style scoped>
main {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}
</style>