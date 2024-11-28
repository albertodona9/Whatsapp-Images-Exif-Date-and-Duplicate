import { mismatchedPhoto } from "@/utils/interfaces";
import { createContext } from "react";

const AppContext = createContext<{
  directoryUri: string | null | undefined;
  fileResult: Array<string> | undefined | null;
  mismatchedPhotos: Array<mismatchedPhoto> | null;
}>({
  directoryUri: undefined,
  fileResult: undefined,
  mismatchedPhotos: null,
});

export default AppContext;
