import Link from "next/link";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="page-state">
      <h1 className="text-6xl font-bold gradient-text">404</h1>
      <h2 className="text-xl font-bold">Page not found</h2>
      <p className="text-sm text-muted-foreground max-w-sm">
        The page you&apos;re looking for doesn&apos;t exist or may have moved.
      </p>
      <Link
        href="/"
        className="btn-orange btn-click mt-2 inline-flex items-center gap-2 px-5 py-2.5 text-sm"
      >
        <Home size={15} />
        Back to home
      </Link>
    </div>
  );
}
