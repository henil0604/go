import { prisma } from "$lib/server/db";

export default function getLinkByAlias(alias: string) {
    return prisma.link.findFirst({
        where: {
            alias
        }
    });
}