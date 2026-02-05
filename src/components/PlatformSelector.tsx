"use client";

import { PLATFORM_CONFIG, type PlatformKey } from "@/lib/platforms";
import { FaInstagram, FaFacebook, FaTiktok, FaYoutube, FaTwitch } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import type { IconType } from "react-icons";

const PLATFORM_ICONS: Record<Exclude<PlatformKey, "KICK">, IconType> = {
  INSTAGRAM: FaInstagram,
  FACEBOOK: FaFacebook,
  TIKTOK: FaTiktok,
  YOUTUBE: FaYoutube,
  X: FaXTwitter,
  TWITCH: FaTwitch,
};

const PLATFORM_COLORS: Record<PlatformKey, string> = {
  INSTAGRAM: "#E4405F",
  FACEBOOK: "#1877F2",
  TIKTOK: "#000000",
  YOUTUBE: "#FF0000",
  X: "#000000",
  TWITCH: "#9146FF",
  KICK: "#53FC18",
};

interface PlatformSelectorProps {
  value: PlatformKey | null;
  onChange: (platform: PlatformKey) => void;
  error?: string;
}

export default function PlatformSelector({
  value,
  onChange,
  error,
}: PlatformSelectorProps) {
  return (
    <div>
      <div className="grid grid-cols-4 gap-2">
        {(Object.keys(PLATFORM_CONFIG) as PlatformKey[]).map((key) => {
          const selected = value === key;
          const Icon = key !== "KICK" ? PLATFORM_ICONS[key] : null;
          const color = PLATFORM_COLORS[key];

          return (
            <button
              key={key}
              type="button"
              onClick={() => onChange(key)}
              className={`py-3.5 px-2 rounded-lg border-[1.5px] cursor-pointer text-center transition-colors ${
                selected
                  ? "border-accent bg-accent-light"
                  : "border-border bg-card hover:border-muted"
              }`}
            >
              <div className="flex justify-center mb-1">
                {key === "KICK" ? (
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ backgroundColor: "#000000", color: color }}
                  >
                    K
                  </div>
                ) : Icon ? (
                  <Icon size={24} color={color} />
                ) : null}
              </div>
              <div
                className={`text-xs ${
                  selected ? "font-semibold text-accent" : "font-normal text-foreground"
                }`}
              >
                {PLATFORM_CONFIG[key].name}
              </div>
            </button>
          );
        })}
      </div>
      {error && (
        <p className="text-accent text-[13px] mt-1">{error}</p>
      )}
    </div>
  );
}
