import getLinkByAlias from "$lib/server/utils/getLinkByAlias";
import getLinkById from "$lib/server/utils/getLinkById";
import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async (event) => {

    const { params } = event;

    const id = params.id;

    const session = await event.locals.getSession();

    const link = await getLinkById(id) || await getLinkByAlias(id);

    if (!link) {
        throw error(404, {
            message: 'Not Found'
        });
    }

    if (link && link?.ownerId !== session?.user.id) {
        throw error(403, {
            message: "Forbidden"
        });
    }

    return {
        link
    }
};