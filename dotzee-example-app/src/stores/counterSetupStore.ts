import { defineDotzeeStore, ref, computed } from 'dotzee';

export const useCounterSetupStore = defineDotzeeStore('counterSetup', () => {
    const count = ref(0);
    const name = ref('Setup Counter');
    const loading = ref(false);

    // Computed properties (getters)
    const doubledCount = computed(() => count.value * 2);
    const countStatus = computed(() => {
        return count.value === 0 ? 'Zero' : count.value > 0 ? 'Positive' : 'Negative';
    });

    function increment() {
        count.value++;
    }
    function decrement() {
        count.value--;
    }

    async function incrementAsync(delay = 1000) {
        loading.value = true;
        await new Promise(resolve => setTimeout(resolve, delay));
        count.value++;
        loading.value = false;
    }

    return {
        count,
        name,
        loading,
        doubledCount,
        countStatus,
        increment,
        decrement,
        incrementAsync
    };
}); 