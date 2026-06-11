import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function validate(email: string, password: string) {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return "Please enter a valid email address.";
  }
  return null;
}

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const validationError = validate(email, password);
    if (validationError) {
      setError(validationError);
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      console.error("Login Error: ", err);
      setError(err instanceof Error ? err.message : "Login Failed");
    } finally {
      setIsSubmitting(false);
    }
  }
  
  return (
    <section className='h-screen flex bg-gray'>
      <section className='w-full max-w-md m-auto bg-white rounded-lg border py-10 px-16'>
        <h1 className='text-2xl font-medium mt-4 mb-12 text-center'>
          Log in to your account
        </h1>

        <form onSubmit={handleFormSubmit}>
          <section>
            <label htmlFor='email'>Email</label>
            <input
              type='email'
              name='email'
              autoComplete="email"
              required
              className='w-full p-2 border rounded-md outline-none text-sm transition duration-150 ease-in-out mb-4'
              id='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder='Your Email'
            />
          </section>
          <section>
            <label htmlFor='password'>Password</label>
            <input
              type='password'
              autoComplete="current-password"
              name='password'
              required
              className='w-full p-2 border rounded-md outline-none text-sm transition duration-150 ease-in-out mb-4'
              id='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder='Your Password'
            />
          </section>
          {error && (
            <p className="text-red-500 text-sm mt-2 text-center">{error}</p>
          )}
          <section className='flex justify-center items-center mt-6'>
            <button
              type="submit"
              disabled={isSubmitting}
              className='bg-green-600 py-2 px-4 text-sm text-white rounded border border-green-600 focus:outline-none focus:border-green-800'>
              {isSubmitting ? "Logging in..." : "Login"}
            </button>
          </section>
          <p className="text-sm text-center mt-4">
            Don't have an account? <Link to="/signup" className="text-green-600 underline">Sign up</Link>
          </p>
        </form>
      </section>
    </section>
  )
}