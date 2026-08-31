import { cn } from "@/lib/utils";

/**
 * Full-bleed responsive brand imagery. Serves a smaller source to phones and lazy-loads
 * below-the-fold art.
 *
 * The DigiCon brand assets are complete posters (logo, wordmark, product UI, QR codes), so
 * the default renders them at their natural aspect ratio — nothing important is ever cropped.
 * Pass `ratioClassName` to opt into a fixed-ratio crop with a chosen focal point.
 */
export default function BrandImage({
  name,
  alt,
  className,
  ratioClassName,
  position = "center",
  priority = false,
  testId,
}: {
  name: "connect" | "share" | "remember" | "grow" | "male";
  alt: string;
  className?: string;
  ratioClassName?: string;
  position?: string;
  priority?: boolean;
  testId: string;
}) {
  const cropped = Boolean(ratioClassName);
  return (
    <picture>
      <source media="(max-width: 640px)" srcSet={`/brand/${name}-sm.webp`} type="image/webp" />
      <source srcSet={`/brand/${name}.webp`} type="image/webp" />
      <img
        src={`/brand/${name}.webp`}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={priority ? "high" : "auto"}
        className={cn(
          "block w-full",
          cropped ? `object-cover ${ratioClassName}` : "h-auto",
          className,
        )}
        style={cropped ? { objectPosition: position } : undefined}
        data-testid={testId}
      />
    </picture>
  );
}
