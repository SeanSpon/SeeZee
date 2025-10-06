"use server";
import { prisma } from "../../../server/db/prisma";
import { revalidatePath } from "next/cache";

export async function createLead(formData: FormData) {
  const name = String(formData.get("name") || "");
  const email = String(formData.get("email") || "");
  const company = String(formData.get("company") || "");
  const message = String(formData.get("message") || "");
  
  if (!name || !email || !message) {
    return { ok: false, error: "Missing required fields" };
  }

  try {
    await prisma.lead.create({ 
      data: { 
        name, 
        email, 
        company: company || null, 
        message 
      } 
    });
    
    revalidatePath("/admin/leads");
    return { ok: true };
  } catch (error) {
    console.error("Error creating lead:", error);
    return { ok: false, error: "Failed to create lead" };
  }
}