import React from "react";
import { Link, useLocation } from "react-router-dom";

interface LeaseBreadcrumbProps {
  lease?: any; // Or define a more specific type for `lease`
}

const LeaseBreadcrumb: React.FC<LeaseBreadcrumbProps> = ({ lease }) => {
  const location = useLocation();

  // Mapping of paths to breadcrumb names
  const breadcrumbMap: Record<string, string> = {
    "/leases": "Your Leases",
    "/lease/:id": "Lease Detail",
    "/lease/:id/documents/:documentId/notes": "Document Notes",
  };

  // Helper to match dynamic routes with current path
  const matchRoute = (path: string, currentPath: string): boolean => {
    // Convert dynamic routes into regex
    const regex = new RegExp(
      `^${path.replace(/:[^/]+/g,"[^/]+")}$`
    );
    return regex.test(currentPath);
  };

  // Generate breadcrumbs dynamically
  const getBreadcrumbs = (): { name: string; path: string }[] => {
    const pathSegments = location.pathname.split("/").filter(Boolean);
    const breadcrumbs: { name: string; path: string }[] = [];

    // Add the "Home" breadcrumb
    breadcrumbs.push({
      name: "Home",
      path: "/dashboard",
    });

    // Check if the path is related to leases and add "Your Leases" only once
    if (
      location.pathname.includes("/lease") &&
      !breadcrumbs.some((b) => b.name === breadcrumbMap["/leases"])
    ) {
      breadcrumbs.push({
        name: breadcrumbMap["/leases"],
        path: "/leases",
      });
    }

    // Build breadcrumbs for the rest of the path
    let accumulatedPath = "";
    pathSegments.forEach((segment) => {
      accumulatedPath += `/${segment}`;
      const matchedRoute = Object.keys(breadcrumbMap).find((route) =>
        matchRoute(route, accumulatedPath)
      );

      if (matchedRoute) {
        // Skip adding the breadcrumb for "/leases"
        if (matchedRoute === "/leases") {
          return;
        }
        const name = breadcrumbMap[matchedRoute];
        breadcrumbs.push({
          name,
          path: accumulatedPath, // Accumulated path up to this point
        });
      }
    });
  
    // If on the document notes page, replace "Document Notes" with the lease address
    if (location.pathname.includes("/lease/") && lease) {
      const fullAddress = lease.address1 + (lease.address2 ? `, ${lease.address2}` : '');
      const addressBreadcrumb = {
        name: fullAddress || "Lease Address",
        path: accumulatedPath, // Include the current path for consistency
      };
      // Remove "Document Notes" and add the dynamic address breadcrumb
      breadcrumbs.splice(breadcrumbs.length - 1, 1, addressBreadcrumb);
    }
    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <nav className="text-sm text-gray-500">
      <ul className="flex">
        {breadcrumbs.map((breadcrumb, index) => (
          <li key={index} className="flex items-center">
            {index !== breadcrumbs.length - 1 ? (
              <Link to={breadcrumb.path} className="hover:underline">
                {breadcrumb.name}
              </Link>
            ) : (
              <span className="font-bold">{breadcrumb.name}</span>
            )}
            {index !== breadcrumbs.length - 1 && <span className="mx-1">/</span>} {/* Separator */}
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default LeaseBreadcrumb;
