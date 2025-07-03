"use client";
import {  useRouter } from "next/navigation";

export default function LoginPage() {
    const router = useRouter();
    const handleSubmit = (event : React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            const fromData = new FormData(event.currentTarget);
            const userData = {
                email: fromData.get("email"),
                password: fromData.get("password"),
            };
            console.log("User Data:", userData);

            //api call to login user
            fetch("api/login", {
                method: "POST",
                body: JSON.stringify(userData),
                headers: {
                    "Content-Type": "application/json",
                },
            }).then(async (response) => {
                if (response.ok) {
                    console.log("Login successful");
                    router.push("/success");
                } else {
                    console.log("Login failed");
                    // Handle error response
                    const data = await response.json();
                    console.log("Error details:", data);
                }
            }).catch(error => {
                console.log("Network error:", error);
            });

    };

  return (
    <div style={{ maxWidth: 400, margin: "40px auto", padding: 24, border: "1px solid #ccc", borderRadius: 8 }}>
      <h1 style={{ textAlign: "center" }}>Login</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label htmlFor="email" style={{ display: "block", marginBottom: 4 }}>Email</label>
          <input
            type="email"
            id="email"
            name="email"
            style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #ccc" }}
            required
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label htmlFor="password" style={{ display: "block", marginBottom: 4 }}>Password</label>
          <input
            type="password"
            id="password"
            name="password"
            style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #ccc" }}
            required
          />
        </div>
        <button
          type="submit"
          style={{
            width: "100%",
            padding: 10,
            background: "#0070f3",
            color: "#fff",
            border: "none",
            borderRadius: 4,
            fontWeight: "bold",
            cursor: "pointer"
          }}
        >
          Login
        </button>
      </form>
    </div>
  );
}
