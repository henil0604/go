import { randomString } from "$lib/utils";
import getLinkById from "./getLinkById";

export default async function generateId(length: number, tries = 0) {

    if (tries >= 5) {
        length++;
    }

    const id = randomString(length);

    const link = await getLinkById(id);

    if (link) {
        return generateId(length, tries + 1);
    }

    return id;
}