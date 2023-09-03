import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async (event) => {
    const { locals } = event;

    const session = await locals.getSession();

    return {
        session
    }
};