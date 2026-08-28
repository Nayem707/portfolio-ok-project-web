import { Link } from "react-router-dom";
import Button from "@/components/common/Button";

export default function NotFound() {
  return (
    <div className="container-app flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <p className="text-primary-600 text-7xl font-extrabold">404</p>
      <h1 className="mt-4 text-2xl font-bold text-slate-900">Page not found</h1>
      <p className="mt-2 max-w-md text-slate-500">
        The page you’re looking for doesn’t exist or has been moved.
      </p>
      <Button as={Link} to="/" className="mt-6">
        Back to Home
      </Button>
    </div>
  );
}
