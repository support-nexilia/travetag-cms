import crypto from 'node:crypto';
import { buffer } from 'node:stream/consumers';
import {
  CopyObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import {
  BASEURL_MEDIA,
  BUNNY_STREAM_API_KEY,
  BUNNY_STREAM_CDN_URL,
  BUNNY_STREAM_LIBRARY_ID,
  OBJECT_STORAGE_ACCESS_KEY,
  OBJECT_STORAGE_BUCKET,
  OBJECT_STORAGE_ENDPOINT,
  OBJECT_STORAGE_REGION,
  OBJECT_STORAGE_SECRET_KEY,
} from '@/lib/env';

export type MediaImage = {
  path: string;
  sizes: {
    s?: string;
    xl?: string;
  };
};

export type MediaVideo = {
  path: string;
  formats: {
    m3u?: string;
    mp4?: string;
  };
};

export type PresignedUpload = {
  key: string;
  uploadUrl: string;
  headers: Record<string, string>;
};

type MediaType = 'image' | 'video';

const IMAGE_SIZE_PRESETS = {
  s: 640,
  xl: 1600,
};

const requireValue = (key: string, value: string) => {
  if (!value) {
    throw new Error(`${key} environment variable is not defined`);
  }
  return value;
};

const objectStorageEndpoint = requireValue('OBJECT_STORAGE_ENDPOINT', OBJECT_STORAGE_ENDPOINT);
const objectStorageAccessKey = requireValue('OBJECT_STORAGE_ACCESS_KEY', OBJECT_STORAGE_ACCESS_KEY);
const objectStorageSecretKey = requireValue('OBJECT_STORAGE_SECRET_KEY', OBJECT_STORAGE_SECRET_KEY);
const objectStorageBucket = requireValue('OBJECT_STORAGE_BUCKET', OBJECT_STORAGE_BUCKET)
  .replace(/^['"]|['"]$/g, '')
  .replace(/^\/+|\/+$/g, '');
const objectStorageRegion = OBJECT_STORAGE_REGION;
const baseMediaUrl = requireValue('BASEURL_MEDIA', BASEURL_MEDIA);

const bunnyStreamApiKey = BUNNY_STREAM_API_KEY;
const bunnyStreamLibraryId = BUNNY_STREAM_LIBRARY_ID;
const bunnyStreamCdnUrl = BUNNY_STREAM_CDN_URL;

const s3 = new S3Client({
  region: objectStorageRegion,
  endpoint: objectStorageEndpoint,
  credentials: {
    accessKeyId: objectStorageAccessKey,
    secretAccessKey: objectStorageSecretKey,
  },
  forcePathStyle: false,
});

const normalizePath = (value: string) => value.replace(/\\/g, '/').replace(/^\/+/, '');

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const stripBucketPrefix = (value: string) => {
  const normalized = value.replace(/\\/g, '/');
  const bucketPrefix = new RegExp(`^/?${escapeRegex(objectStorageBucket)}/+`);
  const cleaned = normalized.replace(bucketPrefix, '');
  return cleaned.replace(bucketPrefix, '');
};

const encodeCopySource = (bucket: string, key: string, leadingSlash = true) => {
  const encodedKey = encodeURIComponent(key).replace(/%2F/g, '/');
  return `${leadingSlash ? '/' : ''}${bucket}/${encodedKey}`;
};

const joinUrl = (base: string, path: string) => {
  const trimmedBase = base.replace(/\/+$/, '');
  const trimmedPath = normalizePath(path);
  return `${trimmedBase}/${trimmedPath}`;
};

const getExtension = (filename?: string, contentType?: string) => {
  if (filename && filename.includes('.')) {
    return `.${filename.split('.').pop()}`;
  }
  if (contentType === 'image/jpeg') return '.jpg';
  if (contentType === 'image/png') return '.png';
  if (contentType === 'image/webp') return '.webp';
  if (contentType === 'image/svg+xml') return '.svg';
  if (contentType === 'video/mp4') return '.mp4';
  if (contentType === 'video/quicktime') return '.mov';
  return '';
};

const buildOptimizerUrl = (path: string, width: number) => {
  const cleanPath = stripBucketPrefix(path);
  const url = joinUrl(baseMediaUrl, cleanPath);
  const params = new URLSearchParams({
    width: width.toString(),
    quality: '80',
    format: 'webp',
  });
  return `${url}?${params.toString()}`;
};

const buildImageSizes = (path: string, contentType?: string) => {
  const cleanPath = stripBucketPrefix(path);
  if (contentType === 'image/svg+xml' || path.toLowerCase().endsWith('.svg')) {
    const url = joinUrl(baseMediaUrl, cleanPath);
    return {
      s: url,
      xl: url,
    };
  }
  return {
    s: buildOptimizerUrl(cleanPath, IMAGE_SIZE_PRESETS.s),
    xl: buildOptimizerUrl(cleanPath, IMAGE_SIZE_PRESETS.xl),
  };
};

export async function createPresignedUpload({
  filename,
  contentType,
  tmpPrefix = 'tmp',
}: {
  filename: string;
  contentType: string;
  tmpPrefix?: string;
}): Promise<PresignedUpload> {
  const ext = getExtension(filename, contentType);
  const date = new Date().toISOString().split('T')[0];
  const cleanPrefix = stripBucketPrefix(tmpPrefix);
  const rawKey = normalizePath(`${cleanPrefix}/${date}/${crypto.randomUUID()}${ext}`);
  const key = normalizePath(stripBucketPrefix(stripBucketPrefix(rawKey)));

  const command = new PutObjectCommand({
    Bucket: objectStorageBucket,
    Key: key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 60 * 5 });

  return {
    key,
    uploadUrl,
    headers: {
      'Content-Type': contentType,
    },
  };
}

export async function createPresignedDownloadUrl(key: string, expiresIn = 60 * 30) {
  const command = new GetObjectCommand({
    Bucket: objectStorageBucket,
    Key: key,
  });
  return getSignedUrl(s3, command, { expiresIn });
}

const resolveExistingKey = async (sourceKey: string) => {
  const normalized = normalizePath(sourceKey);
  const candidates = Array.from(
    new Set(
      [
        sourceKey,
        normalized,
        `/${normalized}`,
        `${objectStorageBucket}/${normalized}`,
        `/${objectStorageBucket}/${normalized}`,
      ].filter(Boolean),
    ),
  );

  for (const candidate of candidates) {
    try {
      await s3.send(
        new HeadObjectCommand({
          Bucket: objectStorageBucket,
          Key: candidate,
        }),
      );
      return candidate;
    } catch {
      // try next candidate
    }
  }

  throw new Error(`Source object not found: ${normalized}`);
};

const streamCopyObject = async (sourceKey: string, destinationKey: string) => {
  const source = await s3.send(
    new GetObjectCommand({
      Bucket: objectStorageBucket,
      Key: sourceKey,
    }),
  );

  if (!source.Body) {
    throw new Error(`Empty body while copying ${sourceKey}`);
  }

  const bodyBuffer = await buffer(source.Body as any);

  await s3.send(
    new PutObjectCommand({
      Bucket: objectStorageBucket,
      Key: destinationKey,
      Body: bodyBuffer,
      ContentType: source.ContentType,
      ContentLength: bodyBuffer.length,
    }),
  );
};

export async function moveObject(sourceKey: string, destinationKey: string) {
  const normalizedDestination = normalizePath(stripBucketPrefix(destinationKey));
  const maxAttempts = 3;

  const resolvedSource = await resolveExistingKey(sourceKey);
  const copySources = [
    encodeCopySource(objectStorageBucket, resolvedSource, true),
    encodeCopySource(objectStorageBucket, resolvedSource, false),
  ];

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    for (const copySource of copySources) {
      try {
        await s3.send(
          new CopyObjectCommand({
            Bucket: objectStorageBucket,
            CopySource: copySource,
            Key: normalizedDestination,
          }),
        );

        await s3.send(
          new DeleteObjectCommand({
            Bucket: objectStorageBucket,
            Key: resolvedSource,
          }),
        );
        return;
      } catch (error) {
        if (attempt === maxAttempts - 1 && copySource === copySources[copySources.length - 1]) {
          try {
            await streamCopyObject(resolvedSource, normalizedDestination);
            await s3.send(
              new DeleteObjectCommand({
                Bucket: objectStorageBucket,
                Key: resolvedSource,
              }),
            );
            return;
          } catch (streamError: any) {
            throw new Error(
              `Copy failed for ${resolvedSource} -> ${normalizedDestination} (CopySource: ${copySource}). Stream fallback error: ${streamError?.message || streamError}`,
            );
          }
        }
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 300 * (attempt + 1)));
  }

  return;
}

export async function finalizeImage({
  tmpKey,
  entity,
  entityId,
  field,
  filename,
  contentType,
}: {
  tmpKey: string;
  entity: string;
  entityId: string;
  field: string;
  filename?: string;
  contentType?: string;
}): Promise<MediaImage> {
  const ext = getExtension(filename, contentType) || '.jpg';
  const finalKey = normalizePath(
    `images/${entity}/${entityId}/${field}/${crypto.randomUUID()}${ext}`,
  );

  const cleanedFinalKey = normalizePath(stripBucketPrefix(finalKey));
  await moveObject(stripBucketPrefix(tmpKey), cleanedFinalKey);

  return {
    path: cleanedFinalKey,
    sizes: buildImageSizes(cleanedFinalKey, contentType),
  };
}

const buildBunnyStreamUrls = (videoId: string) => {
  if (!bunnyStreamCdnUrl) {
    return {};
  }
  const base = bunnyStreamCdnUrl.replace(/\/+$/, '');
  return {
    m3u: `${base}/${videoId}/playlist.m3u8`,
    mp4: `${base}/${videoId}/play.mp4`,
  };
};

const registerBunnyStreamVideo = async (sourceUrl: string, title: string) => {
  if (!bunnyStreamApiKey || !bunnyStreamLibraryId) {
    throw new Error('Bunny Stream configuration is missing');
  }

  const response = await fetch(
    `https://video.bunnycdn.com/library/${bunnyStreamLibraryId}/videos/fetch`,
    {
      method: 'POST',
      headers: {
        AccessKey: bunnyStreamApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: sourceUrl, title }),
    },
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Bunny Stream fetch failed: ${response.status} ${body}`);
  }

  const data = await response.json();
  const videoId = data.guid || data.videoId || data.id;
  if (!videoId) {
    throw new Error('Bunny Stream response missing video id');
  }
  return videoId as string;
};

export async function finalizeVideo({
  tmpKey,
  entity,
  entityId,
  field,
  filename,
  contentType,
}: {
  tmpKey: string;
  entity: string;
  entityId: string;
  field: string;
  filename?: string;
  contentType?: string;
}): Promise<MediaVideo> {
  const ext = getExtension(filename, contentType) || '.mp4';
  const finalKey = normalizePath(
    `videos/${entity}/${entityId}/${field}/${crypto.randomUUID()}${ext}`,
  );

  const cleanedFinalKey = normalizePath(stripBucketPrefix(finalKey));
  await moveObject(stripBucketPrefix(tmpKey), cleanedFinalKey);

  const signedUrl = await createPresignedDownloadUrl(finalKey);
  const title = `${entity}-${entityId}-${field}`;
  const bunnyId = await registerBunnyStreamVideo(signedUrl, title);

  return {
    path: cleanedFinalKey,
    formats: buildBunnyStreamUrls(bunnyId),
  };
}

export async function finalizeMedia({
  mediaType,
  tmpKey,
  entity,
  entityId,
  field,
  filename,
  contentType,
}: {
  mediaType: MediaType;
  tmpKey: string;
  entity: string;
  entityId: string;
  field: string;
  filename?: string;
  contentType?: string;
}) {
  if (mediaType === 'video') {
    return finalizeVideo({ tmpKey, entity, entityId, field, filename, contentType });
  }
  return finalizeImage({ tmpKey, entity, entityId, field, filename, contentType });
}
