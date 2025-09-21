import type { ApiConfig } from "./config";
import type { Video } from "./db/videos";


/** Upload a video to S3 Bucket */
export async function uploadToS3(
    cfg: ApiConfig,
    key: string,
    processesFilePath: string,
    contentType: string
){
    try {
        const videoFile = Bun.file(processesFilePath)
        const s3FilePlaceholder = await cfg.s3Client.file( key, { bucket: cfg.s3Bucket })
        await s3FilePlaceholder.write(videoFile, { type: contentType })
    } catch( error ){
        console.error( "ERROR UPLOAD TO S3", error )
    }
}

/** Deletes Object In S3 bucket */
export async function deleteObjectInS3 (cfg: ApiConfig, fileNameExtKey: string){
    await cfg.s3Client.delete(fileNameExtKey)
}

/* -------------------------------------------------------------------------- */
/*                                   HELPERS                                  */
/* -------------------------------------------------------------------------- */
export async function generatePresignedS3URL(
  cfg: ApiConfig,
  key: string,
  expiresIn: number = 5 * 60,
) {
  try {
    return await cfg.s3Client.presign(`${key}`, { expiresIn });
  } catch( error ){
    console.error('[ S3 ERROR ] - Error on generating presigned URL', error )
  }
}


// Aka. dbVideoToSignedVideo - Pre Sign video URL with temporary access
export async function signDBVideo (cfg: ApiConfig, video: Video){ 
  if( !video?.videoURL ) return video
  const presigned = await generatePresignedS3URL( cfg, video.videoURL )
  video.videoURL = presigned
  return video
}