import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { env, hasMedia } from "./env";

const client = hasMedia
  ? new S3Client({
      region: "auto",
      endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: env.R2_ACCESS_KEY_ID!,
        secretAccessKey: env.R2_SECRET_ACCESS_KEY!,
      },
    })
  : null;

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/svg+xml": "svg",
  "image/gif": "gif",
};

export function isMediaEnabled() {
  return hasMedia;
}

/** Envia um arquivo para o R2 e retorna a URL pública. */
export async function uploadMedia(file: Buffer, contentType: string): Promise<string> {
  if (!client) throw new Error("Upload de mídia não configurado (R2)");

  const ext = ALLOWED_TYPES[contentType];
  if (!ext) throw new Error("Tipo de arquivo não permitido");

  const key = `uploads/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  await client.send(
    new PutObjectCommand({
      Bucket: env.R2_BUCKET,
      Key: key,
      Body: file,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable",
    })
  );

  return `${env.R2_PUBLIC_URL}/${key}`;
}
