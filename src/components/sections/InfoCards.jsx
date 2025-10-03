// 4. Information Architecture placeholder (src/components/sections/InfoCards.jsx)
import React from "react";
import { Card } from "@/components/ui/card";

const cards = [
  { title:"Capabilities", text:"AI-driven contract review, clause extraction, risk analysis." },
  { title:"Use Cases",     text:"Mergers & Acquisitions, Compliance audits, Due diligence." },
  { title:"Compliance",    text:"SOC2 TypeII, GDPR-ready, enterprise-grade security." }
];

export default function InfoCards() {
  return (
    <section className="py-16 px-6">
      <div className="mx-auto max-w-6xl grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <Card key={c.title} className="p-6 hover:shadow-lg transition-shadow">
            <h3 className="mb-2 text-xl font-semibold text-neutral-900">{c.title}</h3>
            <p className="text-neutral-700">{c.text}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}
