import { FranchiseStatusClient } from "./FranchiseStatusClient";

export const metadata = {
  title: "Track Franchise Application | ABCD",
  description: "Check the current status of your franchise application.",
};

export default function FranchiseStatusPage() {
  return <FranchiseStatusClient />;
}
