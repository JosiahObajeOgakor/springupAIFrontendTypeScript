'use client';

import { ArrowRight, CheckCircle, Shield, Play } from 'lucide-react';

export default function Homepage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
          <div className="text-xl font-bold text-primary">SpringUpAI</div>
          <a href="https://wa.me/message" className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition">
            Chat on WhatsApp
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold mb-4">Just say it. We&apos;ll handle it.</h1>
        <p className="text-lg text-muted-foreground mb-2">Fix, pay, or book anything—no apps, no stress, no confusion.</p>
        <p className="text-lg text-muted-foreground mb-8">Send a message or voice note. We take it from there.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-4">
          <a href="https://wa.me/message" className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition inline-flex items-center justify-center gap-2">
            Start on WhatsApp <ArrowRight size={18} />
          </a>
          <button onClick={() => document.getElementById('video')?.scrollIntoView({ behavior: 'smooth' })} className="px-6 py-3 border-2 border-primary text-primary rounded-lg font-semibold hover:bg-secondary transition inline-flex items-center justify-center gap-2">
            <Play size={18} /> See how it works
          </button>
        </div>
        <p className="text-sm text-muted-foreground">Trusted execution for home services, bills, and everyday tasks.</p>
      </section>

      {/* How It Works */}
      <section className="bg-secondary py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-10">How SpringUpAI works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { num: '1', title: 'Tell us what you need', desc: '"Fix my AC", "Pay electricity bill", "I need a plumber"' },
              { num: '2', title: 'We get it done', desc: 'We find trusted providers and handle everything' },
              { num: '3', title: 'You pay when it\u2019s done', desc: 'Safe payment. No stress. No risk.' },
            ].map((step) => (
              <div key={step.num} className="bg-background rounded-xl p-6 border border-border text-center">
                <div className="text-3xl font-bold text-primary mb-2">{step.num}</div>
                <h3 className="font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What You Can Do */}
      <section className="py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-10">Everything you usually stress about</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-lg mb-4">Home Services</h3>
              <ul className="space-y-2">
                {['Plumbing repairs', 'AC servicing', 'Electrical faults', 'Appliance fixes'].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm">
                    <CheckCircle size={16} className="text-primary flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-4">Bills & Payments</h3>
              <ul className="space-y-2">
                {['Electricity bills', 'Airtime & data', 'Internet subscriptions', 'Cable TV'].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm">
                    <CheckCircle size={16} className="text-primary flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Why People Use */}
      <section className="bg-secondary py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-10">Less stress. More done.</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              'No apps to download',
              'No vendors to negotiate with',
              'No failed payments or confusion',
              'Everything handled for you',
            ].map((item) => (
              <div key={item} className="bg-background rounded-xl p-4 border border-border flex items-start gap-3">
                <CheckCircle size={18} className="text-primary flex-shrink-0 mt-0.5" />
                <p className="text-sm">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Video */}
      <section id="video" className="py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-8">What it feels like</h2>
          <div className="max-w-3xl mx-auto bg-secondary rounded-xl border border-border overflow-hidden" style={{ paddingBottom: '56.25%', position: 'relative' }}>
            <iframe className="absolute inset-0 w-full h-full" src="https://e2b.x-pilot.ai/share/OMjFScR49dPiv6eXjtyrS/preview" title="SpringUpAI Demo - How to fix, pay, or book anything via WhatsApp in Nigeria" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen loading="lazy" />
          </div>
        </div>
      </section>

      {/* Conversation Example */}
      <section className="bg-secondary py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-8">Real conversations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {[
              {
                user: 'I need a plumber in Ikeja',
                agent: 'Got it. Verified plumber available. \u20a615,000 estimate. Proceed?',
                userReply: 'Yes',
                agentReply: 'Done. Your request is being handled.',
              },
              {
                user: 'Pay my electricity bill',
                agent: 'Bill found: \u20a68,200. Confirm payment?',
                userReply: 'Yes',
                agentReply: 'Paid. Receipt sent.',
              },
            ].map((conv, i) => (
              <div key={i} className="bg-background rounded-xl p-4 border border-border space-y-3 text-sm">
                <div className="text-right">
                  <div className="bg-primary text-primary-foreground rounded-lg px-3 py-2 inline-block max-w-xs">{conv.user}</div>
                </div>
                <div className="text-left">
                  <div className="bg-muted text-foreground rounded-lg px-3 py-2 inline-block max-w-xs">{conv.agent}</div>
                </div>
                <div className="text-right">
                  <div className="bg-primary text-primary-foreground rounded-lg px-3 py-2 inline-block max-w-xs">{conv.userReply}</div>
                </div>
                <div className="text-left">
                  <div className="bg-muted text-foreground rounded-lg px-3 py-2 inline-block max-w-xs">{conv.agentReply}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-10">Safe by design</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {[
              'Your money is held safely until work is done',
              'Only verified professionals are used',
              'Support is available if anything goes wrong',
              'You always approve before payment',
            ].map((item) => (
              <div key={item} className="bg-secondary rounded-xl p-4 border border-border text-center flex flex-col items-center gap-2">
                <Shield size={20} className="text-primary" />
                <p className="text-sm">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why */}
      <section className="bg-secondary py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Why SpringUpAI exists</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-4">People are tired of jumping between apps, unreliable service providers, chasing people for simple tasks, and payment stress.</p>
          <p className="font-semibold">We remove all of that.</p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-primary text-primary-foreground py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">Tell us once. We handle everything.</h2>
          <a href="https://wa.me/message" className="inline-flex px-6 py-3 bg-primary-foreground text-primary rounded-lg font-semibold hover:opacity-90 transition items-center gap-2">
            Start on WhatsApp <ArrowRight size={18} />
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary border-t border-border py-4">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-muted-foreground text-xs">
          <p>&copy; 2026 SpringUpAI</p>
        </div>
      </footer>
    </div>
  );
}
