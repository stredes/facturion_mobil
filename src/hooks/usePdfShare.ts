import * as FileSystem from "expo-file-system/legacy";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { useCallback, useState } from "react";

export interface PdfShareOptions {
  html: string;
  fileName: string;
  dialogTitle?: string;
}

export interface PdfShareResult {
  fileName: string;
  fileUri: string;
  pageCount: number;
}

export function usePdfShare() {
  const [isSharing, setIsSharing] = useState(false);

  const sharePdf = useCallback(
    async (options: PdfShareOptions): Promise<PdfShareResult> => {
      setIsSharing(true);

      try {
        const printResult = await Print.printToFileAsync({
          height: 842,
          html: options.html,
          textZoom: 100,
          width: 595,
        });

        let fileUri = printResult.uri;
        if (FileSystem.cacheDirectory) {
          const targetUri = `${FileSystem.cacheDirectory}${options.fileName}`;
          await FileSystem.deleteAsync(targetUri, { idempotent: true });
          await FileSystem.copyAsync({ from: printResult.uri, to: targetUri });
          fileUri = targetUri;
        }

        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
          await Sharing.shareAsync(fileUri, {
            dialogTitle: options.dialogTitle ?? `Compartir ${options.fileName}`,
            mimeType: "application/pdf",
            UTI: "com.adobe.pdf",
          });
        }

        return {
          fileName: options.fileName,
          fileUri,
          pageCount: printResult.numberOfPages,
        };
      } finally {
        setIsSharing(false);
      }
    },
    [],
  );

  return { isSharing, sharePdf };
}
