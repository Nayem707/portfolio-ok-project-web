import { classNames } from "@/utils";

export default function Skeleton({ className, rounded = "rounded-lg" }) {
  return <div className={classNames("skeleton", rounded, className)} />;
}
