import { prisma } from "$lib/server/db";
import computeLinkStats from "$lib/server/utils/computeLinkStats";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async (event) => {

    const links = await prisma.link.findMany();

    for (const link of links) {
        let stats = await computeLinkStats(link.id);

        if (!stats) continue;

        await prisma.link.update({
            where: {
                id: link.id,
            },
            data: {
                redirect_count: stats.redirect_count,
                unique_visitor_count: stats.unique_visitor_count
            }
        })
    }

    return new Response();
};