
import { CalendarDate, getLocalTimeZone, today } from "@internationalized/date";
import { persisted } from 'svelte-persisted-store';
import { type Writable } from 'svelte/store';

export const oauthAccessToken: Writable<string> = persisted('oauthAccessToken', '');

export const selectedDate: Writable<CalendarDate> = persisted('selectedDate', today(getLocalTimeZone()));