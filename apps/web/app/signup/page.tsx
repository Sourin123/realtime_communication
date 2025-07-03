"use client";
import { useRouter } from "next/navigation";
import React from "react";


export default function SignupPage() {
    const router = useRouter();
    const handleSubmit = (event : React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const userData = {
            username: formData.get("username"),
            email: formData.get("email"),
            password: formData.get("password"),
            phoneNumber: formData.get("phoneNumber"),
            profilePictureUrl: formData.get("profilePictureUrl"),
        };
        console.log("User Data:", userData);
        //api call to create user
        fetch("/api/signup", {
            method: "POST",
            body: JSON.stringify(userData),
            headers: {
                "Content-Type": "application/json",
            },
        }).then(async (response) => {
            if (response.ok) {
                console.log("User created successfully");
                router.push("/");
            } else {
                console.error("Failed to create user");
                // Handle error response
                const data = await response.json();
                console.log("Error details:", data);
            }
        }).catch(error => {
            console.log("Network error:", error);
        });
    }
    return (
        <div className="signup-container">
            <h1 className="signup-title">Signup Page</h1>
            <p className="signup-description">Please fill out the form to create an account.</p>
            <form className="signup-form" onSubmit={handleSubmit}>
            <label className="signup-label">
                Username:
                <input className="signup-input" type="text" name="username" required />
            </label>
            <label className="signup-label">
                Email:
                <input className="signup-input" type="email" name="email" required />
            </label>
            <label className="signup-label">
                Password:
                <input className="signup-input" type="password" name="password" required />
            </label>
            <label className="signup-label">
                Phone Number:
                <input className="signup-input" type="tel" name="phoneNumber" required />
            </label>
            <label className="signup-label">
                Profile Picture URL:
                <input className="signup-input" type="url" name="profilePictureUrl" />
            </label>
            <button className="signup-button" type="submit">Sign Up</button>
            </form>
            <style jsx>{`
            .signup-container {
                padding: 32px;
                width: 100%;
                max-width: 400px;
                margin: 40px auto;
                background: #fff;
                border-radius: 12px;
                box-shadow: 0 4px 24px rgba(0,0,0,0.08);
            }
            .signup-title {
                text-align: center;
                margin-bottom: 8px;
                font-size: 2rem;
                font-weight: 700;
                color: #22223b;
            }
            .signup-description {
                text-align: center;
                margin-bottom: 24px;
                color: #4a4e69;
            }
            .signup-form {
                display: flex;
                flex-direction: column;
                gap: 18px;
            }
            .signup-label {
                display: flex;
                flex-direction: column;
                font-weight: 500;
                color: #22223b;
            }
            .signup-input {
                margin-top: 6px;
                padding: 10px 12px;
                border: 1px solid #c9ada7;
                border-radius: 6px;
                font-size: 1rem;
                background:rgb(1, 10, 19);
                transition: border 0.2s;
            }
            .signup-input:focus {
                border: 1.5px solidrgb(11, 21, 212);
                outline: none;
                background: #000;
            }
            .signup-button {
                margin-top: 12px;
                padding: 12px 0;
                background: linear-gradient(90deg, #9a8c98 0%, #4a4e69 100%);
                color: #fff;
                border: none;
                border-radius: 6px;
                font-size: 1.1rem;
                font-weight: 600;
                cursor: pointer;
                transition: background 0.2s;
            }
            .signup-button:hover {
                background: linear-gradient(90deg, #4a4e69 0%, #9a8c98 100%);
            }
            `}</style>
        </div>
    );
}