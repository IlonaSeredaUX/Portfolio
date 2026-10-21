import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom/client';
import { AnimatePresence, motion, useInView } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Hls from 'hls.js';
import './index.css';

// --- Types & Constants ---
type Role = 'Creative' | 'Fullstack' | 'Founder' | 'Scholar';
const ROLES: Role[] = ['Creative', 'Fullstack', 'Founder', 'Scholar'];
const LOADING_WORDS = ['Design', 'Create', 'Inspire'];

// --- Loading Screen ---
const LoadingScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [count, setCount] = useState(0);
  const [wordIndex, setWordIndex] = useState(0);
  const startTime = useRef(performance.now());

  useEffect(() => {
    const duration = 2700; // ms
    let rafId: number;

    const update = (now: number) => {
      const elapsed = now - startTime.current;
      const progress = Math.min(elapsed / duration, 1);
      const value = Math.floor(progress * 100);
      setCount(value);

      if (progress < 1) {
        rafId = requestAnimationFrame(update);
      } else {
        setTimeout(onComplete, 400);
      }
    };

    rafId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(rafId);
  }, [onComplete]);

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % LOADING_WORDS.length);
    }, 900);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] bg-bg flex flex-col items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="absolute top-8 left-8 text-xs text-muted uppercase tracking-[0.3em]"
      >
        Portfolio
      </motion.div>

      <div className="relative h-24 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.span
            key={LOADING_WORDS[wordIndex]}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="text-4xl md:text-6xl lg:text-7xl font-display italic text-text-primary/80"
          >
            {LOADING_WORDS[wordIndex]}
          </motion.span>
        </AnimatePresence>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="absolute bottom-12 right-12 text-6xl md:text-8xl lg:text-9xl font-display text-text-primary tabular-nums"
      >
        {String(count).padStart(3, '0')}
      </motion.div>

      <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-stroke/50">
        <motion.div
          className="h-full accent-gradient"
          style={{ transform: `scaleX(${count / 100})`, transformOrigin: 'left' }}
        />
      </div>
    </div>
  );
};

// --- HLS Video Background ---
const HLSVideo: React.FC<{ className?: string; overlay?: boolean; flip?: boolean }> = ({
  className = '',
  overlay = true,
  flip = false,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const src = 'https://stream.mux.com/Aa02T7oM1wH5Mk5EEVDYhbZ1ChcdhRsS2m1NYyx4Ua1g.m3u8';

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(src);
      hls.attachMedia(video);
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
    }
  }, [src]);

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        className={`absolute top-1/2 left-1/2 min-w-full min-h-full object-cover -translate-x-1/2 -translate-y-1/2 ${flip ? 'scale-y-[-1]' : ''}`}
      />
      {overlay && <div className="absolute inset-0 bg-black/20" />}
      {!flip && <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-bg to-transparent" />}
    </div>
  );
};

// --- Navbar ---
const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState('Home');

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 100);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const links = ['Home', 'Work', 'Resume'];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 md:pt-6 px-4">
      <div
        className={`inline-flex items-center rounded-full backdrop-blur-md border border-white/10 bg-surface px-2 py-2 transition-shadow ${
          scrolled ? 'shadow-md shadow-black/10' : ''
        }`}
      >
        <div className="group w-9 h-9 rounded-full bg-gradient-to-r from-[#89AACC] to-[#4E85BF] p-[1.5px] transition-transform hover:scale-110">
          <div className="w-full h-full rounded-full bg-bg flex items-center justify-center font-display italic text-[13px] text-text-primary">
            JA
          </div>
        </div>

        <div className="w-px h-5 bg-stroke mx-1 hidden sm:block" />

        {links.map((link) => (
          <button
            key={link}
            onClick={() => setActive(link)}
            className={`text-xs sm:text-sm rounded-full px-3 sm:px-4 py-1.5 sm:py-2 transition ${
              active === link
                ? 'text-text-primary bg-stroke/50'
                : 'text-muted hover:text-text-primary hover:bg-stroke/50'
            }`}
          >
            {link}
          </button>
        ))}

        <div className="w-px h-5 bg-stroke mx-1" />

        <button className="relative group text-xs sm:text-sm rounded-full px-3 sm:px-4 py-1.5 sm:py-2">
          <span className="absolute inset-[-2px] rounded-full opacity-0 group-hover:opacity-100 accent-gradient transition-opacity" />
          <span className="relative bg-surface rounded-full backdrop-blur-md flex items-center gap-1">
            Say hi <span className="text-sm">↗</span>
          </span>
        </button>
      </div>
    </nav>
  );
};

// --- Hero Section ---
const Hero: React.FC = () => {
  const [roleIndex, setRoleIndex] = useState(0);
  const nameRef = useRef<HTMLHeadingElement>(null);
  const blurRefs = useRef<(HTMLParagraphElement | HTMLDivElement)[]>([]);

  useEffect(() => {
    const interval = setInterval(() => setRoleIndex((i) => (i + 1) % ROLES.length), 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.fromTo(
      nameRef.current,
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 1.2, delay: 0.1 }
    );
    tl.fromTo(
      blurRefs.current,
      { opacity: 0, filter: 'blur(10px)', y: 20 },
      { opacity: 1, filter: 'blur(0px)', y: 0, duration: 1, stagger: 0.1, delay: 0.3 }
    );
  }, []);

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      <HLSVideo />
      <Navbar />

      <div className="relative z-10 text-center max-w-4xl px-6">
        <p ref={(el) => el && (blurRefs.current[0] = el)} className="text-xs text-muted uppercase tracking-[0.3em] mb-8">
          COLLECTION '26
        </p>
        <h1 ref={nameRef} className="text-6xl md:text-8xl lg:text-9xl font-display italic leading-[0.9] tracking-tight text-text-primary mb-6">
          Michael Smith
        </h1>
        <div ref={(el) => el && (blurRefs.current[1] = el)} className="text-sm md:text-base text-muted flex items-center justify-center gap-1 flex-wrap mb-6">
          A{' '}
          <span className="font-display italic text-text-primary inline-block min-w-[80px] text-center">
            <AnimatePresence mode="wait">
              <motion.span
                key={ROLES[roleIndex]}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.4 }}
                className="inline-block"
              >
                {ROLES[roleIndex]}
              </motion.span>
            </AnimatePresence>
          </span>{' '}
          lives in Chicago.
        </div>
        <p ref={(el) => el && (blurRefs.current[2] = el)} className="text-sm md:text-base text-muted max-w-md mx-auto mb-12">
          Designing seamless digital interactions by focusing on the unique nuances which bring systems to life.
        </p>
        <div ref={(el) => el && (blurRefs.current[3] = el)} className="inline-flex gap-4 flex-wrap justify-center">
          <button className="rounded-full text-sm px-7 py-3.5 bg-text-primary text-bg hover:bg-bg hover:text-text-primary hover:ring-2 hover:ring-[#4E85BF] transition-all hover:scale-105">
            See Works
          </button>
          <button className="rounded-full text-sm px-7 py-3.5 border-2 border-stroke bg-bg text-text-primary hover:border-transparent hover:ring-2 hover:ring-[#4E85BF] transition-all hover:scale-105">
            Reach out...
          </button>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10">
        <span className="text-xs text-muted uppercase tracking-[0.2em]">SCROLL</span>
        <div className="w-px h-10 bg-stroke relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-text-primary animate-scroll-down" />
        </div>
      </div>
    </section>
  );
};

// --- Selected Works ---
const works = [
  { title: 'Automotive Motion', span: 'md:col-span-7' },
  { title: 'Urban Architecture', span: 'md:col-span-5' },
  { title: 'Human Perspective', span: 'md:col-span-5' },
  { title: 'Brand Identity', span: 'md:col-span-7' },
];

const WorkCard: React.FC<{ title: string; span: string }> = ({ title, span }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
      className={`${span} bg-surface border border-stroke rounded-3xl aspect-[4/3] relative overflow-hidden group cursor-pointer`}
    >
      <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/1/600/400')] bg-cover bg-center group-hover:scale-105 transition-transform duration-700" />
      <div className="absolute inset-0 bg-[radial-gradient(circle,_#000_1px,_transparent_1px)] bg-[length:4px_4px] opacity-20 mix-blend-multiply" />
      <div className="absolute inset-0 bg-bg/0 group-hover:bg-bg/70 backdrop-blur-lg transition-all duration-500 flex items-center justify-center opacity-0 group-hover:opacity-100">
        <div className="bg-white rounded-full px-6 py-3 text-sm font-medium flex items-center gap-2">
          <span className="w-2 h-2 rounded-full accent-gradient" />
          View — <span className="font-display italic">{title}</span>
        </div>
      </div>
    </motion.div>
  );
};

const SelectedWorks: React.FC = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section className="bg-bg py-12 md:py-16">
      <div className="max-w-[1200px] mx-auto px-6 md:px-10 lg:px-16">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
          className="flex flex-wrap items-end justify-between mb-12"
        >
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-px bg-stroke" />
              <span className="text-xs text-muted uppercase tracking-[0.3em]">Selected Work</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-display">
              Featured <span className="italic">projects</span>
            </h2>
            <p className="text-muted text-sm mt-2">A selection of projects I've worked on, from concept to launch.</p>
          </div>
          <button className="hidden md:inline-flex items-center gap-2 rounded-full px-6 py-3 border border-stroke hover:ring-2 hover:ring-[#4E85BF] transition-all">
            View all work <span className="text-sm">→</span>
          </button>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-6">
          {works.map((work, idx) => (
            <WorkCard key={idx} title={work.title} span={work.span} />
          ))}
        </div>
      </div>
    </section>
  );
};

// --- Journal ---
const journalEntries = [
  { title: 'The Art of Motion Design', readTime: '5 min read', date: 'Apr 12, 2026' },
  { title: 'Building for the Future', readTime: '3 min read', date: 'Mar 28, 2026' },
  { title: 'Human-Centered AI', readTime: '4 min read', date: 'Mar 15, 2026' },
  { title: 'Design Systems at Scale', readTime: '6 min read', date: 'Feb 28, 2026' },
];

const Journal: React.FC = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section className="bg-bg py-16 md:py-24">
      <div className="max-w-[1200px] mx-auto px-6 md:px-10 lg:px-16">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
          className="flex flex-wrap items-end justify-between mb-12"
        >
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-px bg-stroke" />
              <span className="text-xs text-muted uppercase tracking-[0.3em]">Journal</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-display">
              Recent <span className="italic">thoughts</span>
            </h2>
            <p className="text-muted text-sm mt-2">Musings on design, technology, and creativity.</p>
          </div>
          <button className="hidden md:inline-flex items-center gap-2 rounded-full px-6 py-3 border border-stroke hover:ring-2 hover:ring-[#4E85BF] transition-all">
            View all <span className="text-sm">→</span>
          </button>
        </motion.div>

        <div className="space-y-4">
          {journalEntries.map((entry, idx) => (
            <div
              key={idx}
              className="flex items-center gap-6 p-4 bg-surface/30 hover:bg-surface border border-stroke rounded-[40px] sm:rounded-full transition-all cursor-pointer group"
            >
              <div className="w-16 h-16 rounded-full bg-[url('https://picsum.photos/seed/2/100/100')] bg-cover flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm sm:text-base truncate group-hover:text-[#4E85BF] transition">
                  {entry.title}
                </h3>
                <div className="flex gap-4 text-xs text-muted">
                  <span>{entry.readTime}</span>
                  <span>{entry.date}</span>
                </div>
              </div>
              <span className="text-muted group-hover:text-text-primary transition">→</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// --- Explorations (Parallax) ---
const Explorations: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const col1Ref = useRef<HTMLDivElement>(null);
  const col2Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        pin: contentRef.current,
        pinSpacing: false,
        start: 'top top',
        end: 'bottom bottom',
      });

      gsap.to(col1Ref.current, {
        y: -200,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
        },
      });

      gsap.to(col2Ref.current, {
        y: 200,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
        },
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="min-h-[300vh] relative">
      <div ref={contentRef} className="h-screen flex items-center justify-center sticky top-0 z-10">
        <div className="text-center">
          <p className="text-xs text-muted uppercase tracking-[0.3em] mb-4">Explorations</p>
          <h2 className="text-4xl md:text-6xl font-display">
            Visual <span className="italic">playground</span>
          </h2>
          <p className="text-muted text-sm mt-4">Pushing boundaries, one experiment at a time.</p>
          <button className="mt-6 rounded-full px-6 py-3 bg-text-primary text-bg hover:scale-105 transition">
            Dribbble →
          </button>
        </div>
      </div>

      <div className="absolute inset-0 z-20 pointer-events-none">
        <div className="max-w-[1400px] mx-auto h-full flex items-center justify-between px-6 md:px-10">
          <div ref={col1Ref} className="grid grid-cols-1 gap-12 flex-1 max-w-[320px]">
            {[1, 2, 3].map((i) => (
              <div key={i} className="aspect-square bg-surface border border-stroke rounded-2xl overflow-hidden">
                <img src={`https://picsum.photos/seed/${i+10}/400/400`} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
          <div ref={col2Ref} className="grid grid-cols-1 gap-12 flex-1 max-w-[320px] translate-y-20">
            {[4, 5, 6].map((i) => (
              <div key={i} className="aspect-square bg-surface border border-stroke rounded-2xl overflow-hidden">
                <img src={`https://picsum.photos/seed/${i+10}/400/400`} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// --- Stats ---
const Stats: React.FC = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  return (
    <section ref={ref} className="bg-bg py-16 md:py-24">
      <div className="max-w-[1200px] mx-auto px-6 md:px-10 lg:px-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {[
            { label: 'Years Experience', value: '20+' },
            { label: 'Projects Done', value: '95+' },
            { label: 'Satisfied Clients', value: '200%' },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              className="p-6 rounded-2xl border border-stroke bg-surface/30"
            >
              <p className="text-4xl md:text-5xl font-display text-text-primary">{stat.value}</p>
              <p className="text-sm text-muted mt-2">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// --- Footer ---
const Footer: React.FC = () => {
  const marqueeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.to(marqueeRef.current, {
      xPercent: -50,
      duration: 40,
      ease: 'none',
      repeat: -1,
    });
    return () => tl.kill();
  }, []);

  return (
    <footer className="bg-bg pt-16 md:pt-20 pb-8 md:pb-12 overflow-hidden relative">
      <div className="absolute inset-0">
        <HLSVideo overlay={true} flip={true} />
        <div className="absolute inset-0 bg-black/60" />
      </div>

      <div className="relative z-10">
        <div ref={marqueeRef} className="text-[10vw] font-display italic text-white/10 whitespace-nowrap tracking-tight">
          BUILDING THE FUTURE • BUILDING THE FUTURE • BUILDING THE FUTURE • BUILDING THE FUTURE • BUILDING THE FUTURE •
          BUILDING THE FUTURE • BUILDING THE FUTURE • BUILDING THE FUTURE • BUILDING THE FUTURE • BUILDING THE FUTURE •
        </div>

        <div className="max-w-[1200px] mx-auto px-6 md:px-10 lg:px-16 text-center mt-12">
          <a
            href="mailto:hello@michaelsmith.com"
            className="inline-block rounded-full px-8 py-4 bg-surface border border-stroke text-text-primary hover:ring-2 hover:ring-[#4E85BF] transition-all text-lg font-medium"
          >
            hello@michaelsmith.com
          </a>

          <div className="flex flex-wrap items-center justify-center gap-6 mt-12 text-sm text-muted">
            {['Twitter', 'LinkedIn', 'Dribbble', 'GitHub'].map((social) => (
              <a key={social} href="#" className="hover:text-text-primary transition">
                {social}
              </a>
            ))}
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              Available for projects
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

// --- Main App ---
const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    return () => {
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, []);

  return (
    <div className="bg-bg text-text-primary min-h-screen font-body">
      <AnimatePresence>
        {isLoading && <LoadingScreen onComplete={() => setIsLoading(false)} />}
      </AnimatePresence>

      {!isLoading && (
        <>
          <Hero />
          <SelectedWorks />
          <Journal />
          <Explorations />
          <Stats />
          <Footer />
        </>
      )}
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);