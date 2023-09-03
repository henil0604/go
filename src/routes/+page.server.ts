import { prisma } from "$lib/server/db";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async (event) => {
    const { locals } = event;

    const session = await locals.getSession();

    let links = null;

    if (session && session.user) {
        links = await prisma.link.findMany({
            where: {
                owner: {
                    id: session.user.id
                }
            }
        })
    }

    return {
        links
    }
};