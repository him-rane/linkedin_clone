import { lazy, Suspense } from "react";
const HomePage = lazy(() => import("./pages/HomePage"));
const LoginPage = lazy(() => import("./pages/auth/LoginPage"));
const SignUpPage = lazy(() => import("./pages/auth/SignUpPage"));
const NotificationsPage = lazy(() => import("./pages/NotificationsPage"));
const NetworkPage = lazy(() => import("./pages/NetworkPage"));
const PostPage = lazy(() => import("./pages/PostPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const ActivationPage = lazy(() => import("./pages/ActivationPage"));

function App() {
  const { data: authUser, isLoading } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      try {
        const res = await axiosInstance.get("/auth/me");
        return res.data;
      } catch (err) {
        if (err.response && err.response.status === 401) {
          return null;
        }
        toast.error(err.response?.data?.message || "Something went wrong");
        return null;
      }
    },
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <Layout>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route
            path="/"
            element={authUser ? <HomePage /> : <Navigate to="/login" />}
          />
          <Route path="/activate" element={<ActivationPage />} />
          <Route
            path="/signup"
            element={!authUser ? <SignUpPage /> : <Navigate to="/" />}
          />
          <Route
            path="/login"
            element={!authUser ? <LoginPage /> : <Navigate to="/" />}
          />
          <Route
            path="/notifications"
            element={
              authUser ? <NotificationsPage /> : <Navigate to="/login" />
            }
          />
          <Route
            path="/network"
            element={authUser ? <NetworkPage /> : <Navigate to="/login" />}
          />
          <Route
            path="/post/:postId"
            element={authUser ? <PostPage /> : <Navigate to="/login" />}
          />
          <Route
            path="/profile/:username"
            element={authUser ? <ProfilePage /> : <Navigate to="/login" />}
          />
        </Routes>
      </Suspense>
      <Toaster />
    </Layout>
  );
}

export default App;
