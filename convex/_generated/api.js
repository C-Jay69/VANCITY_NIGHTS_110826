/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */
import * as reviews from "../reviews.js";
import * as submissions from "../submissions.js";
import * as users from "../users.js";
import * as venues from "../venues.js";

import {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

const fullApi = {
  reviews,
  submissions,
  users,
  venues,
};

/** A utility for referencing Convex functions in your app's public API. */
export const api = {};

/** A utility for referencing Convex functions in your app's internal API. */
const internal = {};

export { internal };