/**
 * Export Vault entries to .env.local
 * Reads encrypted API keys from database and writes them to .env.local
 */

const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

const VAULT_KEY = process.env.VAULT_ENCRYPTION_KEY || process.env.AUTH_SECRET || "";
const ALGORITHM = "aes-256-cbc";

function decrypt(encryptedText) {
  const key = crypto.scryptSync(VAULT_KEY, "salt", 32);
  const [ivHex, encrypted] = encryptedText.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

async function exportVaultToEnv() {
  try {
    console.log("📦 Fetching vault entries...");
    
    const entries = await prisma.vaultEntry.findMany({
      where: {
        scope: "GLOBAL"
      }
    });

    console.log(`✅ Found ${entries.length} vault entries`);

    let envContent = "# Environment Variables exported from Vault\n";
    envContent += `# Generated: ${new Date().toISOString()}\n\n`;

    for (const entry of entries) {
      try {
        const decryptedValue = decrypt(entry.encryptedValue);
        envContent += `${entry.key}=${decryptedValue}\n`;
        console.log(`  ✓ ${entry.key}`);
      } catch (error) {
        console.error(`  ✗ Failed to decrypt ${entry.key}:`, error.message);
      }
    }

    const envPath = path.join(__dirname, '..', '.env.local');
    fs.writeFileSync(envPath, envContent);
    
    console.log(`\n✅ Exported ${entries.length} keys to .env.local`);
    console.log(`📁 Location: ${envPath}`);
    
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

exportVaultToEnv();
