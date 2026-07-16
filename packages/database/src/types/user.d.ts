import type { logUser } from "../schema/audit-log";
import type { account } from "../schema/user";

export type UserInfo = typeof account.$inferSelect & {
  logs: (typeof logUser.$inferSelect)[];
};
