import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function validate(email: string, username: string, first_name: string, password: string, confirmPassword: string) {
  if (!first_name.trim()) {
    return "First name is required.";
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return "Please enter a valid email address.";
  }
  if (password.length < 8) {
    return "Password must be at least 8 characters.";
  }
  if (password !== confirmPassword) {
    return "Passwords do not match.";
  }
  return null;
}

export function Signup() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [first_name, setFirstName] = useState("");
  const [last_name, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const validationError = validate(email, username, first_name, password, confirmPassword);
    if (validationError) {
      setError(validationError);
      return;
    }
    setIsSubmitting(true);
    setError(null);

    try {
      const registerRes = await fetch("http://localhost:4000/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          username,
          first_name,
          last_name: last_name.trim() || undefined,
          password,
        }),
      });

      if (!registerRes.ok) {
        const text = await registerRes.text();
        try {
          const err = JSON.parse(text);
          throw new Error(err.message ?? "Signup failed");
        } catch {
          throw new Error("Signup failed");
        }
      }

      await login(email, password);
      navigate("/");
    } catch (err) {
      console.error("Signup Error: ", err);
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setIsSubmitting(false);
    }
  } 

  return (
    <section className='h-screen flex bg-gray'>
      <section className='w-full max-w-md m-auto bg-white rounded-lg border py-10 px-16'>
        <h1 className='text-2xl font-medium mt-4 mb-12 text-center'>
          Create An Account
        </h1>

        <form onSubmit={handleFormSubmit}>
          <section>
            <label htmlFor='first_name'>First Name</label>
            <input
              type='text'
              name='first_name'
              autoComplete='given-name'
              required
              className='w-full p-2 border rounded-md outline-none text-sm transition duration-150 ease-in-out mb-4'
              id='first_name'
              value={first_name}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder='Your First Name'
            />
          </section>
          <section>
            <label htmlFor='last_name'>Last Name</label>
            <input
              type='text'
              name='last_name'
              autoComplete='family-name'
              className='w-full p-2 border rounded-md outline-none text-sm transition duration-150 ease-in-out mb-4'
              id='last_name'
              value={last_name}
              onChange={(e) => setLastName(e.target.value)}
              placeholder='Your Last Name'
            />
          </section>
          <section>
            <label htmlFor='username'>Username</label>
            <input
              type='text'
              name='username'
              autoComplete='username'
              required
              className='w-full p-2 border rounded-md outline-none text-sm transition duration-150 ease-in-out mb-4'
              id='username'
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder='Your Username'
            />
          </section>
          <section>
            <label htmlFor='email'>Email</label>
            <input
              type='email'
              name='email'
              autoComplete='email'
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
              name='password'
              autoComplete='new-password'
              required
              className='w-full p-2 border rounded-md outline-none text-sm transition duration-150 ease-in-out mb-4'
              id='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder='Your Password'
            />
          </section>
          <section>
            <label htmlFor='confirm_password'>Confirm Password</label>
            <input
              type='password'
              autoComplete='new-password'
              required
              className='w-full p-2 border rounded-md outline-none text-sm transition duration-150 ease-in-out mb-4'
              id='confirm_password'
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder='Confirm Password'
            />
          </section>
          {error && (
            <p className="text-red-500 text-sm mt-2 text-center">{error}</p>
          )}
          <section className='flex justify-center items-center mt-6'>
            <button
              type='submit'
              disabled={isSubmitting}
              className='bg-green-600 py-2 px-4 text-sm text-white rounded border border-green-600 focus:outline-none focus:border-green-800'>
              {isSubmitting ? "Signing up..." : "Signup"}
            </button>
          </section>
          <p className="text-sm text-center mt-4">
            Already have an account? <Link to="/login" className="text-green-600 underline">Log in</Link>
          </p>
        </form>
      </section>
    </section>
  );
}