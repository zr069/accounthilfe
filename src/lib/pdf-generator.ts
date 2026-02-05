import { generiereAbmahnung, type AbmahnungData } from "./abmahnung-template";

export function generateAbmahnungText(data: AbmahnungData): string {
  return generiereAbmahnung(data);
}

export { type AbmahnungData };
