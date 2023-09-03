import getLinkByAlias from "$lib/server/utils/getLinkByAlias";
import getLinkById from "$lib/server/utils/getLinkById";
import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";


export const load: PageServerLoad = async (event) => {
    const { params } = event;

    // getting id
    const id = params.id

    const link = await getLinkById(id) || await getLinkByAlias(id);

    console.log("link?", link);

    return {
        link
    }
};