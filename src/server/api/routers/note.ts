import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { checkTopicOwnership, getTopicById } from "./topic";
import { PrismaClient } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { RouterOutputs } from "~/utils/api";

export type Note = RouterOutputs["note"]["getAll"][0];

export const getNoteById = async (id: string, prisma: PrismaClient) => {
  const note = await prisma.note.findUnique({
    where: { id, deleted: false },
  });

  if (!note)
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Note with this ID does not exist",
    });

  return note;
};

export const noteRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(z.object({ topicId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      // check that topic exists and was not deleted and belongs to this user
      const topic = await getTopicById(input.topicId, ctx.prisma);
      await checkTopicOwnership(topic, ctx.session.user.id);

      return await ctx.prisma.note.findMany({
        where: {
          topicId: topic.id,
          deleted: false,
        },
      });
    }),

  create: protectedProcedure
    .input(
      z.object({
        topicId: z.string().min(1),
        title: z.string().min(1),
        content: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // check that topic exists and was not deleted and belongs to this user
      const topic = await getTopicById(input.topicId, ctx.prisma);
      await checkTopicOwnership(topic, ctx.session.user.id);

      return await ctx.prisma.note.create({
        data: {
          topicId: topic.id,
          title: input.title,
          content: input.content,
        },
      });
    }),

  update: protectedProcedure
    .input(z.object({ id: z.string(), title: z.string(), content: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const note = await getNoteById(input.id, ctx.prisma);

      // check that topic exists and was not deleted and belongs to this user
      const topic = await getTopicById(note.topicId, ctx.prisma);
      await checkTopicOwnership(topic, ctx.session.user.id);

      return await ctx.prisma.note.update({
        where: { id: input.id },
        data: { title: input.title, content: input.content },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const note = await getNoteById(input.id, ctx.prisma);

      // check that topic exists and was not deleted and belongs to this user
      const topic = await getTopicById(note.topicId, ctx.prisma);
      await checkTopicOwnership(topic, ctx.session.user.id);

      return await ctx.prisma.note.update({
        where: {
          id: input.id,
        },
        data: {
          deleted: true,
        },
      });
    }),
});
