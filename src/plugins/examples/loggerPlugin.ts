import type { Plugin, PluginContextApi, StoreCreatedContext, ActionContext, AfterActionContext } from '../types';

/**
 * A simple logger plugin for Zest.
 * Logs store creations, action invocations, and their outcomes.
 */
export const loggerPlugin: Plugin = {
    name: 'ZestLogger',
    install: (context: PluginContextApi) => {
        // Log store creation
        context.onStoreCreated((storeContext: StoreCreatedContext) => {
            console.log(`[${loggerPlugin.name}] Store Created: "${storeContext.storeEntry.id}"`, {
                instance: storeContext.storeEntry.instance,
                isSetup: storeContext.storeEntry.isSetupStore,
            });
        });

        // Log before action
        context.beforeAction((actionContext: ActionContext) => {
            console.log(
                `[${loggerPlugin.name}] Before Action: "${actionContext.storeEntry.id}/${actionContext.actionName}"`,
                {
                    args: actionContext.args,
                }
            );
        });

        // Log after action
        context.afterAction((afterActionContext: AfterActionContext) => {
            if (afterActionContext.error) {
                console.error(
                    `[${loggerPlugin.name}] After Action (Error): "${afterActionContext.storeEntry.id}/${afterActionContext.actionName}"`,
                    {
                        args: afterActionContext.args,
                        error: afterActionContext.error,
                    }
                );
            } else {
                console.log(
                    `[${loggerPlugin.name}] After Action (Success): "${afterActionContext.storeEntry.id}/${afterActionContext.actionName}"`,
                    {
                        args: afterActionContext.args,
                        result: afterActionContext.result,
                    }
                );
            }
        });

        console.log(`[${loggerPlugin.name}] Plugin installed.`);
    },
}; 