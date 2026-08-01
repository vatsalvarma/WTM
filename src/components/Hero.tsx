import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { Calendar, Clock, Mic2, Star, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Hero() {
  const heroRef = useRef<HTMLDivElement>(null);
  
  const calculateTimeLeft = () => {
    // Event Date: 9th Aug 2026, 3:00 PM IST
    const difference = +new Date('2026-08-09T15:00:00+05:30') - +new Date();
    if (difference <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    
    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60)
    };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Draw animations for borders
      gsap.fromTo('.draw-border', 
        { width: 0, height: 0, opacity: 0 },
        { width: '100%', height: '100%', opacity: 1, duration: 1.5, ease: 'power3.inOut', stagger: 0.2 }
      );
      
      // Text draw/reveal animations
      gsap.fromTo('.text-draw',
        { clipPath: 'inset(0 100% 0 0)' },
        { clipPath: 'inset(0 0% 0 0)', duration: 1.2, ease: 'power4.inOut', stagger: 0.15, delay: 0.5 }
      );

      gsap.from('.reveal-up', {
        y: 50,
        opacity: 0,
        duration: 1,
        stagger: 0.1,
        ease: 'power3.out',
        delay: 1
      });
      
      gsap.from('.fade-in', {
        opacity: 0,
        duration: 1.5,
        delay: 1.5,
        ease: 'power2.out'
      });
    }, heroRef);

    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => {
      ctx.revert();
      clearInterval(interval);
    };
  }, []);

  return (
    <div ref={heroRef} className="relative h-[100dvh] w-full flex flex-col items-center justify-between px-4 lg:px-10 overflow-hidden bg-[#050505] py-4">
      {/* Dynamic Grid Background */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      <div className="absolute inset-0 z-0 bg-gradient-to-tr from-[#D4AF37]/5 via-transparent to-transparent"></div>

      <div className="z-10 w-full max-w-7xl mx-auto flex flex-col h-full justify-center">
        
        {/* Main Content Split */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-12 items-center w-full mt-4 lg:mt-8">
          
          {/* Left Side: Photo, Logo, & Countdown */}
          <div className="w-full lg:w-[45%] flex flex-col relative h-full justify-center">
            <div className="absolute -left-4 lg:-left-8 top-1/4 -translate-y-1/2 flex flex-col gap-3 text-[10px] font-bold tracking-[0.3em] uppercase text-gray-500 z-20 reveal-up hidden md:flex">
              <span className="[writing-mode:vertical-lr] rotate-180 text-[#D4AF37]">ART.</span>
              <span className="[writing-mode:vertical-lr] rotate-180">MIC.</span>
              <span className="[writing-mode:vertical-lr] rotate-180 text-red-500">LIVE.</span>
              <span className="[writing-mode:vertical-lr] rotate-180">CONTENT.</span>
            </div>

            <div className="relative p-2 lg:p-4 mb-4">
              {/* Draw Border Animation Containers */}
              <div className="absolute top-0 left-0 border-t-2 border-l-2 border-[#D4AF37] draw-border z-20 rounded-tl-3xl"></div>
              <div className="absolute bottom-0 right-0 border-b-2 border-r-2 border-[#D4AF37] draw-border z-20 rounded-br-3xl"></div>

              <div className="relative rounded-3xl overflow-hidden glass-card shadow-2xl group w-full max-w-lg mx-auto">
                <img src={`${import.meta.env.BASE_URL}artists_photo.png`} alt="Artists" className="w-full h-[35vh] lg:h-[45vh] object-cover filter contrast-125 brightness-90 group-hover:scale-105 transition-transform duration-1000" />
                
                {/* Logo Overlay */}
                <div className="absolute top-4 left-0 right-0 flex flex-col items-center z-20 reveal-up">
                  <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-gradient drop-shadow-[0_5px_15px_rgba(0,0,0,0.8)] leading-none">
                    WHAT THE MIC
                  </h1>
                  <div className="text-[#D4AF37] text-xl font-bold flex items-center gap-2 drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] mt-1">
                    <span className="text-red-500 font-serif italic text-2xl">5.0</span>
                    <span className="tracking-widest uppercase text-xs">EDITION</span>
                  </div>
                </div>

                {/* Artist Names Overlay */}
                <div className="absolute bottom-4 w-full px-4 flex justify-between items-end z-20 reveal-up">
                  <div className="text-left">
                    <p className="font-bold text-xs md:text-sm leading-none text-white drop-shadow-lg">VARUN REDDY</p>
                    <p className="text-red-500 text-[8px] uppercase tracking-wider font-bold drop-shadow-lg mt-1">Film Director</p>
                  </div>
                  <div className="text-center pb-2">
                    <p className="font-bold text-2xl md:text-4xl text-[#D4AF37] leading-none drop-shadow-lg" style={{fontFamily: "'Great Vibes', cursive"}}>Sherni</p>
                    <p className="text-white text-[8px] uppercase tracking-[0.3em] font-medium drop-shadow-lg mt-1">Rapper</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-xs md:text-sm leading-none text-white drop-shadow-lg">VIJJU MUDHIRAJ</p>
                    <p className="text-red-500 text-[8px] uppercase tracking-wider font-bold drop-shadow-lg mt-1">Choreographer</p>
                  </div>
                </div>
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/60 pointer-events-none"></div>
              </div>
            </div>

            {/* Countdown moved below image */}
            <div className="flex flex-col items-center fade-in w-full">
              <p className="text-red-500 font-bold uppercase tracking-[0.3em] text-[8px] md:text-[9px] mb-2 md:mb-3">The stage goes live in</p>
              <div className="flex gap-2 md:gap-4 justify-center">
                {[
                  { label: 'Days', value: timeLeft.days },
                  { label: 'Hrs', value: timeLeft.hours },
                  { label: 'Min', value: timeLeft.minutes },
                  { label: 'Sec', value: timeLeft.seconds }
                ].map((item, idx) => (
                  <div key={idx} className="flex flex-col items-center">
                    <div className="glass w-12 h-14 md:w-16 md:h-16 rounded-xl flex items-center justify-center border-t border-l border-white/10 border-b border-r border-black/50 shadow-xl mb-1 md:mb-2 relative overflow-hidden group">
                      <div className="absolute inset-0 bg-[#D4AF37]/5 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300"></div>
                      <span className="text-xl md:text-2xl font-black text-[#D4AF37] font-serif relative z-10 drop-shadow-md">{item.value.toString().padStart(2, '0')}</span>
                    </div>
                    <span className="text-[8px] md:text-[9px] text-gray-500 uppercase tracking-widest font-bold">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Side: Data */}
          <div className="w-full lg:w-[55%] flex flex-col relative justify-center">
            
            {/* Animated SVG Mic Background */}
            <div className="absolute right-0 -top-8 opacity-10 pointer-events-none hidden md:block z-0">
               <motion.svg className="w-64 h-64 md:w-80 md:h-80 text-[#D4AF37]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round">
                 <motion.path 
                   initial={{ pathLength: 0 }}
                   animate={{ pathLength: 1 }}
                   transition={{ duration: 4, ease: "easeInOut", delay: 0.5 }}
                   d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"
                 />
                 <motion.path 
                   initial={{ pathLength: 0 }}
                   animate={{ pathLength: 1 }}
                   transition={{ duration: 3, ease: "easeInOut", delay: 1.5 }}
                   d="M19 10v2a7 7 0 0 1-14 0v-2"
                 />
                 <motion.line 
                   initial={{ pathLength: 0 }}
                   animate={{ pathLength: 1 }}
                   transition={{ duration: 1.5, ease: "easeInOut", delay: 3 }}
                   x1="12" x2="12" y1="19" y2="22"
                 />
               </motion.svg>
            </div>

            <div className="relative z-10 flex flex-col">
              <h3 className="text-white text-xl md:text-2xl font-black uppercase tracking-tight text-draw mb-1">
                DON'T MISS
              </h3>
              <h2 className="text-5xl md:text-7xl lg:text-8xl font-black text-[#D4AF37] uppercase tracking-tighter leading-none mb-3 text-draw drop-shadow-[0_0_30px_rgba(212,175,55,0.2)]">
                THE BIG<br/>EVENT!
              </h2>
              
              <div className="bg-red-600 text-white font-black italic text-2xl md:text-4xl uppercase tracking-tighter px-4 py-1.5 md:py-2 inline-block transform -skew-x-12 mb-3 md:mb-4 w-fit text-draw shadow-[4px_4px_0px_#D4AF37]">
                ENROLL SOON!
              </div>
              
              <p className="text-[#D4AF37] font-bold text-lg md:text-xl uppercase tracking-widest text-draw mb-4 md:mb-6">
                GRAB YOUR PASSES <span className="text-red-500 animate-pulse">NOW!</span>
              </p>
              
              <p className="text-gray-300 text-xs md:text-sm uppercase tracking-wider font-medium text-draw max-w-md mb-6 leading-relaxed">
                Don't miss your chance to perform in front of <span className="text-white font-bold">well known faces</span> of the industry!
              </p>

              {/* Features Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 border-y border-white/10 py-4 mb-6 reveal-up">
                <div className="flex items-start gap-2">
                  <div className="bg-[#D4AF37]/10 p-1.5 md:p-2 rounded-lg">
                    <Mic2 size={16} className="text-[#D4AF37]" />
                  </div>
                  <div>
                    <p className="text-[9px] md:text-[10px] uppercase font-bold text-gray-300 leading-tight">Perform.<br/>Be Seen.<br/>Get Recognized.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="bg-[#D4AF37]/10 p-1.5 md:p-2 rounded-lg">
                    <Star size={16} className="text-[#D4AF37]" />
                  </div>
                  <div>
                    <p className="text-[9px] md:text-[10px] uppercase font-bold text-gray-300 leading-tight">Perform in front of<br/>well known faces<br/>of the industry.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="bg-red-500/10 p-1.5 md:p-2 rounded-lg">
                    <Zap size={16} className="text-red-500" />
                  </div>
                  <div>
                    <p className="text-[9px] md:text-[10px] uppercase font-bold text-red-500 leading-tight">Limited Slots.<br/>High Impact.</p>
                  </div>
                </div>
              </div>

              {/* Info Bar */}
              <div className="flex flex-wrap items-center gap-4 text-draw">
                 <div className="flex items-center gap-1.5">
                    <Calendar className="text-[#D4AF37]" size={14} />
                    <div>
                      <p className="text-[8px] uppercase text-gray-500 leading-none">Sunday</p>
                      <p className="font-bold text-red-500 text-[10px] md:text-xs leading-tight">09 AUG 2026</p>
                    </div>
                 </div>
                 
                 <div className="w-px h-5 bg-white/20 hidden md:block"></div>
                 
                 <div className="flex items-center gap-1.5">
                    <Clock className="text-[#D4AF37]" size={14} />
                    <div>
                      <p className="text-[8px] uppercase text-gray-500 leading-none">Starts</p>
                      <p className="font-bold text-[10px] md:text-xs leading-tight">3 PM ONWARDS</p>
                    </div>
                 </div>
                 
                 <div className="w-px h-5 bg-white/20 hidden md:block"></div>
                 
                 <div>
                    <p className="text-[8px] uppercase text-gray-500 leading-none mb-0.5">Venue</p>
                    <p className="font-bold text-[10px] md:text-sm tracking-wider leading-tight">SKYHY <span className="text-cyan-400 text-[8px]">LIVE</span></p>
                 </div>
                 
                 <div className="w-px h-5 bg-white/20 hidden md:block"></div>
                 
                 <div className="flex items-center gap-2 border border-[#D4AF37]/30 rounded-full px-2 py-0.5">
                   <span className="text-[9px] font-bold text-[#D4AF37]">21+ ONLY</span>
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* Global Bottom Text */}
        <div className="w-full text-center mt-auto pb-2 z-10 pt-4">
          <p className="text-base md:text-xl text-[#D4AF37] cursor-pointer hover:text-white transition-colors" style={{fontFamily: "'Great Vibes', cursive"}} onClick={() => document.getElementById('register-section')?.scrollIntoView({behavior: 'smooth'})}>
            Enroll below to grab the mic <span className="text-red-500 animate-bounce inline-block">↓</span>
          </p>
        </div>
        
      </div>
    </div>
  );
}
