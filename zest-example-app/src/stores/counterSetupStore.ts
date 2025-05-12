import { defineZestStore, ref } from 'zest-state-library';

export const useCounterSetupStore = defineZestStore('counterSetup', () => {
    const count = ref(0);
    const name = ref('Setup Counter');

    function increment() {
        count.value++;
    }
    function decrement() {
        count.value--;
    }

    return { count, name, increment, decrement };
}); 