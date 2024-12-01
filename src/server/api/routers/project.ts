import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const projectRouter = createTRPCRouter({
  createProject: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        githubUrl: z.string(),
        githubToken: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const project = await ctx.db.project.create({
        data: {
          name: input.name,
          githubUrl: input.githubUrl,
          UserToProject: {
            create: {
              // setting ! (non-null assertion operator) because we know the user is authenticated
              userId: ctx.user.userId!,
            },
          },
        },
      });
    }),
  getProjects: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.project.findMany({
      where: {
        UserToProject: {
          some: {
            userId: ctx.user.userId!,
          },
        },
      },
    });
  }),
});
