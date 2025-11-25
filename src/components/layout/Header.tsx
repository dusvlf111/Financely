"use client";
import { useAuth } from "@/lib/context/AuthProvider";
import { useEnergy } from "@/lib/store/energyStore";
import Image from "next/image";
import Link from "next/link";
export default function Header() {
  const { user, profile } = useAuth();
  const { energy, remainingSeconds } = useEnergy();

  if (!profile) return null;

  return (
    <header className="flex items-center justify-between py-3 px-4">
      <Link href="/learn" className="flex items-center gap-2">
        <Image
          src="/favicon/apple-icon-180x180.png"
          alt="Financely"
          width={32}
          height={32}
          className="w-8 h-8"
        />
        <span className="text-xl font-bold text-primary-500">Financely</span>
      </Link>

      <div className="flex items-center gap-4">
        {/* 에너지 */}
        <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm  ">
          <Image
            src="/icons/energy_icon.svg"
            alt="Energy"
            width={20}
            height={20}
            className="h-5 w-5"
          />
          <span className="text-sm font-semibold">{energy}</span>
          {energy < 5 && remainingSeconds && (
            <div className="flex items-center gap-1 text-xs text-neutral-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3 w-3"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                  clipRule="evenodd"
                />
              </svg>
              <span>
                {Math.floor(remainingSeconds / 60)}:
                {String(remainingSeconds % 60).padStart(2, "0")}
              </span>
            </div>
          )}
        </div>

        {/* 골드 */}
        <div
          id="header-gold"
          className="flex items-center gap-2 bg-white/80 backdrop-blur-sm "
        >
          <Image
            src="/icons/gold_icon.svg"
            alt="Gold"
            width={20}
            height={20}
            className="h-5 w-5"
          />
          <span className="text-sm font-semibold">
            {profile.gold.toLocaleString()}
          </span>
        </div>
      </div>
    </header>
  );
}
