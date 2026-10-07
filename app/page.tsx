import { PhoneCall, Shield, Zap, Globe } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <PhoneCall className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold tracking-tight">VoiceForge</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative overflow-hidden">
          <div className="mx-auto max-w-7xl px-6 py-24 md:py-32">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-6 inline-flex items-center rounded-full border bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
                AI Voice Agents for Every Business
              </div>
              <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
                Deploy AI Voice Agents
                <br />
                <span className="text-primary">in minutes, not weeks</span>
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
                Create intelligent voice agents that handle calls, capture leads, and book appointments — all managed from one powerful dashboard. No technical expertise required.
              </p>
              <div className="mt-8 flex items-center justify-center gap-4">
                <Link href="/signup">
                  <Button size="lg">Start Free Today</Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" size="lg">Sign In</Button>
                </Link>
              </div>
            </div>

            <div className="mt-20 grid gap-6 md:grid-cols-3">
              <FeatureCard
                icon={Zap}
                title="Instant Deployment"
                description="Configure your AI agent with a simple form and deploy it to Vapi in seconds."
              />
              <FeatureCard
                icon={Shield}
                title="Multi-Tenant Secure"
                description="Each business gets its own isolated workspace. Your data stays private and protected."
              />
              <FeatureCard
                icon={Globe}
                title="Any Industry"
                description="Restaurants, clinics, real estate, insurance, e-commerce — any business, any use case."
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="mx-auto max-w-7xl px-6 text-center text-sm text-muted-foreground">
          VoiceForge — AI Voice Agent Platform
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-6 text-left shadow-sm transition-all hover:shadow-md">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <h3 className="mb-2 font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
