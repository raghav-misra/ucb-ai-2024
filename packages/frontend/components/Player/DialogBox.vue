<template>
    <div class="dialog-box-container">
        <div class="dialog-box p-4 bg-black text-center">
            <h2>THE WORLD 🌎</h2>
            <h4 class="fst-italic">You failed to examine your glock. You don't even own a glock!</h4>

            <button class="btn btn-black btn-lg">[ okay ]</button>
        </div>
    </div>
</template>

<style scoped>
.dialog-box-container {
    position: absolute;
    bottom: 2rem;
    left: 0;
    right: 0;
    display: flex;
    justify-content: center;
}

.dialog-box {
    width: 75%;
    border: 2px white solid;
    box-shadow: -0.5rem -0.5rem 2rem black, 0.5rem 0.5rem 2rem black;
}
</style>