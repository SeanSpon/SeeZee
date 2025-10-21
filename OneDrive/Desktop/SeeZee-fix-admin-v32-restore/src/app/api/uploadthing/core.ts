import { createUploadthing, type FileRouter } from "uploadthing/next";
import { auth } from "@/auth";

const f = createUploadthing();

// File router for handling uploads
export const ourFileRouter = {
  // Training file uploader (PDFs, videos, etc.)
  trainingUploader: f({
    pdf: { maxFileSize: "32MB", maxFileCount: 1 },
    video: { maxFileSize: "128MB", maxFileCount: 1 },
    image: { maxFileSize: "4MB", maxFileCount: 1 },
  })
    .middleware(async () => {
      const session = await auth();
      
      if (!session?.user || session.user.role !== "CEO") {
        throw new Error("Unauthorized - CEO access required");
      }

      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata.userId);
      console.log("File URL:", file.url);
      return { uploadedBy: metadata.userId, fileUrl: file.url };
    }),

  // Resource file uploader (documents, images)
  resourceUploader: f({
    pdf: { maxFileSize: "16MB", maxFileCount: 1 },
    image: { maxFileSize: "4MB", maxFileCount: 1 },
  })
    .middleware(async () => {
      const session = await auth();
      
      if (!session?.user || session.user.role !== "CEO") {
        throw new Error("Unauthorized - CEO access required");
      }

      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Resource upload complete:", file.url);
      return { uploadedBy: metadata.userId, fileUrl: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
