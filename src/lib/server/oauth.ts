import { env } from "$env/dynamic/private";
import { ChurrosClient } from "@inp-net/churros-client";


export const churros = new ChurrosClient({
    client_id: env.CHURROS_CLIENT_ID,
    client_secret: env.CHURROS_CLIENT_SECRET,
    redirect_uri: (process.env.NODE_ENV === "development" ? "http://localhost:5173" : process.env.ORIGIN) + "/login"
});

export async function generateState() : Promise<string> {
    return await Math.random().toString(36).slice(2, 15);
}

export async function login(code: string, token: string) : Promise<string> {
    return await churros.getToken(code, token);
}

export async function identity(token: string) {
    const user = await churros.getUserInfo(token);

    return {
        churros_uid: user.uid,
        churros_email: user.email,
        first_name: user.firstName,
        last_name: user.lastName,
        ...user
    }
}