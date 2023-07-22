import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
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
      return await ctx.prisma.note.findMany({
        where: {
          topic: {
            userId: ctx.session.user.id,
            deleted: false,
          },
          topicId: input.topicId,
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
      const topic = await ctx.prisma.topic.findUnique({
        where: {
          id: input.topicId,
          userId: ctx.session.user.id,
        },
      });

      if (!topic)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Topic with this ID does not exist",
        });

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
      return await ctx.prisma.note.update({
        where: {
          topic: {
            userId: ctx.session.user.id,
            deleted: false,
          },
          id: input.id,
          deleted: false,
        },
        data: { title: input.title, content: input.content },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.note.update({
        where: {
          topic: {
            userId: ctx.session.user.id,
            deleted: false,
          },
          id: input.id,
          deleted: false,
        },
        data: {
          deleted: true,
        },
      });
    }),
});
