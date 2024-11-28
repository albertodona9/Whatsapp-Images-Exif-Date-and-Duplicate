import { mismatchedPhoto } from "@/utils/interfaces";
import { readAsync, writeAsync, ExifTags } from "@lodev09/react-native-exify";
import * as FileSystem from "expo-file-system";
import RNFS from "react-native-fs";
import { PermissionsAndroid } from "react-native";
import DocumentPicker from "react-native-document-picker";

/**
 * Error safe JSON.stringify
 */
export const json = (value?: unknown, space = 2): string => {
  try {
    return JSON.stringify(value, undefined, space);
  } catch (e) {
    return String(value);
  }
};

/**
 * Extracts FileName from uri
 * @returns string
 */
export function getFileNameFromUri(uri: string): string {
  return decodeURIComponent(uri)?.split(":").pop() || "Error";
}

/**
 * Parses YYYYMMDD date string to Date object
 * @returns Date
 */
export function parseYYYYMMDD(dateString: string): Date {
  const year = parseInt(dateString.substring(0, 4));
  const month = parseInt(dateString.substring(4, 6)) - 1; // months are 0-based
  const day = parseInt(dateString.substring(6, 8));
  return new Date(year, month, day);
}

/**
 * Parses YYYYMMDD string to YYYY:mm:dd HH:MM:SS string
 * @returns String
 */
export function parseExifDateString(dateString: string): string {
  const year = parseInt(dateString.substring(0, 4));
  const month = parseInt(dateString.substring(4, 6))
    .toString()
    .padStart(2, "0");
  const day = parseInt(dateString.substring(6, 8)).toString().padStart(2, "0");
  return `${year}:${month}:${day} 00:00:00`;
}
/**
 * Parses YYYYMMDD string to YYYY:mm:dd HH:MM:SS+HH:MM string
 * @returns String
 */
export function parseExifDateStringWithOffset(dateString: Date): string {
  const year = dateString.getFullYear();
  const month = (dateString.getMonth() + 1).toString().padStart(2, "0");
  const day = dateString.getDate().toString().padStart(2, "0");
  const offset = dateString.getTimezoneOffset();
  let offsetHours = Math.floor(offset / 60).toString();
  if (offsetHours[0] === "-") {
    offsetHours =
      offsetHours[0] + offsetHours[offsetHours.length - 1].padStart(2, "0");
  } else {
    offsetHours = "+" + offsetHours.padStart(2, "0");
  }
  const offsetMins = (offset % 60).toString().padStart(2, "0");
  return `${year}:${month}:${day} 00:00:00${offsetHours}:${offsetMins}`;
}

/**
 * Extracts YYYYMMDD date string from uri
 * @returns Date
 */
export function getFileNameDateFromUri(uri: string): Date {
  const match = uri.match(/-(\d{8})-/);
  const dateString = match ? match[1] : null;
  console.log(
    `[getFileNameDateFromUri] dateString matched: ${
      dateString ? parseYYYYMMDD(dateString) : "None"
    }`
  );
  return dateString ? parseYYYYMMDD(dateString) : new Date(0);
}

/**
 * Extracts YYYY:mm:dd HH:MM:SS date string from uri
 * @returns String
 */
export function getExifDateFromUri(uri: string): string {
  const match = uri.match(/-(\d{8})-/);
  const exifDateString = match ? match[1] : null;
  if (exifDateString) {
    return parseExifDateString(exifDateString);
  } else {
    throw new Error("No date string found in the name");
  }
}

/**
 * Extracts YYYY:mm:dd HH:MM:SS+HH:MM date  from uri
 * @returns Date
 */
export function getExifDateFromUriWithOffset(uri: string): string {
  const fileNameDate = getFileNameDateFromUri(uri);
  if (fileNameDate) {
    return parseExifDateStringWithOffset(fileNameDate);
  } else {
    throw new Error("No date string found in the name");
  }
}

/**
 * Still developing;
 * Count Photos with date modified attributes mismatched with Filename date
 * input: folderUri, format: ""
 */
export async function countMismatchedPhotos(
  folderUri: string
): Promise<[mismatchedPhoto[], string[]]> {
  await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
    {
      title: "Storage Permission",
      message: "App needs access to your storage",
      buttonNeutral: "Ask Me Later",
      buttonNegative: "Cancel",
      buttonPositive: "OK",
    }
  );

  const mismatchedPhotos: mismatchedPhoto[] = [];
  const files: string[] = [];

  console.log(folderUri);

  try {
    await FileSystem.StorageAccessFramework.readDirectoryAsync(folderUri).then(
      async (uris) => {
        for (const uri of uris) {
          const decodedUri = getFileNameFromUri(uri);
          if (decodedUri.endsWith(".jpg") || decodedUri.endsWith(".jpeg")) {
            files.push(uri);

            const res = await readAsync(uri).catch((error) => {
              throw error;
            });

            if (!res?.DateTimeOriginal) {
              const fileNameDate = getFileNameDateFromUri(decodedUri);
              const exifDate = getExifDateFromUriWithOffset(decodedUri);

              mismatchedPhotos.push({
                uri: uri,
                fileModificationDate: null,
                fileNameDate: fileNameDate,
                exifDate: exifDate,
              });
            }

            // await RNFS.stat(
            //   `${RNFS.ExternalStorageDirectoryPath}/${decodedUri}`
            // ).then((stats) => {
            //   console.log(json(stats));
            //   const fileNameDate = getFileNameDateFromUri(decodedUri);
            //   const statsDate = new Date(stats?.ctime || stats?.mtime || 0);
            //   // const exifDate = getExifDateFromUri(decodedUri);
            //   const exifDate = getExifDateFromUriWithOffset(decodedUri);
            //   console.log(`fileNameDate: ${fileNameDate}`);
            //   console.log(`statsDate: ${statsDate}`);
            //   console.log(`exifDate: ${exifDate}`);
            //   console.log("---------------------");

            //   if (fileNameDate.getTime() !== statsDate.setHours(0, 0, 0, 0)) {
            //     mismatchedPhotos.push({
            //       uri: uri,
            //       fileModificationDate: statsDate,
            //       fileNameDate: fileNameDate,
            //       exifDate: exifDate,
            //     });
            //   }
            // });
          }
        }
      }
    );
  } catch (error) {
    console.log(error);
    throw error;
  }

  return [mismatchedPhotos, files];
}

/**
 * Saves mismatched photos to a file in the given directory
 * @returns void
 */
export const saveMismatchedPhotos = async (
  directoryUri: string,
  mismatchedPhotos: mismatchedPhoto[]
): Promise<void> => {
  try {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const outputFilename = `dateFix_${today}.txt`;

    // First write to app's documents directory
    const tempPath = `${RNFS.DocumentDirectoryPath}/${outputFilename}`;
    const jsonContent = JSON.stringify(mismatchedPhotos, null, 2);

    // Write to temporary location first
    await RNFS.writeFile(tempPath, jsonContent, "utf8");

    // Then copy to the final destination using SAF
    await FileSystem.StorageAccessFramework.createFileAsync(
      directoryUri,
      outputFilename,
      "text/plain"
    ).then(async (uri) => {
      const content = await RNFS.readFile(tempPath);
      await FileSystem.writeAsStringAsync(uri, content);

      // Clean up temp file
      await RNFS.unlink(tempPath);

      return uri;
    });
  } catch (error) {
    console.error(
      "[saveMismatchedPhotos]: Error saving mismatched photos:",
      error
    );
    throw error;
  }
};

/**
 * Sets the EXIF date for a given photo
 * @returns boolean
 */
export const setExifDate = async (
  uri: string,
  date: string
): Promise<boolean> => {
  // console.log(`[setExifDate]: Setting EXIF date to ${date}`);
  const tags: ExifTags = {
    DateTimeOriginal: date,
  };

  const res = await writeAsync(uri, tags).catch((error) => {
    console.error("[setExifDate]: Error setting EXIF date:", error);
    throw error;
  });

  console.log(json(res));

  return true;
};
