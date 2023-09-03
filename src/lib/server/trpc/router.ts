import { ERROR_CODES, REGEX } from "$lib/const";
import { privateProcedure, publicProcedure, t } from "$lib/server/trpc";
import { trpc } from "$lib/trpc/client";
import { z } from 'zod';
import generateId from "$lib/server/utils/generateId";
import { LINK_ID_DEFAULT_LENGTH, LINK_URL_DEFAULT_ENCRYPTION_KEY } from "$env/static/private";
import { decryptAES, encryptAES, hash } from "$lib/utils";

export const router = t.router({

    // This route is responsible for creating new links
    createLink: privateProcedure.input(z.object({
        url: z.string().url(),
        alias: z.string().regex(REGEX.URL_FRIENDLY),
        selfBurn: z.boolean(),
        passwordProtection: z.boolean(),
        password: z.string(),
        requiresAuth: z.boolean()
    })).query(async ({ ctx, input }) => {
        console.log("input?", input);

        const user = ctx.session.user!;

        // pre-validation
        if (input.passwordProtection === true && !input.password) {
            return {
                error: true,
                code: ERROR_CODES.BAD_REQUEST,
                message: 'Password is required'
            } as const;
        }

        if (input.alias) {
            const isAliasAvailable = await trpc(ctx.event).isAliasAvailable.query(input.alias);

            // checking if alias is available
            if (!isAliasAvailable) {
                return {
                    error: true,
                    code: ERROR_CODES.BAD_REQUEST,
                    message: 'Alias is already in-use'
                } as const;
            }
        }


        const id = await generateId(parseInt(LINK_ID_DEFAULT_LENGTH || '4'));

        // created document
        const link = await ctx.prisma.link.create({
            data: {
                id,
                url: encryptAES(input.url, LINK_URL_DEFAULT_ENCRYPTION_KEY),
                passwordProtection: input.passwordProtection,
                password: input.passwordProtection ? hash(input.password) : null,
                alias: input.alias || null,
                selfBurn: input.selfBurn,
                requiresAuth: input.requiresAuth,
                owner: {
                    connect: {
                        id: user.id as string
                    }
                }
            }
        });

        return {
            error: false,
            code: 'DONE',
            message: 'Link created',
            data: {
                id: link.id
            } as const
        }
    }),


    // this route is responsible for checking if given alias is available
    // or not
    isAliasAvailable: privateProcedure
        .input(z.string())
        .query(async ({ ctx, input }) => {

            const link = await ctx.prisma.link.findFirst({
                where: {
                    alias: input
                }
            })

            if (link) {
                return false;
            }

            return true;
        }),

    decryptURL: publicProcedure
        .input(z.string())
        .query(async ({ ctx, input }) => {
            return decryptAES(input, LINK_URL_DEFAULT_ENCRYPTION_KEY);
        }),

    registerRedirect: publicProcedure
        .input(z.object({
            linkId: z.string(),
        }))
        .query(async ({ ctx, input }) => {
            const ip = ctx.event.getClientAddress() || null;
            const user = ctx.session?.user || null;

            const link = await ctx.prisma.link.findFirst({
                where: {
                    id: input.linkId
                },
                include: {
                    redirects: true
                }
            })

            if (!link) {
                return null;
            }

            if (link.selfBurn && link.redirects.length === 0) {
                return await ctx.prisma.link.delete({
                    where: {
                        id: input.linkId
                    }
                });
            }

            return await ctx.prisma.redirect.create({
                data: {
                    link: {
                        connect: {
                            id: input.linkId
                        }
                    },
                    ip,
                    visitor: user ? {
                        connect: {
                            id: user?.id
                        }
                    } : undefined,
                }
            })
        })

});

export type Router = typeof router;