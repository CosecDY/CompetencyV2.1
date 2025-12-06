import React, { ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@Contexts/AuthContext";

interface PermissionRouteProps {
  requiredPermissions: string[];
  children: ReactNode;
}

const PermissionRoute: React.FC<PermissionRouteProps> = ({ requiredPermissions, children }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      const hasPermission = requiredPermissions.every((p) => ((user as any)?.permissions ?? []).includes(p));
      if (!hasPermission) {
        navigate("/error403", { replace: true });
      }
    }
  }, [loading, user, requiredPermissions, navigate]);

  if (loading) return null;

  const hasPermission = requiredPermissions.every((p) => ((user as any)?.permissions ?? []).includes(p));
  if (!hasPermission) return null;

  return <>{children}</>;
};

export default PermissionRoute;
