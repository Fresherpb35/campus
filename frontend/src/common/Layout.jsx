import { useMemo } from "react";
import { AppProvider } from "@toolpad/core/AppProvider";
import { DashboardLayout } from "@toolpad/core/DashboardLayout";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Box, useTheme } from "@mui/material";
import { ToastContainer } from "react-toastify";
import { getNavigation } from "./GetNavigation.jsx";
import { useAuth } from "../context/AuthContext.jsx";

function ThemedToast() {
  const theme = useTheme();
  return (
    <ToastContainer
      theme={theme.palette.mode}
      position="top-center"
      autoClose={3000}
    />
  );
}

function Layout() {
  const { user } = useAuth();
  const Navigation = getNavigation(user);

  const location = useLocation();
  const navigate = useNavigate();

  const router = useMemo(() => ({
    pathname: location.pathname,
    searchParams: new URLSearchParams(location.search),
    navigate: (path) => navigate(path),
  }), [location.pathname, location.search, navigate]);

  return (
    <AppProvider
      navigation={Navigation}
      router={router}
      branding={{ title: "Campus Market Place", logo: <></> }}
    >
      <ThemedToast />
      <DashboardLayout>
        <Outlet />
      </DashboardLayout>
    </AppProvider>
  );
}

export default Layout;