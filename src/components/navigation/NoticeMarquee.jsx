import { useLayoutEffect, useRef, useState } from "react";
import { GiftIcon, MegaphoneIcon } from "@heroicons/react/24/outline";
import { MARQUEE_SPEEDS } from "@/features/homepage";

function MessageSet({ messages, setRef }) {
  return (
    <div ref={setRef} className="flex shrink-0 items-center">
      {messages.map((message) => (
        <span
          key={message.id}
          className="flex items-center gap-2 pr-10 text-sm font-medium whitespace-nowrap text-slate-700"
        >
          <GiftIcon className="text-accent-500 h-4 w-4 shrink-0" />
          {message.text}
        </span>
      ))}
    </div>
  );
}

export default function NoticeMarquee({ badgeText, messages, speed }) {
  const containerRef = useRef(null);
  const setRef = useRef(null);
  const [repeat, setRepeat] = useState(1);
  const [duration, setDuration] = useState(40);
  const pxPerSecond = MARQUEE_SPEEDS[speed] ?? MARQUEE_SPEEDS.normal;

  useLayoutEffect(() => {
    const container = containerRef.current;
    const set = setRef.current;
    if (!container || !set) return undefined;

    const measure = () => {
      const setWidth = set.offsetWidth;
      if (!setWidth) return;
      const nextRepeat = Math.max(
        1,
        Math.ceil(container.offsetWidth / setWidth),
      );
      setRepeat(nextRepeat);
      setDuration((setWidth * nextRepeat) / pxPerSecond);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    observer.observe(set);
    return () => observer.disconnect();
  }, [messages, pxPerSecond]);

  if (!messages.length) return null;

  const group = (hidden) => (
    <div className="flex shrink-0" aria-hidden={hidden || undefined}>
      {Array.from({ length: repeat }, (_, i) => (
        <MessageSet
          key={i}
          messages={messages}
          setRef={!hidden && i === 0 ? setRef : undefined}
        />
      ))}
    </div>
  );

  return (
    <div className="border-primary-100 bg-primary-50/60 border-b">
      <div className="container-app flex h-9 items-center gap-3">
        {badgeText ? (
          <span className="bg-primary-600 flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold text-white shadow-sm">
            <MegaphoneIcon className="h-3.5 w-3.5" />
            {badgeText}
          </span>
        ) : null}
        <div
          ref={containerRef}
          className="relative min-w-0 flex-1 overflow-hidden mask-[linear-gradient(to_right,transparent,black_24px,black_calc(100%-24px),transparent)]"
        >
          <div
            className="animate-marquee flex w-max hover:[animation-play-state:paused] motion-reduce:animate-none"
            style={{ animationDuration: `${duration}s` }}
          >
            {group(false)}
            {group(true)}
          </div>
        </div>
      </div>
    </div>
  );
}
