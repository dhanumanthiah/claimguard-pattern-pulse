"use client";

import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-[#1B3A6B] text-[#CADCFC] text-[11px] text-center py-4 mt-10 border-t border-white/10">
      <p>© {new Date().getFullYear()} ClaimsGuard AI. All rights reserved.</p>
      <p className="mt-1 opacity-60">Powered by Synthetic Data Analysis Engine</p>
    </footer>
  );
}

