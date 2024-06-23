<script setup lang="ts">
const email = ref("");
const password = ref("");
const userId = useUserId();

async function submitForm() {
    try {
        const res = await fetch("http://localhost:2567/auth", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email.value,
                password: password.value
            }),
        });

        const data = await res.json();

        if (data.success) {
            userId.value = data.userId;
            navigateTo("/dashboard");
        }
    } catch (ex) {
        console.error(ex);
    }
}
</script>

<template>
    <form class="page" @submit.prevent="submitForm">
        <div class="p-4 m-2">
            <h2>Get building and playing on GameForge!</h2>

            <hr>

            <div class="my-3">
                <p class="lead mb-1">Email address</p>
                <input class="form-control" v-model="email" required />
            </div>

            <div class="my-3">
                <p class="lead mb-1">Password</p>
                <input class="form-control" v-model="password" type="password" required />
            </div>

            <button class="my-3 btn btn-success" type="submit">Submit</button>
        </div>
    </form>
</template>