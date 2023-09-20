import getLinkByAlias from "$lib/server/utils/getLinkByAlias";
import getLinkById from "$lib/server/utils/getLinkById";
import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { trpc } from "$lib/trpc/client";

export const load: PageServerLoad = async (event) => {
    const { params } = event;

    // getting id
    const id = params.id

    const link = await getLinkById(id) || await getLinkByAlias(id);

    console.log("link?", link);

    // if link does not require password and link also does not require any authentication, just redirect the user from the server
    if (link && link?.passwordProtection === false && link.requiresAuth === false) {
        const decryptedUrl = await trpc(event).decryptURL.query(link.url);

        await trpc(event).registerRedirect.query({
            linkId: link.id
        });

        throw redirect(301, decryptedUrl);
    }

    return {
        link
    }
};