import { describe, it, expect, vi } from 'vitest';
import { serializeDotzeeState } from './serialization';
import * as DevtoolsConnector from '../devtools/connector'; // Import module to spy on its exports
import type { DotzeeRegistry } from '../store/types';

describe('serializeDotzeeState', () => {
    it('should call getGlobalDotzeeStateSnapshot with the provided registry', () => {
        // Spy on getGlobalDotzeeStateSnapshot from the devtools connector module
        const getGlobalSnapshotSpy = vi.spyOn(DevtoolsConnector, 'getGlobalDotzeeStateSnapshot');
        // Mock its implementation to avoid actual snapshot logic and just check the call
        getGlobalSnapshotSpy.mockReturnValue({ mock: 'snapshot' });

        const mockRegistry = new Map() as DotzeeRegistry;
        const result = serializeDotzeeState(mockRegistry);

        expect(getGlobalSnapshotSpy).toHaveBeenCalledTimes(1);
        expect(getGlobalSnapshotSpy).toHaveBeenCalledWith(mockRegistry);
        expect(result).toEqual({ mock: 'snapshot' }); // Ensure it returns what the spied function returns

        // Restore the original function
        getGlobalSnapshotSpy.mockRestore();
    });
}); 