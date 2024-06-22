<script setup lang="ts">
const emit = defineEmits<{
    (e: "next"): void;
}>();
</script>


<template>
    <BuilderBasePage title="Map and locations" description="Describe events that trigger on certain statistics (ex. death when health ≤
 0).">
        <template v-slot:content>
            <div class="p-4 bg-light rounded border">
                <h5 class="mb-0">When <select class="d-inline-block form-select form-select-sm" style="width: unset;">
                    <option value="twizz">health</option>
                </select> is <select class="d-inline-block form-control form-control-sm" style="width: unset;">
                    <option value="twizz">=</option>
                    <option value="twizz">></option>
                    <option value="twizz">≥</option>
                    <option value="twizz"><</option>
                    <option value="twizz">≤</option>
                </select> <input type="number" class="d-inline-block form-control form-control-sm" style="width: unset;">:</h5>
                <small><i>(describe what happens below)</i></small>
                <textarea class="form-control mt-1" placeholder="bro is cooked"></textarea>
            </div>
        </template>
        <template v-slot:buttons>
            <button class="btn btn-success">Publish game!</button>
        </template>
    </BuilderBasePage>
</template>