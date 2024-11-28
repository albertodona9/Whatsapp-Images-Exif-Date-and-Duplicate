import { useState, createContext } from "react";
import { Alert, StatusBar } from "react-native";
import { StyleSheet, View } from "react-native";
import * as FileSystem from "expo-file-system";
import { writeAsync, readAsync, ExifTags } from "@lodev09/react-native-exify";
import {
  PaperProvider,
  Text,
  Surface,
  Button,
  Divider,
  Snackbar,
} from "react-native-paper";
import TitleSection from "@/components/TitleSection";
import ContentSection from "@/components/ContentSection";
import AppContext from "@/context/AppContext";
/**
 * Error safe JSON.stringify
 */
const json = (value?: unknown, space = 2): string => {
  try {
    return JSON.stringify(value, undefined, space);
  } catch (e) {
    return String(value);
  }
};

/**
 * Still developing;
 * Count Photos with date modified attributes mismatched with Filename date
 */
async function countMismatchedPhotos(uri: string) {
  console.log(`Looking for tags in file: ${uri}`);
  const tags = await readAsync(uri);
  console.log(json(tags));
}

/**
 * Extracts FileName from uri
 * @returns string
 */
function getFileNameFromUri(uri: string): string {
  const parts = uri.split("/");
  return decodeURIComponent(parts[parts.length - 1]);
}

export default function Index() {
  const [directoryRes, setDirectoryRes] = useState<undefined | null | string>();
  const [loading, setLoading] = useState<boolean>(false);
  let [step, setStep] = useState<number>(0);
  const [snackBarText, setSnackBarText] = useState<undefined | string>();
  const [snackBarVisible, setSnackBarVisible] = useState<boolean>(false);
  const [fileResult, setFileResult] = useState<
    Array<string> | undefined | null
  >();

  const primaryButtonText = [
    "Choose Folder",
    "Scan for photos",
    "Confirm Edits",
  ];
  const secondaryButtonText = ["Pick another folder", "Change photo"];

  /**
   * Set SnackBar visibility and eventual text
   * @returns void
   */
  function setSnackBar(visible: boolean, label?: string): void {
    setSnackBarText(label);
    setSnackBarVisible(visible);
  }

  async function primaryFunction(step: number) {
    if (step === 0) {
      try {
        const permission =
          await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
        if (permission.granted) {
          setDirectoryRes(permission.directoryUri);
          setStep((step += 1));
        }
      } catch (error) {
        throw new Error("Permission not granted");
        // setSnackBar(true, 'Permission not granted')
        // console.log(error)
      }
    } else if (step === 1) {
      if (!directoryRes) {
        setStep((step -= 1));
        throw new Error("Directory path not set");
      }
      try {
        setFileResult(
          await FileSystem.StorageAccessFramework.readDirectoryAsync(
            directoryRes
          )
        );
        setStep((step += 1));
      } catch (error) {
        throw new Error("Cannot read directory");
      }
    } else if (step === 2) {
      // Do the edits
    } else if (step === 3) {
      // Show completed edits
    }
  }

  return (
    <AppContext.Provider value={{ directoryRes, fileResult }}>
      <PaperProvider>
        <Surface style={[styles.surface, { flex: 2 }]}>
          <TitleSection step={step} />
        </Surface>

        <Surface
          elevation={2}
          style={[styles.surface, { alignContent: "center" }]}
        >
          {step === 0 || step === 1 ? (
            <>
              <Text variant="titleMedium"> Current selected directory: </Text>
              {directoryRes ? (
                <Text variant="bodyMedium"> {directoryRes} </Text>
              ) : (
                <Text variant="bodyMedium"> None bruh </Text>
              )}
            </>
          ) : (
            <></>
          )}
          {step === 2 ? (
            <Text
              variant="bodyMedium"
              style={{
                paddingBottom: 10,
              }}
            >
              Files found: {fileResult ? fileResult.length : "Error"}
            </Text>
          ) : (
            // ImageCard
            // console.log('With Exif')
            // await countMismatchedPhotos(decodeURIComponent(fileResult[fileResult.length - 1]));

            // console.log('With fileInfo')
            // console.log(await FileSystem.getInfoAsync(decodeURIComponent(fileResult[fileResult.length - 1])))
            <></>
          )}
          {/* {step === 3 ? (
          // Confirmed edits
          <> </>
        ) : (
          <> </>
        )} */}
        </Surface>

        <Surface style={styles.surface}>
          <Button
            mode="contained-tonal"
            loading={loading}
            onPress={async () => {
              setLoading(true);
              try {
                await primaryFunction(step);
              } catch (error: any) {
                setSnackBar(true, error);
              }
              setLoading(false);
            }}
          >
            {primaryButtonText[step]}
          </Button>

          {step > 0 ? (
            <Button
              mode="text"
              onPress={() => {
                primaryFunction(step - 1);
              }}
            >
              {secondaryButtonText[step - 1]}
            </Button>
          ) : (
            <></>
          )}
        </Surface>

        <Snackbar visible={snackBarVisible} onDismiss={() => {}}>
          {snackBarText}
        </Snackbar>
      </PaperProvider>
    </AppContext.Provider>
  );
}

const styles = StyleSheet.create({
  surface: {
    // minHeight: "10%",
    flex: 1,
    // alignItems: "center",
    justifyContent: "center",
    padding: 10,
  },
});
