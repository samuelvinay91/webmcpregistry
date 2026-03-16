'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

/**
 * Card that glows where the mouse cursor is (Raycast pattern).
 * Pure CSS + minimal JS — no animation library needed.
 */
export function GlowCard({
  children,
  className = '',
  glowColor = 'rgba(0, 212, 255, 0.12)',
  glowSize = 400,
}: {
  children: ReactNode
  className?: string
  glowColor?: string
  glowSize?: number
}) {
  const cardRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent) => {
    const el = cardRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    el.style.setProperty('--glow-x', `${e.clientX - rect.left}px`)
    el.style.setProperty('--glow-y', `${e.clientY - rect.top}px`)
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      className={`group relative overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] transition-colors hover:border-[var(--accent)]/20 ${className}`}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(${glowSize}px circle at var(--glow-x) var(--glow-y), ${glowColor}, transparent 40%)`,
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  )
}

/**
 * Section that fades in when it scrolls into view.
 * Uses IntersectionObserver — no animation library needed.
 */
export function FadeInSection({
  children,
  className = '',
  delay = 0,
}: {
  children: ReactNode
  className?: string
  delay?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.unobserve(el)
        }
      },
      { threshold: 0.1, rootMargin: '-50px' }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(30px)',
        transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
      }}
    >
      {children}
    </div>
  )
}

/**
 * Typewriter effect that types out code character by character.
 */
export function TypewriterCode({
  code,
  speed = 25,
  className = '',
  startDelay = 500,
}: {
  code: string
  speed?: number
  className?: string
  startDelay?: number
}) {
  const [displayed, setDisplayed] = useState('')
  const [started, setStarted] = useState(false)
  const ref = useRef<HTMLPreElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true)
          observer.unobserve(el)
        }
      },
      { threshold: 0.3 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [started])

  useEffect(() => {
    if (!started) return

    const timeout = setTimeout(() => {
      let i = 0
      const timer = setInterval(() => {
        if (i < code.length) {
          setDisplayed(code.slice(0, i + 1))
          i++
        } else {
          clearInterval(timer)
        }
      }, speed)

      return () => clearInterval(timer)
    }, startDelay)

    return () => clearTimeout(timeout)
  }, [started, code, speed, startDelay])

  return (
    <pre ref={ref} className={className}>
      <code>
        {displayed}
        {displayed.length < code.length && (
          <span className="inline-block w-2 h-4 bg-[var(--accent)] animate-pulse ml-0.5 align-middle" />
        )}
      </code>
    </pre>
  )
}

/**
 * Animated counter that counts up to a number.
 */
export function AnimatedNumber({
  value,
  duration = 1500,
  suffix = '',
  className = '',
}: {
  value: number
  duration?: number
  suffix?: string
  className?: string
}) {
  const [count, setCount] = useState(value) // Start with real value for SSR/static
  const [hasAnimated, setHasAnimated] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true)
          observer.unobserve(el)
        }
      },
      { threshold: 0.5 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [started])

  useEffect(() => {
    if (!started || hasAnimated) return
    setHasAnimated(true)

    // Reset to 0, then animate up
    setCount(0)
    const steps = 60
    const stepDuration = duration / steps
    let step = 0

    const timer = setInterval(() => {
      step++
      const progress = 1 - Math.pow(1 - step / steps, 3)
      setCount(Math.round(value * progress))

      if (step >= steps) {
        setCount(value)
        clearInterval(timer)
      }
    }, stepDuration)

    return () => clearInterval(timer)
  }, [started, value, duration, hasAnimated])

  return (
    <span ref={ref} className={className}>
      {count}
      {suffix}
    </span>
  )
}
