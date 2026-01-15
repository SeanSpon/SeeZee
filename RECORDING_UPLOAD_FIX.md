# Recording Upload Error Fixes

## Issues Fixed

### 1. ✅ 413 Payload Too Large Error
**Problem**: Uploads were failing with HTTP 413 error because Vercel has a default body size limit.

**Solution**:
- Added Vercel function configuration in `vercel.json` to increase memory and timeout for the upload route
- Set `maxDuration: 300` (5 minutes) and `memory: 3008` (3GB) for large file handling
- Added route segment config in the API route with `maxDuration` setting

**Files Changed**:
- `vercel.json` - Added functions configuration
- `src/app/api/recordings/upload/route.ts` - Added runtime configuration

### 2. ✅ JSON Parse Error on Upload Failure
**Problem**: When uploads failed, the error response (HTML from 413) couldn't be parsed as JSON, causing additional errors.

**Solution**:
- Improved error handling in the XHR upload to catch non-JSON responses
- Added specific error messages for different HTTP status codes:
  - 413: "File is too large. Please upload a file smaller than 500MB."
  - 400: "Invalid file format or size. Please check your file and try again."
  - 500+: "Server error. Please try again later."

**Files Changed**:
- `src/app/admin/recordings/upload/page.tsx` - Enhanced error handling

### 3. ✅ Logo 400 Error
**Problem**: Next.js Image component was failing to optimize the logo image, causing 400 errors.

**Solution**:
- Added `unoptimized` prop to logo images to serve them directly without optimization
- Added `priority` prop to the minimal logo for faster loading
- This prevents Next.js image optimization issues with static assets

**Files Changed**:
- `src/components/Logo.tsx` - Added unoptimized and priority props

## Vercel Limitations

**Important**: While we've configured the route to handle up to 500MB files, Vercel has platform-level limitations:

- **Hobby/Pro plans**: 4.5MB body size limit (API routes)
- **Enterprise plans**: Custom limits available

### Recommended Solutions for Large Files:

1. **Direct Cloud Storage Upload** (Recommended)
   - Use presigned URLs to upload directly to AWS S3, Cloudflare R2, or Google Cloud Storage
   - Avoids going through Vercel's servers entirely
   - Implementation:
     ```typescript
     // 1. Get presigned URL from API
     const { uploadUrl, fileKey } = await fetch('/api/recordings/presigned-url');
     
     // 2. Upload directly to cloud storage
     await fetch(uploadUrl, { method: 'PUT', body: file });
     
     // 3. Notify your API that upload is complete
     await fetch('/api/recordings/complete', { 
       method: 'POST', 
       body: JSON.stringify({ fileKey }) 
     });
     ```

2. **Chunked Upload**
   - Split large files into smaller chunks
   - Upload each chunk separately
   - Reassemble on the server

3. **Use Vercel Blob Storage**
   - Vercel's own solution for large file uploads
   - Handles multipart uploads automatically
   - Works within Vercel's infrastructure

## Testing

1. Try uploading a file under 10MB - should work fine
2. Files 10-100MB may work but will be slow
3. Files over 100MB may timeout or fail due to Vercel limits

## Next Steps

If you need to handle files larger than 10-20MB in production, implement one of the recommended solutions above. The direct cloud storage upload is the most scalable and cost-effective approach.
