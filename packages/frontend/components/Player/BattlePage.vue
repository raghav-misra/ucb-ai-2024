<script setup lang="ts">
const { prompt, sendPrompt } = usePrompt();
</script>

<template>
    <div class="player-imgs d-flex flex-column align-items-end">
        <div class="d-flex align-items-center">
            <div class="me-4 text-end">
                <h1 class="mb-0 text-shadow">YEAT</h1>
                <p class="lead mb-0 bg-dark d-inline-block p-1 px-2 rounded">HP 18/20</p>
            </div>
            <img class="pfp" src="~/assets/yeat.jpg">
        </div>
        <div class="d-flex align-items-center">
            <div class="me-4 text-end">
                <h1 class="mb-0 text-shadow">SEPTEMBERSRICH</h1>
                <p class="lead mb-0 bg-dark d-inline-block p-1 px-2 rounded">HP 18/20</p>
            </div>
            <img class="pfp" src="~/assets/yeat.jpg">
        </div>
        <div class="d-flex align-items-center">
            <div class="me-4 text-end">
                <h1 class="mb-0 text-shadow">KANKAN</h1>
                <p class="lead mb-0 bg-dark d-inline-block p-1 px-2 rounded">HP 18/20</p>
            </div>
            <img class="pfp" src="~/assets/yeat.jpg">
        </div>
    </div>

    <div class="battle ms-4 ps-4 d-flex flex-column align-items-stretch">
        <div class="bg-black p-4 rounded shadow-lg">
            <h1 class="mb-0 text-center">It's Yeat's turn.</h1>
        </div>
        <div class="city d-flex align-items-end mt-2 p-4 rounded shadow-lg">
            <img class="avatar" src="~/assets/body.png">

            <div class="flex-grow-1 align-self-stretch d-flex flex-column">
                <div class="flex-grow-1 p-3 bg-dark mb-4 rounded shadow border h5">
                    <p>
                        <b>Yeat</b> used special move Thunderbolt! 
                    </p> 
                    <p>
                        <b>KANKAN</b> cursed out SEPTEMBERSRICH!!
                    </p>
                    <p>
                        <b>SEPTEMBERSRICH</b> is thinking...
                    </p>
                </div>
                <div style="position: relative;">
                    <textarea placeholder="What's your move?" v-model.trim="prompt" style="resize: none;"
                    class="lead rounded input-box mb-0 bg-black p-3" @keydown.enter="sendPrompt"></textarea>
                    <span class="enter-icon text-white d-flex align-items-center">↵</span>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.player-imgs {
    gap: 1rem;
}

.text-shadow {
    text-shadow: 0 0 10px black;
}

.pfp {
    width: 7rem;
    height: 7rem;
    border-radius: 50%;
    box-shadow: 0 0 5px black;
}

.city {
    width: 35rem;
    height: 25rem;
    background-image: url(~/assets/city.png);
    background-position: center center;
    background-size: cover;
}

.avatar {
    height: 86%;
}

.input-box {
    border: none;
    outline: none;
    color: white;
    width: 100%;
    padding-right: 3rem !important;
    height: 5rem;
    line-height: 1.25rem;
}

.enter-icon {
    position: absolute;
    bottom: 0;
    top: 0;
    right: 1rem;
    pointer-events: none;
    font-size: 2rem;
}
</style>