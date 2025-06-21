"use client";

import { useScriptStore } from '@/lib/store';
import { WelcomeScreen } from '@/components/welcome-screen';
import { ScreenplayEditor } from '@/components/screenplay-editor';
import { Header } from '@/components/header';

export default function Home() {
  const { currentScript } = useScriptStore();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="h-[calc(100vh-4rem)]">
        {currentScript ? <ScreenplayEditor /> : <WelcomeScreen />}
      </main>
    </div>
  );
}