import { PrismaClient } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { RouterOutputs } from "~/utils/api";

export type Topic = RouterOutputs["topic"]["getAll"][0];

export const getTopicById = async (id: string, prisma: PrismaClient) => {
  const topic = await prisma.topic.findUnique({
    where: { id, deleted: false },
  });

  if (!topic)
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Topic with this ID does not exist",
    });

  return topic;
};

export const checkTopicOwnership = async (
  topic: Topic,
  currentUserId: string
) => {
  if (topic.userId !== currentUserId)
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Cannot access other users topics",
    });
};

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
      const topic = await getTopicById(input.id, ctx.prisma);
      checkTopicOwnership(topic, ctx.session.user.id);

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

      // delete topic
      return await ctx.prisma.topic.update({
        where: { id: input.id, userId: ctx.session.user.id },
        data: {
          deleted: true,
        },
      });
    }),
});
