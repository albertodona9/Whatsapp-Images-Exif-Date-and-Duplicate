import { Surface, Text } from "react-native-paper";
import { StyleSheet } from "react-native";
import { useContext } from "react";
import AppContext from "@/context/AppContext";

type ContentSectionProps = {
  step: number;
};

export default function ContentSection({ step }: ContentSectionProps) {
  const { directoryRes, fileResult } = useContext(AppContext);

  return (
    <Surface style={styles.container}>
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
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
    alignItems: "center",
    alignContent: "center",
  },
});
