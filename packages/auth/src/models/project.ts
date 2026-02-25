import { z } from "zod"

export const projectSchema = z.object({
  id: z.string(),
  ownerId: z.string(),
})

export type Project = z.infer<typeof projectSchema>
