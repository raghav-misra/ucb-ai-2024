<script setup lang="ts">
const emit = defineEmits<{
    (e: "next"): void;
}>();
</script>

<template>
    <BuilderBasePage title="Overview" description="Give your game a name, a description, and some theme information to customize it.">
        <template v-slot:content>
            <div class="my-3">
                <h5>Game name</h5>
                <input type="text" class="form-control" placeholder="twizz bizz, the return of yeat">
            </div>
            <div class="my-3" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div>
                    <h5>Game description</h5>
                    <textarea class="form-control" placeholder="twizz bizz tonka chonka."></textarea>
                </div>   
                <div>
                    <h5>Theme keywords</h5>
                    <textarea class="form-control" placeholder="ex. fantasy, spooky, etc"></textarea>
                </div>                
            </div>
        </template>
        <template v-slot:buttons>
            <button class="btn btn-primary" @click="emit('next')">Next Page (Locations)</button>
        </template>
    </BuilderBasePage>
</template>