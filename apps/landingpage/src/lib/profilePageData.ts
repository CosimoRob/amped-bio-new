import type { BlockType, ThemeConfig } from "@repo/constants";
import type { RouterOutputs } from "../../../server/src/trpc";

// Inferred directly from the tRPC router so the SSR page data can never drift
// from what the API actually returns.
type HandleOutput = RouterOutputs["handle"]["getHandle"];
type HandleUser = HandleOutput["user"];

export interface UserProfile {
  id: HandleUser["id"];
  name: NonNullable<HandleUser["name"]>;
  handle: string;
  handleFormatted: string;
  email: HandleUser["email"];
  bio: string;
  photoUrl?: string;
  photoCmp?: string;
  revoName?: string;
}

// Theme from tRPC, but with the JSON column typed as the app's ThemeConfig
export interface Theme {
  id: NonNullable<HandleOutput["theme"]>["id"];
  name: NonNullable<HandleOutput["theme"]>["name"];
  config: ThemeConfig;
}

export interface ProfilePageData {
  profile: UserProfile;
  blocks: BlockType[];
  theme: Theme | null;
  hasCreatorPool: HandleOutput["hasCreatorPool"];
  /** Whether search engines may index this profile */
  indexable: boolean;
}

export const DEFAULT_HANDLE = "landingpage";

export const DEFAULT_PROFILE_DATA: ProfilePageData = {
  profile: {
    id: 0,
    name: "Amplify Digital",
    handle: "amped.bio",
    handleFormatted: "@amped.bio",
    email: "info@amplifydigital.ai",
    bio: "Empowering individuals and communities, enabling seamless transactions without intermediaries",
  },
  blocks: [
    {
      id: 1,
      order: 0,
      type: "link",
      config: { platform: "twitter", url: "https://x.com/amped_bio", label: "Follow on X" },
    },
    {
      id: 2,
      order: 1,
      type: "link",
      config: {
        platform: "github",
        url: "https://github.com/amplifydigital-web3",
        label: "Check out our Github",
      },
    },
    {
      id: 3,
      order: 2,
      type: "link",
      config: {
        platform: "telegram",
        url: "https://t.me/npayme_network",
        label: "Connect on Telegram",
      },
    },
  ],
  theme: null,
  hasCreatorPool: false,
  indexable: false,
};

/**
 * Map the raw getHandle tRPC output to the shape consumed by ProfileView.
 * The casts are limited to the boundary where Prisma's JSON columns (theme
 * config, block config) meet the app's typed schemas.
 */
export function mapGetHandleData(result: HandleOutput, handle: string): ProfilePageData {
  const { user, theme, blocks: blocksRaw, hasCreatorPool, indexable } = result;
  return {
    profile: {
      id: user.id,
      name: user.name ?? "",
      handle,
      handleFormatted: `@${handle}`,
      email: user.email,
      bio: user.description ?? "",
      photoUrl: user.image ?? "",
      photoCmp: "",
      revoName: user.revoName ?? "",
    },
    theme: theme ? (theme as unknown as Theme) : null,
    blocks: [...blocksRaw].sort((a, b) => a.order - b.order) as unknown as BlockType[],
    hasCreatorPool,
    indexable,
  };
}
