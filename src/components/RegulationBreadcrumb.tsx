import React from "react";
import { Link, useLocation } from "react-router-dom";

interface RegulationBreadcrumbProps {
  regulation?: { search?: string }; // Define a type for the regulation object
}

const RegulationBreadcrumb: React.FC<RegulationBreadcrumbProps> = ({ regulation }) => {
  const location = useLocation();

  // Mapping of paths to breadcrumb names
  const breadcrumbMap: Record<string, string> = {
    "/regulations": "Your Regulation Searches",
    "/regulation/:id": "Regulation Detail",
    "/regulation/:regulationId/chat": "Notes",
  };

  // Helper to match dynamic routes with the current path
  const matchRoute = (path: string, currentPath: string): boolean => {
    const regex = new RegExp(
      `^${path.replace(/:[^/]+/g, "[^/]+")}$`
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

    // Check if the path is related to regulations and add "Your Regulation Searches" only once
    if (
      location.pathname.includes("/regulation") &&
      !breadcrumbs.some((b) => b.name === breadcrumbMap["/regulations"])
    ) {
      breadcrumbs.push({
        name: breadcrumbMap["/regulations"],
        path: "/regulations",
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
        // Skip adding the breadcrumb for "/regulations"
        if (matchedRoute === "/regulations") {
          return;
        }

        const name = breadcrumbMap[matchedRoute];
        breadcrumbs.push({
          name,
          path: accumulatedPath, // Accumulated path up to this point
        });
      }
    });

    // If on the "Notes" page, replace "Notes" with a dynamic value
    if (location.pathname.includes("/regulation/") && regulation?.search) {
      const dynamicBreadcrumb = {
        name: regulation.search || "Regulation Search",
        path: accumulatedPath, // Include the current path for consistency
      };

      // Remove "Notes" and add the dynamic breadcrumb
      breadcrumbs.splice(breadcrumbs.length - 1, 1, dynamicBreadcrumb);
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
            {index !== breadcrumbs.length - 1 && <span className="mx-1">/</span>}
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default RegulationBreadcrumb;
