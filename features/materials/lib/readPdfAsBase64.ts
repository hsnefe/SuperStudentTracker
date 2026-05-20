import { File } from "expo-file-system";

export async function readPdfAsBase64(localUri: string): Promise<string> {
  const file = new File(localUri);
  return file.base64();
}
