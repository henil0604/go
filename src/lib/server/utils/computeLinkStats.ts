import { prisma } from "$lib/server/db";
import type { Redirect } from "@prisma/client";

function getUniqueVisitors(redirects: Redirect[]) {
    let unique: Redirect[] = [];

    for (const redirect of redirects) {
        if (unique.find(e => e.visitorId && e.visitorId === redirect.visitorId)) {
            continue;
        }

        if (unique.find(e => e.ip && e.ip === redirect.ip)) {
            continue;
        }

        unique.push(redirect);
    }

    return unique;
}

export default async function computeLinkStats(linkId: string) {

    const link = await prisma.link.findFirst({
        where: {
            OR: [
                {
                    id: linkId
                },
                {
                    alias: linkId
                }
            ]
        },
        include: {
            redirects: true
        }
    })

    if (!link) {
        return null
    }

    const redirect_count = link.redirects.length || link.redirect_count || 0;

    const unique_visitors = getUniqueVisitors(link.redirects);

    const unique_visitor_count = unique_visitors.length;

    return {
        redirect_count,
        unique_visitor_count
    }
}