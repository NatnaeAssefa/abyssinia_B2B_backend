import { env } from "../../config";
import LogService from "../../services/Log/Log.service";
import sharp from "sharp";
import path from "path";

const watermarkImage = env.WATER_MARK_IMAGE; // Path to your watermark image
const watermarkDarkImage = env.WATER_MARK_IMAGE_DARK; // Path to your watermark image

function addPrefixToFileName(filePath: string, prefix: string = "wm-"): string {
  // Extract the directory, file name, and extension
  const dirName = path.dirname(filePath);
  const extName = path.extname(filePath);
  const baseName = path.basename(filePath, extName);

  // Add the prefix to the file name
  const newFileName = `${prefix}${baseName}${extName}`;

  // Reconstruct the full path
  return path.join(dirName, newFileName);
}

export const addWaterMarkToImage = async (
  filePath: string
): Promise<string | undefined> => {
  try {
    // Analyze input image brightness
    const { dominant } = await sharp(filePath).stats();
    const isDarkImage = dominant.r + dominant.g + dominant.b < 384; // Simple brightness threshold
    const selectedWatermark = isDarkImage ? watermarkImage : watermarkDarkImage;

    // Retrieve metadata for the selected watermark
    const watermarkMetadata = await sharp(selectedWatermark).metadata();
    if (!watermarkMetadata.width || !watermarkMetadata.height) {
      LogService.LogError(`Failed to retrieve watermark dimensions.`);
      return;
    }

    // Retrieve metadata for the input image
    const inputImageMetadata = await sharp(filePath).metadata();
    if (!inputImageMetadata.width || !inputImageMetadata.height) {
      LogService.LogError(`Failed to retrieve input image dimensions.`);
      return;
    }

    // Calculate new dimensions for the watermark
    const scaleFactor = 0.4; // Adjust this factor to control the size of the watermark relative to the input image
    const watermarkWidth = Math.floor(inputImageMetadata.width * scaleFactor);
    const watermarkHeight = Math.floor(
      (watermarkWidth / watermarkMetadata.width) * watermarkMetadata.height
    );

    const resizedWatermarkBuffer = await sharp(selectedWatermark)
      .resize({ width: watermarkWidth, height: watermarkHeight }) // Resize watermark
      .ensureAlpha() // Ensure watermark has an alpha channel
      .toBuffer();

    const watermarkedFilePath = addPrefixToFileName(filePath);

    // Add resized watermark to the center of the original file
    await sharp(filePath)
      .composite([
        {
          input: resizedWatermarkBuffer,
          gravity: "center", // Center the watermark on the image
          blend: "over",
        },
      ])
      .toFile(watermarkedFilePath);

    return watermarkedFilePath;
  } catch (err) {
    LogService.LogError(`Failed to add watermark to the image: ${err}`);
    return;
  }
};
