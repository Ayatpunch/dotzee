import type { Plugin, PluginContextApi, StoreCreatedContext, ActionContext, AfterActionContext } from '../types';
import { getStoreStateSnapshotInternal } from '../../devtools/connector'; // For snapshotting state

// Helper for consistent styling
const logStyle = (style: string) => style;
const styleTitle = logStyle('font-weight: bold; color: #4CAF50;'); // Greenish
const styleLabel = logStyle('font-weight: bold; color: #2196F3;'); // Blueish
const styleValue = logStyle('color: #757575;'); // Greyish
const styleError = logStyle('font-weight: bold; color: #F44336;'); // Reddish

/**
 * A more detailed logger plugin for Dotzee, matching test specifications.
 * Logs store creations, action invocations, and their outcomes with structured output.
 */
export const loggerPlugin: Plugin = {
    name: 'DotzeeLogger',
    install: (context: PluginContextApi) => {
        // Log store creation
        context.onStoreCreated((storeContext: StoreCreatedContext) => {
            const { storeEntry } = storeContext;
            const { id: storeId, instance, isSetupStore, initialStateKeys } = storeEntry;

            console.groupCollapsed(`%c[DotzeeLogger] Store Created: ${storeId}`, styleTitle);
            console.log('%cStore Entry:', styleLabel, storeEntry);

            // Get a snapshot of the initial state *after* potential modifications by other plugins
            const initialStateSnapshot = getStoreStateSnapshotInternal(instance, isSetupStore, initialStateKeys);
            console.log('%cInitial State:', styleLabel, initialStateSnapshot);
            console.groupEnd();
        });

        // Log before action
        context.beforeAction((actionContext: ActionContext) => {
            const { storeEntry, actionName, args } = actionContext;
            const storeId = storeEntry.id;

            console.groupCollapsed(`%c[DotzeeLogger] Action: ${storeId}/${actionName} (before)`, styleTitle);
            console.log('%cStore ID:', styleLabel, storeId);
            console.log('%cAction:', styleLabel, actionName);
            console.log('%cArguments:', styleLabel, args);
            console.groupEnd();
        });

        // Log after action
        context.afterAction((actionContext: AfterActionContext) => {
            const { storeEntry, actionName, args, result, error } = actionContext;
            const { id: storeId, instance, isSetupStore, initialStateKeys } = storeEntry;

            const groupTitle = `%c[DotzeeLogger] Action: ${storeId}/${actionName} (after)${error ? ' - ERROR' : ''}`;
            const titleStyleToUse = error ? styleError : styleTitle;

            console.groupCollapsed(groupTitle, titleStyleToUse);
            console.log('%cStore ID:', styleLabel, storeId);
            console.log('%cAction:', styleLabel, actionName);
            console.log('%cArguments:', styleLabel, args);

            if (error) {
                console.error('%cError:', styleError, error);
            } else {
                console.log('%cResult:', styleLabel, result);
            }

            // Get a snapshot of the current state after the action
            const currentStateSnapshot = getStoreStateSnapshotInternal(instance, isSetupStore, initialStateKeys);
            console.log('%cCurrent State:', styleLabel, currentStateSnapshot);
            console.groupEnd();
        });

        console.log(`%c[${loggerPlugin.name}] Plugin installed.`, styleTitle);
    },
}; 