'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, CheckCircle, Shield, MessageCircle, Zap, Clock, CreditCard, Wrench, Lightbulb, Wind, Phone } from 'lucide-react';

function Section({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function ChatBubble({ children, side, delay = 0 }: { children: React.ReactNode; side: 'user' | 'agent'; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: side === 'user' ? 30 : -30, scale: 0.95 }}
      animate={isInView ? { opacity: 1, x: 0, scale: 1 } : { opacity: 0, x: side === 'user' ? 30 : -30, scale: 0.95 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      className={side === 'user' ? 'flex justify-end' : 'flex justify-start'}
    >
      <div className={`max-w-[80%] sm:max-w-[70%] px-4 py-3 text-sm sm:text-base ${
        side === 'user'
          ? 'bubble-user bg-primary text-primary-foreground'
          : 'bubble-agent bg-card border border-border shadow-sm text-foreground'
      }`}>
        {children}
      </div>
    </motion.div>
  );
}

export default function Homepage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Navbar */}
      <header className="sticky top-0 z-50 glass">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
          <a href="/" className="text-xl font-bold text-gradient">SpringUpAI</a>
          <nav className="hidden sm:flex items-center gap-6">
            <a href="#how" className="text-sm text-muted-foreground hover:text-foreground transition">How it works</a>
            <a href="#services" className="text-sm text-muted-foreground hover:text-foreground transition">Services</a>
            <a href="/vendor/login" className="text-sm text-muted-foreground hover:text-foreground transition">For Vendors</a>
          </nav>
          <a href="https://wa.me/message" className="relative px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:scale-105 active:scale-95 transition-transform">
            <span className="relative z-10 flex items-center gap-1.5">
              <MessageCircle size={14} /> Chat Now
            </span>
          </a>
        </div>
      </header>

      {/* Hero — Conversational */}
      <section className="relative gradient-hero">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 pb-12">
          {/* Floating badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center mb-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 border border-primary/10 text-sm text-muted-foreground">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Trusted by 1,000+ Nigerians daily
            </div>
          </motion.div>

          {/* Main heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-center mb-4 tracking-tight"
          >
            Just say it.<br />
            <span className="text-gradient">We&apos;ll handle it.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-lg sm:text-xl text-muted-foreground text-center max-w-2xl mx-auto mb-10"
          >
            Fix, pay, or book anything — no apps, no stress.<br className="hidden sm:block" />
            Send a WhatsApp message. We take it from there.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.45 }}
            className="flex flex-col sm:flex-row gap-3 justify-center mb-16"
          >
            <a href="https://wa.me/message" className="group relative px-7 py-3.5 bg-primary text-primary-foreground rounded-full font-semibold hover:scale-105 active:scale-95 transition-transform inline-flex items-center justify-center gap-2 shadow-elevated">
              <MessageCircle size={18} />
              Start on WhatsApp
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              <div className="absolute inset-0 rounded-full shimmer pointer-events-none" />
            </a>
            <a href="#demo" className="px-7 py-3.5 border border-border text-foreground rounded-full font-semibold hover:bg-secondary transition inline-flex items-center justify-center gap-2">
              See how it works
            </a>
          </motion.div>

          {/* Hero Chat Preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-lg mx-auto"
          >
            <div className="bg-card border border-border rounded-2xl shadow-float overflow-hidden">
              {/* Chat header */}
              <div className="px-4 py-3 border-b border-border flex items-center gap-3 bg-secondary/50">
                <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center">
                  <Zap size={16} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold">SpringUpAI</p>
                  <p className="text-xs text-green-600">Online</p>
                </div>
              </div>
              {/* Chat messages */}
              <div className="px-4 py-5 space-y-3">
                <div className="flex justify-end">
                  <div className="bubble-user bg-primary text-primary-foreground px-4 py-2.5 text-sm">
                    I need a plumber in Ikeja
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="bubble-agent bg-secondary border border-border px-4 py-2.5 text-sm">
                    Got it! Verified plumber available in 30 mins.<br />₦15,000 estimate. Proceed? ✓
                  </div>
                </div>
                <div className="flex justify-end">
                  <div className="bubble-user bg-primary text-primary-foreground px-4 py-2.5 text-sm">
                    Yes please
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="bubble-agent bg-secondary border border-border px-4 py-2.5 text-sm">
                    Done! Connecting you now 🔗
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works — Timeline */}
      <section id="how" className="py-20 sm:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Section>
            <p className="text-sm font-medium text-primary text-center mb-2 tracking-wide uppercase">Simple as chatting</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-16">Three messages. That&apos;s all.</h2>
          </Section>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-12 left-[16.6%] right-[16.6%] h-0.5 bg-linear-to-r from-primary/20 via-primary/40 to-primary/20" />

            {[
              { num: '1', icon: MessageCircle, title: 'Tell us what you need', desc: '"Fix my AC", "Pay my light bill", "I need a plumber now"' },
              { num: '2', icon: Zap, title: 'We handle everything', desc: 'We find verified providers, negotiate price, and coordinate the job' },
              { num: '3', icon: CheckCircle, title: 'You pay when done', desc: 'Safe escrow payment. No risk. No stress. Just results.' },
            ].map((step, i) => (
              <Section key={step.num} delay={i * 0.15}>
                <div className="relative text-center group">
                  <div className="w-20 h-20 mx-auto mb-5 rounded-2xl gradient-primary flex items-center justify-center shadow-elevated group-hover:scale-110 transition-transform duration-300">
                    <step.icon size={28} className="text-white" />
                  </div>
                  <div className="text-xs font-bold text-primary mb-2">STEP {step.num}</div>
                  <h3 className="font-bold text-lg mb-2">{step.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{step.desc}</p>
                </div>
              </Section>
            ))}
          </div>
        </div>
      </section>

      {/* Services — Card Grid */}
      <section id="services" className="py-20 sm:py-28 bg-secondary/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Section>
            <p className="text-sm font-medium text-primary text-center mb-2 tracking-wide uppercase">What you can do</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">Everything you usually stress about</h2>
            <p className="text-muted-foreground text-center max-w-xl mx-auto mb-14">One WhatsApp message handles all of these. No separate apps. No negotiations.</p>
          </Section>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              { icon: Wrench, label: 'Plumbing' },
              { icon: Wind, label: 'AC Repair' },
              { icon: Lightbulb, label: 'Electrical' },
              { icon: Wrench, label: 'Appliances' },
              { icon: CreditCard, label: 'Electricity Bills' },
              { icon: Phone, label: 'Airtime & Data' },
              { icon: CreditCard, label: 'Internet' },
              { icon: CreditCard, label: 'Cable TV' },
            ].map((service, i) => (
              <Section key={service.label} delay={i * 0.05}>
                <div className="group bg-card border border-border rounded-xl p-5 text-center hover:shadow-float hover:-translate-y-1 transition-all duration-300 cursor-default">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                    <service.icon size={22} className="text-primary" />
                  </div>
                  <p className="text-sm font-medium">{service.label}</p>
                </div>
              </Section>
            ))}
          </div>
        </div>
      </section>

      {/* Conversation Demo — The Heart */}
      <section id="demo" className="py-20 sm:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Section>
            <p className="text-sm font-medium text-primary text-center mb-2 tracking-wide uppercase">See it in action</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">Real conversations. Real results.</h2>
            <p className="text-muted-foreground text-center max-w-xl mx-auto mb-14">This is what it actually looks like when you message SpringUpAI.</p>
          </Section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Conversation 1 */}
            <div className="bg-card border border-border rounded-2xl shadow-elevated overflow-hidden">
              <div className="px-4 py-3 border-b border-border bg-secondary/30">
                <p className="text-xs font-medium text-muted-foreground">Home Service Request</p>
              </div>
              <div className="px-4 py-5 space-y-3">
                <ChatBubble side="user" delay={0}>I need a plumber in Ikeja</ChatBubble>
                <ChatBubble side="agent" delay={0.15}>Got it. Verified plumber available. ₦15,000 estimate. Proceed?</ChatBubble>
                <ChatBubble side="user" delay={0.3}>Yes</ChatBubble>
                <ChatBubble side="agent" delay={0.45}>Done ✓ Plumber arriving in 30 minutes. You&apos;ll pay after the work is verified.</ChatBubble>
              </div>
            </div>

            {/* Conversation 2 */}
            <div className="bg-card border border-border rounded-2xl shadow-elevated overflow-hidden">
              <div className="px-4 py-3 border-b border-border bg-secondary/30">
                <p className="text-xs font-medium text-muted-foreground">Bill Payment</p>
              </div>
              <div className="px-4 py-5 space-y-3">
                <ChatBubble side="user" delay={0}>Pay my electricity bill</ChatBubble>
                <ChatBubble side="agent" delay={0.15}>Found your IKEDC bill: ₦8,200. Confirm payment?</ChatBubble>
                <ChatBubble side="user" delay={0.3}>Yes, pay it</ChatBubble>
                <ChatBubble side="agent" delay={0.45}>Paid ✓ Receipt sent. Balance updated.</ChatBubble>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Video Section */}
      <section className="py-20 sm:py-28 bg-secondary/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Section>
            <p className="text-sm font-medium text-primary text-center mb-2 tracking-wide uppercase">Watch it work</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">What it feels like</h2>
          </Section>
          <Section delay={0.2}>
            <div className="max-w-3xl mx-auto rounded-2xl shadow-float overflow-hidden border border-border" style={{ position: 'relative', paddingBottom: '56.25%' }}>
              <iframe
                className="absolute inset-0 w-full h-full"
                src="https://e2b.x-pilot.ai/share/OMjFScR49dPiv6eXjtyrS/preview"
                title="SpringUpAI Demo - How to fix, pay, or book anything via WhatsApp in Nigeria"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
              />
            </div>
          </Section>
        </div>
      </section>

      {/* Why People Trust Us */}
      <section className="py-20 sm:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Section>
            <p className="text-sm font-medium text-primary text-center mb-2 tracking-wide uppercase">Built for trust</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-14">Safe by design</h2>
          </Section>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-4xl mx-auto">
            {[
              { icon: Shield, text: 'Money held until work is verified' },
              { icon: CheckCircle, text: 'Only verified professionals' },
              { icon: MessageCircle, text: 'Support if anything goes wrong' },
              { icon: CreditCard, text: 'You approve every payment' },
            ].map((item, i) => (
              <Section key={item.text} delay={i * 0.1}>
                <div className="bg-card border border-border rounded-xl p-5 text-center hover:shadow-elevated transition-shadow duration-300">
                  <div className="w-11 h-11 mx-auto mb-3 rounded-full bg-primary/5 flex items-center justify-center">
                    <item.icon size={20} className="text-primary" />
                  </div>
                  <p className="text-sm font-medium leading-relaxed">{item.text}</p>
                </div>
              </Section>
            ))}
          </div>
        </div>
      </section>

      {/* Why SpringUpAI Exists */}
      <section className="py-20 sm:py-28 bg-secondary/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Section>
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">Why this exists</h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                People are tired of jumping between apps, chasing unreliable service providers, and payment confusion.
              </p>
              <p className="text-lg font-semibold text-foreground">
                We remove all of that. One message. Everything handled.
              </p>
            </div>
          </Section>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-20 sm:py-28 overflow-hidden">
        <div className="absolute inset-0 gradient-primary opacity-95" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,oklch(1_0_0/0.05),transparent_60%)]" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Section>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              Tell us once.<br />We handle everything.
            </h2>
            <p className="text-white/80 text-lg mb-8 max-w-lg mx-auto">
              Join thousands of Nigerians who stopped stressing about everyday tasks.
            </p>
            <a href="https://wa.me/message" className="group inline-flex px-8 py-4 bg-white text-primary rounded-full font-bold text-lg hover:scale-105 active:scale-95 transition-transform items-center gap-2 shadow-float">
              <MessageCircle size={20} />
              Start on WhatsApp
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </a>
          </Section>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-xl font-bold text-gradient">SpringUpAI</div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="/vendor/signup" className="hover:text-foreground transition">For Vendors</a>
              <a href="https://wa.me/message" className="hover:text-foreground transition">Contact</a>
            </div>
            <p className="text-xs text-muted-foreground">&copy; 2026 SpringUpAI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
