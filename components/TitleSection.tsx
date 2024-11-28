import { StyleSheet } from "react-native";
import { Surface, Text } from "react-native-paper";

const bigText = [
  "Choose the folder where the Whatsapp photos are located",
  "Scan for photos or pick another directory",
  "Check edits and confirm",
];

type TitleSectionProps = {
  step: number;
};

export default function TitleSection({ step }: TitleSectionProps) {
  return (
    <>
      <Text variant="titleLarge" style={{ color: "gray" }}>
        Step {step + 1}
      </Text>
      <Text variant="displayMedium">{bigText[step]}</Text>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
});
