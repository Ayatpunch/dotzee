import { defineDotzeeStore } from 'dotzee'; // Assuming linked package name

// Define the state type for better type inference in getters
interface CounterState {
    count: number;
    name: string;
    loading: boolean;
}

export const useCounterOptionsStore = defineDotzeeStore('counterOptions', {
    state: () => ({
        count: 0,
        name: 'Options Counter',
        loading: false,
    }),
    getters: {
        doubledCount: (state: CounterState) => state.count * 2,
        countStatus: (state: CounterState) => state.count === 0 ? 'Zero' : state.count > 0 ? 'Positive' : 'Negative',
    },
    actions: {
        increment() {
            this.count++;
        },
        decrement() {
            this.count--;
        },
        async incrementAsync(delay = 1000) {
            this.loading = true;
            await new Promise(resolve => setTimeout(resolve, delay));
            this.count++;
            this.loading = false;
        },
    },
}); 