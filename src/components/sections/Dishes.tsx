'use client';

import { memo, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap';
import { SectionEmblem } from '@/components/ui/SectionEmblem';
import { useTheme } from '@/lib/useTheme';
import chopstick from '../../../public/images/kitchens/chopstick.webp';
import forkLight from '../../../public/images/fork-light.png';
import scrollFull from '../../../public/images/menu/afhaal-scroll.png';
import scrollPaper from '../../../public/images/menu/afhaal-scroll-paper.png';
import scrollLeft from '../../../public/images/menu/afhaal-scroll-left.png';
import scrollRight from '../../../public/images/menu/afhaal-scroll-right.png';
import scrollLight from '../../../public/images/menu/afhaal-scroll-light.webp';
import dishCard from '../../../public/images/menu/dish-card.png';
import notesScroll from '../../../public/images/menu/dish-notes.png';

type MenuItem = {
  name: string;
  price: string;
};

type MenuCategory = {
  id: string;
  index: string;
  title: string;
  items: MenuItem[];
};

// Memoized: the scroll-spy updates `activeCategory` while the user scrolls, and
// without memo every crossing re-rendered all ~50 image cards at once (a visible
// scroll hitch on mobile).
const MenuCard = memo(function MenuCard({ item }: { item: MenuItem }) {
  return (
    <article
      data-menu-card
      className="group relative w-[84vw] max-w-[340px] shrink-0 snap-center transition-transform duration-500 ease-smooth hover:-translate-y-1.5 sm:w-auto sm:max-w-none"
    >
      <div
        data-card-media
        className="relative aspect-square w-full will-change-transform"
      >
        <Image
          src={dishCard}
          alt=""
          fill
          sizes="(max-width: 640px) 84vw, 340px"
          className="pointer-events-none select-none object-contain drop-shadow-[0_30px_70px_-50px_rgba(0,0,0,0.95)]"
        />

        {/* Dish name — cream parchment panel */}
        <div className="absolute inset-x-[15%] top-[15%] flex h-[42%] items-center justify-center text-center">
          <h4 className="text-pretty font-display text-[1.12rem] leading-[1.18] text-[#3a2418] sm:text-[1.28rem]">
            {item.name}
          </h4>
        </div>

        {/* Price — dark band */}
        <div className="absolute inset-x-[14%] top-[66%] flex h-[20%] items-center justify-center">
          <span className="tabular font-display text-2xl leading-none text-ember-soft sm:text-[1.6rem]">
            {item.price}
          </span>
        </div>
      </div>
    </article>
  );
});

export function Dishes() {
  const t = useTranslations('dishes');
  const isLight = useTheme() === 'light';
  // Stable identity so memoized cards actually skip re-renders during scroll.
  const MENU = useMemo(() => t.raw('categories') as MenuCategory[], [t]);
  const root = useRef<HTMLElement>(null);
  const sticks = useRef<HTMLDivElement>(null);
  const fork = useRef<HTMLDivElement>(null);
  const navScroller = useRef<HTMLDivElement>(null);
  const [activeCategory, setActiveCategory] = useState(MENU[0].id);

  useEffect(() => {
    const scroller = navScroller.current;
    const activeItem = scroller?.querySelector<HTMLElement>(
      `[data-category-link="${activeCategory}"]`,
    );
    if (!scroller || !activeItem) return;

    const isScrollable = scroller.scrollWidth > scroller.clientWidth + 1;
    if (!isScrollable) {
      scroller.scrollTo({ left: 0, behavior: 'auto' });
      return;
    }

    const target = Math.min(
      Math.max(
        activeItem.offsetLeft -
          (scroller.clientWidth - activeItem.offsetWidth) / 2,
        0,
      ),
      scroller.scrollWidth - scroller.clientWidth,
    );
    scroller.scrollTo({ left: target, behavior: 'smooth' });
  }, [activeCategory]);

  useGSAP(
    () => {
      const reduced = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches;
      const categories =
        gsap.utils.toArray<HTMLElement>('[data-menu-category]');
      const scrollStage = root.current?.querySelector<HTMLElement>(
        '[data-scroll-stage]',
      );
      const scrollViewport = root.current?.querySelector<HTMLElement>(
        '[data-scroll-viewport]',
      );
      const isMobileFork = window.matchMedia('(max-width: 767px)').matches;

      categories.forEach((category) => {
        ScrollTrigger.create({
          trigger: category,
          start: 'top 60%',
          end: 'bottom 60%',
          onEnter: () => setActiveCategory(category.id.replace('menu-', '')),
          onEnterBack: () =>
            setActiveCategory(category.id.replace('menu-', '')),
        });
      });

      if (sticks.current) {
        if (reduced) {
          gsap.set('[data-stick="one"]', {
            xPercent: 0,
            rotate: -5.5,
            autoAlpha: 0.88,
          });
          gsap.set('[data-stick="two"]', {
            xPercent: 0,
            rotate: -2.5,
            autoAlpha: 0.66,
          });
        } else {
          gsap
            .timeline({
              scrollTrigger: {
                trigger: sticks.current,
                start: 'top 94%',
                end: 'bottom 54%',
                scrub: 0.85,
                invalidateOnRefresh: true,
              },
            })
            .fromTo(
              '[data-stick="one"]',
              { xPercent: 118, rotate: -1, autoAlpha: 0 },
              {
                xPercent: 0,
                rotate: -5.5,
                autoAlpha: 0.88,
                ease: 'power2.out',
                duration: 1,
              },
              0,
            )
            .fromTo(
              '[data-stick="two"]',
              { xPercent: 142, rotate: 1, autoAlpha: 0 },
              {
                xPercent: 0,
                rotate: -2.5,
                autoAlpha: 0.66,
                ease: 'power2.out',
                duration: 1,
              },
              0.1,
            );
        }
      }

      if (fork.current) {
        if (reduced) {
          gsap.set('[data-fork-light]', {
            xPercent: 0,
            rotate: -7,
            autoAlpha: isMobileFork ? 0.42 : 0.52,
          });
        } else {
          gsap
            .timeline({
              scrollTrigger: {
                trigger: fork.current,
                start: isMobileFork ? 'top 96%' : 'top 94%',
                end: isMobileFork ? 'top 58%' : 'top 48%',
                scrub: isMobileFork ? 0.55 : 0.85,
                invalidateOnRefresh: true,
              },
            })
            .fromTo(
              '[data-fork-light]',
              {
                xPercent: isMobileFork ? 34 : 56,
                rotate: isMobileFork ? -4 : -2,
                autoAlpha: 0,
              },
              {
                xPercent: 0,
                rotate: -7,
                autoAlpha: isMobileFork ? 0.42 : 0.52,
                ease: 'power2.out',
                duration: 1,
              },
              0,
            );
        }
      }

      if (reduced) {
        gsap.set(
          '[data-menu-card], [data-category-heading], [data-menu-nav], [data-scroll-label]',
          {
            opacity: 1,
            y: 0,
            x: 0,
            scale: 1,
          },
        );
        gsap.set('[data-scroll-full]', { autoAlpha: 1, scaleX: 1, y: 0 });
        gsap.set('[data-scroll-paper]', { autoAlpha: 0, scaleX: 1 });
        gsap.set('[data-scroll-left], [data-scroll-right]', {
          autoAlpha: 0,
          x: 0,
        });
        const compactScale = window.innerWidth < 640 ? 0.9 : 0.66;
        if (scrollStage) {
          gsap.set(scrollStage, { scale: compactScale });
        }
        if (scrollViewport) {
          gsap.set(scrollViewport, {
            height: scrollViewport.offsetHeight * compactScale,
          });
        }
        return;
      }

      gsap.set('[data-scroll-full]', {
        autoAlpha: 0,
        scaleX: isLight ? 0.18 : 1,
        transformOrigin: '50% 50%',
      });
      gsap.set('[data-scroll-label]', { autoAlpha: 0, y: 10 });

      const navReveal = gsap.timeline({
        scrollTrigger: {
          trigger: '[data-menu-nav]',
          start: 'top 98%',
          end: 'top 54%',
          scrub: 1.08,
          invalidateOnRefresh: true,
        },
      });

      navReveal
        .fromTo(
          '[data-menu-nav]',
          { autoAlpha: 0, y: 18 },
          { autoAlpha: 1, y: 0, ease: 'power1.out', duration: 0.28 },
          0,
        );

      if (isLight) {
        navReveal.fromTo(
          '[data-scroll-full]',
          { autoAlpha: 0, scaleX: 0.18, y: 8, force3D: true },
          {
            autoAlpha: 1,
            scaleX: 1,
            y: 0,
            ease: 'power2.inOut',
            duration: 0.88,
            force3D: true,
          },
          0.08,
        );
      } else {
        navReveal
          .fromTo(
            '[data-scroll-paper]',
            { scaleX: 0.018, transformOrigin: '50% 50%', force3D: true },
            {
              scaleX: 1,
              ease: 'power1.inOut',
              duration: 0.86,
              force3D: true,
            },
            0.08,
          )
          .fromTo(
            '[data-scroll-left]',
            {
              x: () => (scrollStage?.clientWidth ?? 900) * 0.44,
              force3D: true,
            },
            {
              x: 0,
              ease: 'power1.inOut',
              duration: 0.86,
              force3D: true,
            },
            0.08,
          )
          .fromTo(
            '[data-scroll-right]',
            {
              x: () => -(scrollStage?.clientWidth ?? 900) * 0.44,
              force3D: true,
            },
            {
              x: 0,
              ease: 'power1.inOut',
              duration: 0.86,
              force3D: true,
            },
            0.08,
          )
          .to(
            '[data-scroll-full]',
            {
              autoAlpha: 1,
              ease: 'power1.out',
              duration: 0.18,
            },
            0.83,
          )
          .to(
            '[data-scroll-paper], [data-scroll-left], [data-scroll-right]',
            {
              autoAlpha: 0,
              ease: 'power1.out',
              duration: 0.14,
            },
            0.9,
          );
      }

      navReveal
        .to(
          '[data-scroll-label]',
          {
            autoAlpha: 1,
            y: 0,
            ease: 'power2.out',
            stagger: 0.035,
            duration: 0.2,
          },
          0.78,
        );

      if (scrollStage && scrollViewport) {
        const fullHeight = scrollViewport.offsetHeight;
        const compactScale = window.innerWidth < 640 ? 0.9 : 0.66;
        const compactTween = gsap
          .timeline({ paused: true })
          .to(
            scrollStage,
            {
              scale: compactScale,
              transformOrigin: 'top center',
              duration: 0.72,
              ease: 'power3.inOut',
              force3D: true,
            },
            0,
          )
          .to(
            scrollViewport,
            {
              height: fullHeight * compactScale,
              duration: 0.72,
              ease: 'power3.inOut',
            },
            0,
          );

        ScrollTrigger.create({
          trigger: '#menu-soep',
          start: 'top 72%',
          onEnter: () => compactTween.play(),
          onLeaveBack: () => compactTween.reverse(),
        });
      }

      categories.forEach((category) => {
        const cards = category.querySelectorAll('[data-menu-card]');
        const heading = category.querySelector('[data-category-heading]');

        if (heading) {
          gsap.fromTo(
            heading,
            { opacity: 0, x: -22 },
            {
              opacity: 1,
              x: 0,
              duration: 0.8,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: category,
                start: 'top 82%',
                once: true,
              },
            },
          );
        }

        gsap.fromTo(
          category.querySelectorAll('[data-card-media]'),
          { scale: 1.045 },
          {
            scale: 1,
            duration: 1.15,
            ease: 'power2.out',
            stagger: 0.055,
            scrollTrigger: {
              trigger: category,
              start: 'top 78%',
              once: true,
            },
          },
        );

        gsap.fromTo(
          cards,
          { opacity: 0, y: 38, scale: 0.99 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.9,
            ease: 'power3.out',
            stagger: 0.07,
            scrollTrigger: {
              trigger: category,
              start: 'top 80%',
              once: true,
            },
          },
        );
      });

      requestAnimationFrame(() => ScrollTrigger.refresh());
    },
    { scope: root, dependencies: [isLight], revertOnUpdate: true },
  );

  return (
    <section
      ref={root}
      id="dishes"
      className="relative scroll-mt-24 overflow-x-clip pb-24 md:pb-32"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-36 h-[620px] w-[min(94vw,1100px)] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(193,39,45,0.07),transparent_68%)] blur-3xl" />
        <div className="absolute inset-y-0 left-5 w-px bg-gradient-to-b from-transparent via-ember/[0.07] to-transparent sm:left-8 lg:left-12" />
        <div className="absolute inset-y-0 right-5 w-px bg-gradient-to-b from-transparent via-ember/[0.07] to-transparent sm:right-8 lg:right-12" />
      </div>

      <div
        ref={sticks}
        aria-hidden="true"
        className="dark-only pointer-events-none relative z-0 -mb-32 h-44 overflow-visible sm:-mb-40 sm:h-52 md:-mb-48 md:h-64"
      >
        <Image
          data-stick="one"
          src={chopstick}
          alt=""
          sizes="(max-width: 640px) 112vw, 92vw"
          style={{ opacity: 0 }}
          className="absolute -right-[18%] top-[68%] h-auto w-[112%] max-w-none origin-center brightness-125 saturate-110 drop-shadow-[0_18px_22px_rgba(0,0,0,0.42)] will-change-transform sm:-right-[12%] sm:top-[56%] sm:w-[96%] md:-right-[8%] md:top-[46%] md:w-[88%]"
        />
        <Image
          data-stick="two"
          src={chopstick}
          alt=""
          sizes="(max-width: 640px) 104vw, 86vw"
          style={{ opacity: 0 }}
          className="absolute -right-[14%] top-[92%] h-auto w-[104%] max-w-none origin-center brightness-125 saturate-110 drop-shadow-[0_16px_20px_rgba(0,0,0,0.36)] will-change-transform sm:-right-[9%] sm:top-[82%] sm:w-[90%] md:-right-[5%] md:top-[72%] md:w-[82%]"
        />
      </div>

      {/* Light theme: ornate fork in place of the chopsticks — scaled to match their presence */}
      <div
        ref={fork}
        aria-hidden="true"
        className="light-only pointer-events-none absolute right-0 top-8 z-0 block h-40 w-[118vw] max-w-none overflow-visible sm:top-10 sm:h-52 sm:w-[96vw] md:top-0 md:h-72 md:w-[80vw] md:max-w-[1340px]"
      >
        <Image
          data-fork-light
          src={forkLight}
          alt=""
          sizes="(max-width: 767px) 118vw, 80vw"
          style={{ opacity: 0 }}
          className="absolute right-[-44%] top-1 h-auto w-full max-w-none origin-center -rotate-[7deg] drop-shadow-[0_24px_32px_rgba(122,84,28,0.22)] sm:right-[-30%] md:right-[-19%]"
        />
      </div>

      <div className="container-edge relative z-10">
        <header className="relative grid max-w-5xl gap-8 pt-8 md:pt-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.65fr)] lg:items-end lg:gap-16">
          <div>
            <SectionEmblem variant="takeaway" reveal={false} className="mb-3" />
            <p className="eyebrow mb-5">
              {t('eyebrow')}
            </p>
            <h2
              className="max-w-3xl text-balance font-display text-4xl leading-[1.02] text-cream sm:text-5xl md:text-6xl lg:text-[4.35rem]"
            >
              {t('title')}
            </h2>
          </div>

          <div
            className="relative border-l border-ember/25 pl-6 lg:mb-2 lg:pl-8"
          >
            <span className="absolute -left-[3px] top-0 h-1.5 w-1.5 rotate-45 bg-ember/70" />
            <p className="max-w-md text-base leading-relaxed text-cream/68 md:text-lg">
              {t('intro')}
            </p>
          </div>
        </header>

        <div
          data-menu-nav
          className="sticky top-[72px] z-30 -mx-5 mt-16 overflow-visible bg-transparent py-1 sm:-mx-8 sm:py-2 md:top-[78px] md:mt-20 lg:-mx-12"
        >
          <nav
            aria-label="Afhaalmenu categorieën"
            className="relative mx-auto max-w-[74rem] overflow-visible"
          >
            <div
              ref={navScroller}
              className="overflow-x-auto px-3 py-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:px-6 sm:py-6"
            >
              <div
                data-scroll-viewport
                className={`relative mx-auto w-[calc(100vw-2rem)] min-w-0 overflow-visible sm:w-full sm:min-w-[690px] ${
                  isLight
                    ? 'aspect-[2054/568] max-w-[1080px]'
                    : 'aspect-[1882/630] max-w-[1120px]'
                }`}
              >
                <div
                  data-scroll-stage
                  className={`absolute inset-0 origin-top transform-gpu will-change-transform ${
                    isLight
                      ? 'sm:drop-shadow-[0_24px_28px_rgba(110,78,35,0.18)]'
                      : 'sm:drop-shadow-[0_30px_38px_rgba(0,0,0,0.34)]'
                  }`}
                >
                  <Image
                    data-scroll-full
                    src={isLight ? scrollLight : scrollFull}
                    alt=""
                    fill
                    sizes="(max-width: 640px) calc(100vw - 2rem), (max-width: 1280px) 84vw, 1120px"
                    className="pointer-events-none select-none object-fill opacity-0"
                    aria-hidden="true"
                  />

                  {!isLight && (
                    <>
                      <div
                        data-scroll-paper
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-x-[6.1%] inset-y-[5.7%] will-change-transform"
                      >
                        <Image
                          src={scrollPaper}
                          alt=""
                          fill
                          sizes="(max-width: 640px) 610px, (max-width: 1280px) 82vw, 970px"
                          className="object-fill"
                        />
                      </div>

                      <div
                        data-scroll-left
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-y-[1.3%] left-0 w-[7.15%] will-change-transform"
                      >
                        <Image
                          src={scrollLeft}
                          alt=""
                          fill
                          sizes="80px"
                          className="object-fill"
                        />
                      </div>

                      <div
                        data-scroll-right
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-y-[1.3%] right-0 w-[7.15%] will-change-transform"
                      >
                        <Image
                          src={scrollRight}
                          alt=""
                          fill
                          sizes="80px"
                          className="object-fill"
                        />
                      </div>
                    </>
                  )}

                  <div
                    className={`absolute grid grid-cols-3 items-stretch ${
                      isLight
                        ? 'inset-x-[6.2%] inset-y-[21%]'
                        : 'inset-x-[8.5%] inset-y-[21%]'
                    }`}
                  >
                    {MENU.map((category) => (
                      <a
                        key={category.id}
                        data-scroll-label
                        data-category-link={category.id}
                        href={`#menu-${category.id}`}
                        onClick={() => setActiveCategory(category.id)}
                        aria-current={
                          activeCategory === category.id ? 'location' : undefined
                        }
                        className="group relative flex min-w-0 flex-col items-center justify-center gap-1 px-1.5 text-center text-[#4a281f] transition-colors duration-500 hover:text-[#8e1b20] sm:gap-3 sm:px-4"
                      >
                        <span
                          className={`grid h-6 w-6 place-items-center border font-display text-[0.55rem] leading-none transition-all duration-500 sm:h-9 sm:w-9 sm:text-[0.72rem] ${
                            activeCategory === category.id
                              ? 'border-[#7d241d] bg-[#8e1b20] text-[#f7e6c6] shadow-[0_5px_12px_rgba(91,25,20,0.2)]'
                              : 'border-[#8f5e38]/45 bg-[#fff3d8]/25 text-[#80512f]'
                          }`}
                        >
                          {category.index}
                        </span>
                        <span
                          className={`max-w-full text-balance font-display text-[0.68rem] font-semibold leading-tight transition-colors duration-500 sm:text-base ${
                            activeCategory === category.id
                              ? 'text-[#7d241d]'
                              : 'text-[#4a281f]'
                          }`}
                        >
                          {category.title}
                        </span>
                        <span
                          aria-hidden="true"
                          className={`h-px bg-[#8e1b20] transition-all duration-500 ${
                            activeCategory === category.id
                              ? 'w-12 opacity-80'
                              : 'w-0 opacity-0 group-hover:w-8 group-hover:opacity-45'
                          }`}
                        />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </nav>
        </div>

        <div className="mt-20 space-y-24 md:mt-24 md:space-y-28">
          {MENU.map((category) => (
            <section
              key={category.id}
              id={`menu-${category.id}`}
              data-menu-category
              className="scroll-mt-0"
              aria-labelledby={`menu-title-${category.id}`}
            >
              <div
                data-category-heading
                className="relative mb-8 flex flex-col items-start gap-3 border-b border-cream/10 pb-5 sm:flex-row sm:items-end sm:justify-between sm:gap-5 md:mb-10"
              >
                <div className="flex items-baseline gap-4">
                  <span className="font-display text-3xl text-ember/50 sm:text-4xl">
                    {category.index}
                  </span>
                  <h3
                    id={`menu-title-${category.id}`}
                    className="font-display text-3xl text-cream sm:text-4xl"
                  >
                    {category.title}
                  </h3>
                </div>
                <span className="shrink-0 text-[0.65rem] uppercase tracking-[0.24em] text-cream/42">
                  {t('dishCount', { count: category.items.length })}
                </span>
                <span className="absolute -bottom-px left-0 h-px w-24 bg-gradient-to-r from-ember/70 to-transparent" />
              </div>

              <div className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-6 [scroll-padding-inline:20px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:grid sm:snap-none sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-0 sm:pb-0 xl:grid-cols-3">
                {category.items.map((item) => (
                  <MenuCard key={item.name} item={item} />
                ))}
              </div>
            </section>
          ))}
        </div>

        <div
          data-reveal
          className="relative mx-auto mt-16 w-full max-w-[780px] md:mt-24"
        >
          <div className="relative aspect-[1400/499] w-full">
            <Image
              src={notesScroll}
              alt=""
              fill
              sizes="(max-width: 768px) 92vw, 780px"
              className="pointer-events-none select-none object-contain drop-shadow-[0_40px_60px_-46px_rgba(0,0,0,0.9)]"
            />

            {/* Notes set inside the parchment frame */}
            <div className="absolute inset-x-[11%] bottom-[15%] top-[24%] flex flex-col items-center justify-center text-center text-[#4a2c1c]">
              <h4 className="font-display text-[clamp(0.82rem,2.7vw,1.18rem)] leading-tight text-[#5b1914]">
                {t('notes.title')}
              </h4>
              <p className="mt-[0.45em] max-w-[42ch] text-[clamp(0.6rem,2.05vw,0.92rem)] leading-snug text-[#6b4630]">
                {t('notes.sauces')}
              </p>

              <span className="my-[0.7em] h-px w-[18%] bg-gradient-to-r from-transparent via-[#a9762b]/70 to-transparent" />

              <p className="max-w-[40ch] text-[clamp(0.58rem,1.95vw,0.86rem)] italic leading-snug text-[#6b4630]">
                {t('notes.veg')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
