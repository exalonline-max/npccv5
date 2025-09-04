"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const [role, setRole] = useState<string | null>(null);
  const router = useRouter();

  function handleContinue() {
    if (role === "GM") {
      router.push("/campaigns/create");
    } else if (role === "Player") {
      router.push("/campaigns/join");
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#e6eaf3]">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center">Welcome to NPCChatter!</h1>
        <p className="mb-6 text-center">Are you a Dungeon Master (GM) or a Player?</p>
        <div className="flex flex-col gap-4 mb-6">
          <button
            className={`px-6 py-3 rounded-lg border font-semibold ${role === "GM" ? "bg-blue-600 text-white" : "bg-gray-100"}`}
            onClick={() => setRole("GM")}
          >
            Dungeon Master (GM)
          </button>
          <button
            className={`px-6 py-3 rounded-lg border font-semibold ${role === "Player" ? "bg-blue-600 text-white" : "bg-gray-100"}`}
            onClick={() => setRole("Player")}
          >
            Player
          </button>
        </div>
        <button
          className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold disabled:opacity-50"
          disabled={!role}
          onClick={handleContinue}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
