import React, { useState } from "react";
import LoginLeftPanel from "@/components/layout/LoginLeftPanel";
import SignupRightPanel from "@/components/layout/SignupRightPanel";

export default function Signup() {
  return (
    <div className="flex min-h-screen">
      <SignupRightPanel />
      <LoginLeftPanel />
    </div>
  );
}
