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
    confirmPassword: z.string().min(8)
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

// TODO : add date range check
export const slotScheme = z.object({
    title: z.string().min(5),
    description: z.string().min(5),
    capacity: z.number().int().positive(),
    date: z.object({
        starts_at: z.string(),//z.date(),
        ends_at: z.string()//z.date()
    })
});

export type FormSchema = typeof loginScheme;