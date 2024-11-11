import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc'
import { generatePresignedUrl } from '~/server/storage'

export const mediaRouter = createTRPCRouter({
  getUploadUrl: protectedProcedure
    .input(
      z.object({
        filename: z.string(),
        contentType: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const { uploadUrl, publicUrl } = await generatePresignedUrl(
        input.filename,
        input.contentType
      )
      return {
        uploadUrl,
        publicUrl,
      }
    }),
})
