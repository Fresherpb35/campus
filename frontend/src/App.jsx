import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import Layout from "./common/Layout";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Orders from "./pages/Orders";
import Wishlist from "./pages/Wishlist";
import Chats from "./pages/Chats";
import MyListing from "./pages/MyListing";
import ProductDetail from "./pages/ProductDetail";
import Signup from "./pages/Auth/Signup";
import Signin from "./pages/Auth/Signin";
import UsersRequests from "./pages/Admin/UsersRequests";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import "react-toastify/dist/ReactToastify.css";
import MyProfile from "./pages/MyProfile";
import Signout from "./pages/Auth/Signout";
import { Provider } from "react-redux";
import { store } from "./redux/stores/store";

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Layout />,
      children: [
        {
          path: "/",
          // Redirect root URL to /dashboard so URL reflects the main page
          element: <Navigate to="/dashboard" replace />,
        },


        {
          element: <ProtectedRoute />,
          children: [
            {
              path: "/products",
              element: <Products />,
            },
            {
              path: "/dashboard",
              element: <Dashboard />,
            },
            {
              path: "/product/:id",
              element: <ProductDetail />,
            },
            {
              path: "/wishlist",
              element: <Wishlist />,
            },
            {
              path: "/orders",
              element: <Orders />,
            },
            {
              path: "/chats",
              element: <Chats />,
            },
            {
              path: "/my-listing",
              element: <MyListing />,
            },
            {
              path: "/my-profile",
              element: <MyProfile />,
            },
            {
              path: "/signOut",
              element: <Signout />,
            },
            // Admin routes (requires admin role at backend)
            {
              path: "/admin/requests",
              element: <UsersRequests />,
            },
          ],
        },

        {
          path: "/signup",
          element: <Signup />,
        },
        {
          path: "/signin",
          element: <Signin />,
        },
      ],
    },
  ]);
  return (
    <Provider store={store}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </Provider>
  );
}

export default App;
