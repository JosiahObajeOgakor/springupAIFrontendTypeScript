import { beforeEach } from "vitest";
import { installFetchMock, resetFetch, setAuthToken } from "./utils";

// One mocked fetch for the whole run; reset its queue + captured calls and
// clear auth before every test so cases never leak into each other.
installFetchMock();

beforeEach(() => {
  resetFetch();
  setAuthToken(null);
});
