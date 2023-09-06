import { prisma } from "$lib/server/db";
import computeLinkStats from "$lib/server/utils/computeLinkStats";
import type { RequestHandler } from "./$types";
import { kv } from "@vercel/kv";

export const GET: RequestHandler = async (event) => {

    const KV_PREVIOUS_REDIRECT_COUNTS_KEY = '__go_api_compute_stats_previous_redirects_count'

    const kvPreviousRedirectCounts = await kv.get(KV_PREVIOUS_REDIRECT_COUNTS_KEY);

    const current_redirects = await prisma.redirect.findMany();

    if (kvPreviousRedirectCounts && current_redirects.length === kvPreviousRedirectCounts) {
        return new Response('SAME');
    } else {
        await kv.set(KV_PREVIOUS_REDIRECT_COUNTS_KEY, current_redirects.length);
    }

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