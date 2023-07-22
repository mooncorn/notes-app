import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { RouterOutputs } from "~/utils/api";

export type Topic = RouterOutputs["topic"]["getAll"][0];

export const topicRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.topic.findMany({
      where: { userId: ctx.session.user.id, deleted: false },
    });
  }),

  create: protectedProcedure
    .input(z.object({ title: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.topic.create({
        data: { title: input.title, userId: ctx.session.user.id },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      // delete topic
      const topic = await ctx.prisma.topic.update({
        where: { id: input.id, userId: ctx.session.user.id, deleted: false },
        data: {
          deleted: true,
        },
      });

      // delete all related notes
      await ctx.prisma.note.updateMany({
        where: {
          topicId: topic.id,
          deleted: false,
        },
        data: {
          deleted: true,
        },
      });

      return topic;
    }),
});
