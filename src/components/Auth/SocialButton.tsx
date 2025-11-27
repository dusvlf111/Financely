"use client";
import { hapticSelection } from "@/lib/utils/haptic";
import React from "react";

type SocialProvider = "google" | "naver" | "kakao";

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  provider: SocialProvider;
  label?: string;
}

const providerLabels: Record<SocialProvider, string> = {
  google: "구글로 로그인",
  naver: "네이버로 로그인",
  kakao: "카카오로 로그인",
};

const providerClasses: Record<SocialProvider, string> = {
  google: "btn-google",
  naver: "btn-naver",
  kakao: "btn-kakao",
};

function ProviderIcon({ provider }: { provider: SocialProvider }) {
  // simple inline SVG placeholders to avoid external asset 404s
  if (provider === "google")
    return (
      <svg
        width={21}
        height={21}
        viewBox="0 0 24 24"
        className="ml-1.5"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M23.04 12.2614C23.04 11.4459 22.9668 10.6618 22.8309 9.90912H12V14.3575H18.1891C17.9225 15.795 17.1123 17.013 15.8943 17.8284V20.7139H19.6109C21.7855 18.7118 23.04 15.7637 23.04 12.2614Z"
          fill="#4285F4"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M12 23.4998C15.105 23.4998 17.7081 22.47 19.6109 20.7137L15.8943 17.8282C14.8645 18.5182 13.5472 18.9259 12 18.9259C9.00474 18.9259 6.46951 16.903 5.56519 14.1848H1.72314V17.1644C3.61542 20.9228 7.50451 23.4998 12 23.4998Z"
          fill="#34A853"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M5.56523 14.1851C5.33523 13.4951 5.20455 12.758 5.20455 12.0001C5.20455 11.2421 5.33523 10.5051 5.56523 9.81506V6.83551H1.72318C0.944318 8.38801 0.5 10.1444 0.5 12.0001C0.5 13.8557 0.944318 15.6121 1.72318 17.1646L5.56523 14.1851Z"
          fill="#FBBC05"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M12 5.07386C13.6884 5.07386 15.2043 5.65409 16.3961 6.79364L19.6945 3.49523C17.7029 1.63955 15.0997 0.5 12 0.5C7.50451 0.5 3.61542 3.07705 1.72314 6.83545L5.56519 9.815C6.46951 7.09682 9.00474 5.07386 12 5.07386Z"
          fill="#EA4335"
        />
      </svg>
    );
  if (provider === "naver")
    return (
      <svg
        width={36}
        height={36}
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g clipPath="url(#clip0_403_243)">
          <path
            d="M11.35 10.25L8.50002 6.19995H6.15002V13.8H8.65002V9.74995L11.5 13.8H13.85V6.19995H11.35V10.25Z"
            fill="white"
          />
        </g>
        <defs>
          <clipPath id="clip0_403_243">
            <rect width={20} height={20} fill="white" />
          </clipPath>
        </defs>
      </svg>
    );
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={26}
      height={26}
      viewBox="0 0 256 256"
      className="ml-1"
    >
      <path d="M128 36C70.562 36 24 72.713 24 118c0 29.279 19.466 54.97 48.748 69.477-1.593 5.494-10.237 35.344-10.581 37.689 0 0-.207 1.762.934 2.434s2.483.15 2.483.15c3.272-.457 37.943-24.811 43.944-29.04 5.995.849 12.168 1.29 18.472 1.29 57.438 0 104-36.712 104-82 0-45.287-46.562-82-104-82z" />
    </svg>
  );
}

export default function SocialButton({
  provider,
  label,
  className = "",
  ...rest
}: Props) {
  const buttonText = label ?? rest.children ?? providerLabels[provider];

  return (
    <button
      type="button"
      aria-label={String(buttonText)}
      className={`btn-social ${providerClasses[provider]} ${className}`}
      onClick={(e) => {
        hapticSelection();
        if (rest.onClick) rest.onClick(e);
      }}
      {...rest}
    >
      <ProviderIcon provider={provider} />
      <span className="flex-1">{buttonText}</span>
    </button>
  );
}
