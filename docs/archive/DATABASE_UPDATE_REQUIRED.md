# Database Update Instructions

**IMPORTANT**: The Prisma client needs to be regenerated with the new Goal and BlogPost models.

## Steps to Update Database:

1. **Stop the dev server** (press Ctrl+C in the terminal running `npm run dev`)

2. **Regenerate Prisma client**:
   ```bash
   npm run db:generate
   ```

3. **Push schema changes to database**:
   ```bash
   npm run db:push
   ```

4. **Restart the dev server**:
   ```bash
   npm run dev
   ```

After completing these steps, the Goals and Blog pages will work correctly!

## If you encounter errors:

If `npm run db:generate` fails with a file permission error, make sure all Node processes are stopped:

```powershell
# Check for running Node processes
Get-Process | Where-Object { $_.ProcessName -like "*node*" }

# Stop all Node processes (if needed)
Stop-Process -Name "node" -Force
```

Then try the steps again.
