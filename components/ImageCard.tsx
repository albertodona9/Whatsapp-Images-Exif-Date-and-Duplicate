import { Image } from "react-native";
import { Surface, Text } from "react-native-paper";

type Props = {
  uri: string;
  name: string;
};

export function ImageCard({ uri, name }: Props) {
  return (
    <Surface>
      <Image
        style={{ maxHeight: "80%", maxWidth: "20%" }}
        source={{ uri: uri }}
      />
      <Surface>
        <Text variant="labelMedium">{name}</Text>
        <Text variant="labelMedium">Last Modified Date:</Text>
      </Surface>
    </Surface>
  );
}
