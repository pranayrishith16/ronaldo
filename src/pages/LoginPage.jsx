import React, { useState } from "react";
import LeftPanel from "@/components/layout/LeftPanel";
import RightPanel from "@/components/layout/RightPanel";

export default function Login() {
  return (
    <div className="flex min-h-screen">
      <LeftPanel />
      <RightPanel />
    </div>
  );
}
