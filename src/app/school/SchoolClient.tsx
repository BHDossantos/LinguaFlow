"use client";
import { useState, useTransition } from "react";
import { createOrganization, joinOrganization } from "./actions";

type OrgType = "school" | "district" | "tutoring_center" | "homeschool";

export function SchoolClient() {
  const [mode, setMode] = useState<"join" | "create">("join");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [type, setType] = useState<OrgType>("school");
  const [country, setCountry] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function submit() {
    setError(null);
    start(async () => {
      try {
        if (mode === "join") await joinOrganization({ code });
        else await createOrganization({ name, type, country: country || undefined });
      } catch (e: any) {
        setError(e?.message ?? "Something went wrong");
      }
    });
  }

  return (
    <section className="card space-y-3">
      <div className="flex gap-2">
        <button
          onClick={() => setMode("join")}
          className={mode === "join" ? "btn-primary flex-1 text-sm" : "btn-ghost flex-1 text-sm"}
        >
          Join with code
        </button>
        <button
          onClick={() => setMode("create")}
          className={mode === "create" ? "btn-primary flex-1 text-sm" : "btn-ghost flex-1 text-sm"}
        >
          Create one
        </button>
      </div>

      {mode === "join" ? (
        <label className="block">
          <span className="text-sm font-medium">Organization invite code</span>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            maxLength={12}
            placeholder="ABC123"
            className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 tracking-[0.2em]"
          />
        </label>
      ) : (
        <div className="space-y-2">
          <label className="block">
            <span className="text-sm font-medium">Name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Marymount International School"
              className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2"
            />
          </label>
          <div className="grid grid-cols-2 gap-2">
            <label className="block">
              <span className="text-sm font-medium">Type</span>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as OrgType)}
                className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2"
              >
                <option value="school">School</option>
                <option value="district">District</option>
                <option value="tutoring_center">Tutoring center</option>
                <option value="homeschool">Homeschool</option>
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-medium">Country</span>
              <input
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="Italy"
                className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2"
              />
            </label>
          </div>
        </div>
      )}

      <button
        onClick={submit}
        disabled={pending || (mode === "join" ? code.length < 4 : name.trim().length < 2)}
        className="btn-primary w-full"
      >
        {pending ? "…" : mode === "join" ? "Join organization" : "Create organization"}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </section>
  );
}
