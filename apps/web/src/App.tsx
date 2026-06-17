import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import { Home } from "./pages/HomePage";
import { CreateWorkout } from "./pages/CreateWorkoutPage";
import { WorkoutInfo } from "./pages/WorkoutInfoPage";

import { Login } from "./pages/LoginPage";
import { Signup } from "./pages/SignupPage";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ProtectedRoute, GuestRoute } from "./components/Routes";

function Header() {
  return (
    <h1 className="text-3xl font-bold text-blue-600">
      Workout Tracker
    </h1>
  );
}

function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav>
      <ul className="flex items-center gap-2">
        <li>
          <Link
            to="/"
            className="rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100 transition"
          >
            Home
          </Link>
        </li>

        <li>
          <Link
            to="/create_workout"
            className="rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100 transition"
          >
            Create Workout
          </Link>
        </li>

        <li>
          <Link
            to="/workout_info"
            className="rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100 transition"
          >
            Workouts
          </Link>
        </li>

        {user && (
          <li>
            <button
              onClick={logout}
              className="rounded-lg px-3 py-2 text-red-600 hover:bg-red-50 transition"
            >
              Logout
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <section className="min-h-screen bg-gray-100">
          <header className="border-b bg-white shadow-sm">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
              <Header />
              <Navbar />
            </div>
          </header>

          <main className="mx-auto max-w-6xl px-6 py-8">
            <Routes>
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Home />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/create_workout"
                element={
                  <ProtectedRoute>
                    <CreateWorkout />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/workout_info"
                element={
                  <ProtectedRoute>
                    <WorkoutInfo />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/login"
                element={
                  <GuestRoute>
                    <Login />
                  </GuestRoute>
                }
              />

              <Route
                path="/signup"
                element={
                  <GuestRoute>
                    <Signup />
                  </GuestRoute>
                }
              />
            </Routes>
          </main>
        </section>
      </AuthProvider>
    </BrowserRouter>
  );
}