# Dotzee

[![npm version](https://badge.fury.io/js/dotzee.svg)](https://badge.fury.io/js/dotzee)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Dotzee is a Pinia-like reactive state management library for React, built with TypeScript.**

It aims to provide an intuitive and powerful way to manage global and local state in your React applications, offering fine-grained reactivity, strong type safety, and a developer experience inspired by Vue's Pinia.

## Features

*   **Intuitive API:** Define stores using either an Options API (similar to Vue's Options API) or a Setup API (similar to Vue's Composition API).
*   **Reactive Core:** Powered by a Proxy-based reactivity system, ensuring efficient and fine-grained updates.
*   **Standalone Reactivity Primitives:** Includes `ref()` for individual reactive values and `computed()` for derived reactive state.
*   **State:** Manage your application's data in a centralized or modular way.
*   **Getters:** Define derived state that automatically updates when its dependencies change.
*   **Actions:** Encapsulate business logic and state mutations, supporting both synchronous and asynchronous operations.
*   **TypeScript First:** Strong type inference for state, getters, and actions, providing excellent autocompletion and compile-time safety.
*   **DevTools Integration:** Connects with Redux DevTools Extension for state inspection, action tracking, and time-travel debugging.
*   **Server-Side Rendering (SSR):** Built with SSR in mind, allowing for state serialization and hydration.
*   **Plugin System:** Extend Dotzee's functionality with custom plugins.
*   **Lightweight & Performant:** Designed to be efficient and minimally intrusive.

## Installation

```bash
npm install dotzee
# or
yarn add dotzee
```

## Quick Start

Here's how you can quickly get started with Dotzee:

### 1. Define a Store

You can define stores using either the **Options API** or the **Setup API**.

**Options API Example (`src/stores/counterStore.ts`):**

```typescript
import { defineDotzeeStore } from 'dotzee';

export const useCounterOptionsStore = defineDotzeeStore('counterOptions', {
  state: () => ({
    count: 0,
    message: 'Hello Dotzee!',
  }),
  getters: {
    doubleCount: (state) => state.count * 2,
    fullMessage: (state) => \`$\{state.message\} Count is: $\{state.count}\`,
  },
  actions: {
    increment() {
      this.count++;
    },
    decrement() {
      this.count--;
    },
    setMessage(newMessage: string) {
      this.message = newMessage;
    },
    async incrementAsync() {
      await new Promise(resolve => setTimeout(resolve, 100));
      this.increment();
    }
  },
});
```

**Setup API Example (`src/stores/counterSetupStore.ts`):**

```typescript
import { defineDotzeeStore, ref, computed } from 'dotzee';

export const useCounterSetupStore = defineDotzeeStore('counterSetup', () => {
  // State
  const count = ref(0);
  const message = ref('Hello Dotzee Setup!');

  // Getters (Computed)
  const doubleCount = computed(() => count.value * 2);
  const fullMessage = computed(() => \`$\{message.value\} Count is: $\{count.value}\`);

  // Actions
  function increment() {
    count.value++;
  }

  function decrement() {
    count.value--;
  }

  function setMessage(newMessage: string) {
    message.value = newMessage;
  }

  async function incrementAsync() {
    await new Promise(resolve => setTimeout(resolve, 100));
    increment();
  }

  return {
    count,
    message,
    doubleCount,
    fullMessage,
    increment,
    decrement,
    setMessage,
    incrementAsync,
  };
});
```

### 2. Use the Store in a Component

**Using the Options Store (`src/components/CounterOptions.tsx`):**

```tsx
import React from 'react';
import { useCounterOptionsStore } from '../stores/counterStore';

const CounterOptions: React.FC = () => {
  const store = useCounterOptionsStore();

  return (
    <div>
      <h2>Options Store Counter</h2>
      <p>Count: {store.count}</p>
      <p>Double Count: {store.doubleCount}</p>
      <p>Message: {store.fullMessage}</p>
      <button onClick={() => store.increment()}>Increment</button>
      <button onClick={() => store.decrement()}>Decrement</button>
      <button onClick={() => store.incrementAsync()}>Increment Async</button>
      <button onClick={() => store.setMessage('Updated message!')}>Set Message</button>
    </div>
  );
};

export default CounterOptions;
```

**Using the Setup Store (`src/components/CounterSetup.tsx`):**
*(Remember to access `.value` for refs and computed properties)*

```tsx
import React from 'react';
import { useCounterSetupStore } from '../stores/counterSetupStore';

const CounterSetup: React.FC = () => {
  const store = useCounterSetupStore();

  return (
    <div>
      <h2>Setup Store Counter</h2>
      <p>Count: {store.count.value}</p>
      <p>Double Count: {store.doubleCount.value}</p>
      <p>Message: {store.fullMessage.value}</p>
      <button onClick={store.increment}>Increment</button>
      <button onClick={store.decrement}>Decrement</button>
      <button onClick={store.incrementAsync}>Increment Async</button>
      <button onClick={() => store.setMessage('Updated setup message!')}>Set Message</button>
    </div>
  );
};

export default CounterSetup;
```

### 3. Enable DevTools (Optional)

In your application's entry point (e.g., `main.tsx` or `App.tsx`):

```typescript
import { enableDotzeeDevTools, getGlobalDotzeeRegistry } from 'dotzee';

// Only in development
if (process.env.NODE_ENV === 'development') {
  enableDotzeeDevTools(getGlobalDotzeeRegistry());
}
```

## Core Concepts

*   **`defineDotzeeStore`**: The primary function to create new stores.
*   **State**: Reactive data held within your stores.
*   **Getters**: Derived state computed from your store's state.
*   **Actions**: Functions that mutate state, can be synchronous or asynchronous.
*   **Reactivity (`ref`, `computed`)**: Primitives for creating fine-grained reactive data, especially useful in Setup Stores.

## Advanced Topics

*   **DevTools Integration**: Deep dive into debugging with Redux DevTools.
*   **Server-Side Rendering (SSR)**: Learn how to use Dotzee in SSR environments.
*   **Plugins**: Extend Dotzee's capabilities with custom plugins.
*   **TypeScript Usage**: Best practices for leveraging Dotzee with TypeScript.

*https://dotzee.vercel.app*

## Contributing

Contributions are welcome! Please refer to `CONTRIBUTING.md` (if available) or open an issue/pull request.

## License

Dotzee is licensed under the [MIT License](LICENSE). 