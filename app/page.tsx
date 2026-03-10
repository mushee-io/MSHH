"use client";

import { useMemo, useState } from "react";

type JsonState = Record<string, unknown> | null;

export default function HomePage() {
  const appName = process.env.NEXT_PUBLIC_APP_NAME || "Mushee Flow";
  const networkLabel = process.env.NEXT_PUBLIC_NETWORK_LABEL || "Polygon Mainnet";

  const [wallet, setWallet] = useState("");
  const [txHash, setTxHash] = useState("");
  const [prompt, setPrompt] = useState("Generate a concise GTM plan for Mushee Flow on Yellow Network.");
  const [tipReceiver, setTipReceiver] = useState("");
  const [tipAmount, setTipAmount] = useState("0.0001");
  const [tipTxHash, setTipTxHash] = useState("");
  const [verifyResult, setVerifyResult] = useState<JsonState>(null);
  const [runResult, setRunResult] = useState<JsonState>(null);
  const [tipResult, setTipResult] = useState<JsonState>(null);
  const [activity, setActivity] = useState<JsonState>(null);
  const [loading, setLoading] = useState<string | null>(null);

  const metrics = useMemo(
    () => [
      { label: "Default prompt price", value: "$0.0001" },
      { label: "Settlement rail", value: networkLabel },
      { label: "Treasury mode", value: "USDC to treasury" }
    ],
    [networkLabel]
  );

  async function callApi(path: string, body?: Record<string, unknown>, method = "POST") {
    const res = await fetch(path, {
      method,
      headers: { "Content-Type": "application/json" },
      body: method === "GET" ? undefined : JSON.stringify(body || {})
    });

    return res.json();
  }

  async function handleVerify() {
    setLoading("verify");
    try {
      const data = await callApi("/api/verify-payment", { wallet, txHash });
      setVerifyResult(data);
    } finally {
      setLoading(null);
    }
  }

  async function handleRun() {
    setLoading("run");
    try {
      const data = await callApi("/api/run-prompt", { wallet, txHash, prompt });
      setRunResult(data);
    } finally {
      setLoading(null);
    }
  }

  async function handleTip() {
    setLoading("tip");
    try {
      const data = await callApi("/api/tip", {
        sender: wallet,
        receiver: tipReceiver,
        amount: tipAmount,
        txHash: tipTxHash
      });
      setTipResult(data);
    } finally {
      setLoading(null);
    }
  }

  async function loadActivity() {
    setLoading("activity");
    try {
      const res = await fetch("/api/activity");
      const data = await res.json();
      setActivity(data);
    } finally {
      setLoading(null);
    }
  }

  return (
    <main className="page">
      <div className="shell">
        <div className="topbar">
          <div className="brand">
            <div className="logo">M</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 20 }}>{appName}</div>
              <div style={{ color: "#94a3b8", fontSize: 14 }}>AI payments dashboard</div>
            </div>
          </div>
          <div className="badge">Live-ready Vercel build</div>
        </div>

        <section className="hero">
          <div className="hero-grid">
            <div>
              <div className="badge" style={{ width: "fit-content", marginBottom: 14 }}>Usage-based AI billing</div>
              <h1 className="headline">A clean, founder-grade dashboard for AI payments and tipping.</h1>
              <p className="subtext">
                Verify USDC payments on Polygon, meter prompt usage, trigger AI runs after verified payment,
                and log activity to Supabase. This build is intentionally lean, polished, and safe to deploy.
              </p>
              <div className="mini-grid">
                {metrics.map((item) => (
                  <div className="metric" key={item.label}>
                    <div className="label">{item.label}</div>
                    <div className="value">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="panel">
              <div className="kv"><span>Product</span><span>{appName}</span></div>
              <div className="kv"><span>Network</span><span>{networkLabel}</span></div>
              <div className="kv"><span>AI model</span><span>Gemini 2.5 Flash</span></div>
              <div className="kv"><span>Backend</span><span>Next.js App Router</span></div>
              <div className="kv"><span>Database</span><span>Supabase</span></div>
            </div>
          </div>
        </section>

        <section className="grid">
          <div className="card">
            <div className="card-body">
              <h2>1. Verify payment</h2>
              <p>Checks whether a Polygon USDC transaction sent funds from the wallet to your treasury.</p>
              <div className="form-grid">
                <input value={wallet} onChange={(e) => setWallet(e.target.value)} placeholder="Sender wallet address" />
                <input value={txHash} onChange={(e) => setTxHash(e.target.value)} placeholder="Polygon tx hash" />
                <button onClick={handleVerify}>{loading === "verify" ? "Verifying..." : "Verify payment"}</button>
                <div className="panel output">{verifyResult ? JSON.stringify(verifyResult, null, 2) : "No verification result yet."}</div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <h2>2. Run paid prompt</h2>
              <p>Runs Gemini only after the submitted payment is verified.</p>
              <div className="form-grid">
                <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Enter prompt" />
                <button onClick={handleRun}>{loading === "run" ? "Running..." : "Run prompt after payment"}</button>
                <div className="panel output">{runResult ? JSON.stringify(runResult, null, 2) : "No AI result yet."}</div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <h2>3. Tip a wallet</h2>
              <p>Stores a tip intent and optional transaction hash. Easy to extend with creator splits later.</p>
              <div className="form-grid">
                <div className="row">
                  <input value={tipReceiver} onChange={(e) => setTipReceiver(e.target.value)} placeholder="Receiver wallet" />
                  <input value={tipAmount} onChange={(e) => setTipAmount(e.target.value)} placeholder="Tip amount in USDC" />
                </div>
                <input value={tipTxHash} onChange={(e) => setTipTxHash(e.target.value)} placeholder="Optional tip tx hash" />
                <button onClick={handleTip}>{loading === "tip" ? "Saving..." : "Record tip"}</button>
                <div className="panel output">{tipResult ? JSON.stringify(tipResult, null, 2) : "No tip recorded yet."}</div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <h2>4. Activity rail</h2>
              <p>Loads the latest verified payments, prompt runs, and tip activity from Supabase.</p>
              <div className="form-grid">
                <button className="secondary" onClick={loadActivity}>{loading === "activity" ? "Loading..." : "Load activity"}</button>
                <div className="panel output">{activity ? JSON.stringify(activity, null, 2) : "No activity loaded yet."}</div>
              </div>
              <div className="footer-note">This UI is intentionally dependency-light so it deploys cleanly on Vercel.</div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
