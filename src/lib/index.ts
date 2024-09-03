// place files you want to import through the `$lib` alias in this folder.

import { z } from "zod";

export const loginScheme = z.object({
    email: z.string().email(),
    password: z.string().min(8),
});

export const registerScheme = z.object({
    first_name: z.string().min(1),
    last_name: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
});

export type FormSchema = typeof loginScheme;