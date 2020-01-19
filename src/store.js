import { writable } from 'svelte/store';

export const storeData = writable({});
export const globalSelectedVersion = writable('');
export const versionList = writable([]);
export const activityGroup = writable('');
export const activityItem = writable('');
export const lang = writable({});