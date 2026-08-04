import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env, hasMedia, hasDocumentStorage } from "./env";

const client =
  hasMedia || hasDocumentStorage
    ? new S3Client({
        region: "auto",
        endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId: env.R2_ACCESS_KEY_ID!,
          secretAccessKey: env.R2_SECRET_ACCESS_KEY!,
        },
      })
    : null;

const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/svg+xml": "svg",
  "image/gif": "gif",
  // documentos institucionais públicos (ex.: Código de Ética) também usam este
  // upload — não são sensíveis como os do Portal do Candidato.
  "application/pdf": "pdf",
};

const ALLOWED_DOCUMENT_TYPES: Record<string, string> = {
  ...ALLOWED_IMAGE_TYPES,
  "application/pdf": "pdf",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "application/zip": "zip",
  "application/x-zip-compressed": "zip",
};

export function isMediaEnabled() {
  return hasMedia;
}

export function isDocumentStorageEnabled() {
  return hasDocumentStorage;
}

/** Envia uma imagem pública (site/conteúdo) para o R2 e retorna a URL pública. */
export async function uploadMedia(file: Buffer, contentType: string): Promise<string> {
  if (!client || !hasMedia) throw new Error("Upload de mídia não configurado (R2)");

  const ext = ALLOWED_IMAGE_TYPES[contentType];
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

/**
 * Envia um documento sensível (Portal do Candidato) para o bucket privado do R2.
 * Retorna a chave do objeto (não uma URL pública) — o acesso é feito depois via
 * link assinado de curta duração (ver getDocumentSignedUrl).
 */
export async function uploadDocument(
  file: Buffer,
  contentType: string,
  applicationId: string
): Promise<string> {
  if (!client || !hasDocumentStorage) throw new Error("Armazenamento de documentos não configurado (R2)");

  const ext = ALLOWED_DOCUMENT_TYPES[contentType];
  if (!ext) throw new Error("Tipo de arquivo não permitido");

  const key = `applications/${applicationId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  await client.send(
    new PutObjectCommand({
      Bucket: env.R2_DOCUMENTS_BUCKET,
      Key: key,
      Body: file,
      ContentType: contentType,
    })
  );

  return key;
}

/** Gera um link temporário (15 min) para visualizar/baixar um documento privado. */
export async function getDocumentSignedUrl(key: string): Promise<string> {
  if (!client || !hasDocumentStorage) throw new Error("Armazenamento de documentos não configurado (R2)");

  return getSignedUrl(
    client,
    new GetObjectCommand({ Bucket: env.R2_DOCUMENTS_BUCKET, Key: key }),
    { expiresIn: 15 * 60 }
  );
}
