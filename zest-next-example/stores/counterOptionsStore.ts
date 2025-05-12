import { defineZestStore } from 'zest-state-library';

interface CounterState {
    count: number;
    name: string;
    loading: boolean;
}

export const useCounterOptionsStore = defineZestStore('counterOptions', {
    state: (): CounterState => ({
        count: 0,
        name: 'Next.js Options Counter',
        loading: false
    }),
    actions: {
        increment(this: CounterState) {
            this.count++;
        },
        decrement(this: CounterState) {
            this.count--;
        },
        set(this: CounterState, value: number) {
            this.count = value;
        },
        async incrementAsync(this: CounterState, delay: number = 1000) {
            this.loading = true;
            await new Promise(resolve => setTimeout(resolve, delay));
            this.count++;
            this.loading = false;
        }
    },
    getters: {
        doubled: (state: CounterState) => state.count * 2,
        countStatus: (state: CounterState) =>
            state.count === 0 ? 'Zero' : state.count > 0 ? 'Positive' : 'Negative',
    }
}); 