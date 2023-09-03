import { prisma } from "$lib/server/db";

export default function getLinkById(id: string) {
    return prisma.link.findFirst({
        where: {
            id
        }
    });
}