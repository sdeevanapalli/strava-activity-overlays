"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import type { ComponentPropsWithoutRef, MouseEventHandler, ReactNode } from "react";

type ConnectButtonTheme = "orange" | "white";
type PoweredByStravaLayout = "horizontal" | "stacked";
type PoweredByStravaColor = "orange" | "white" | "black";

const CONNECT_BUTTON_ASSETS: Record<ConnectButtonTheme, string> = {
  orange: "/strava-branding/connect/btn_strava_connect_with_orange.svg",
  white: "/strava-branding/connect/btn_strava_connect_with_white.svg",
};

const POWERED_BY_ASSETS: Record<PoweredByStravaColor, Record<PoweredByStravaLayout, string>> = {
  orange: {
    horizontal: "/strava-branding/powered-by/api_logo_pwrdBy_strava_horiz_orange.svg",
    stacked: "/strava-branding/powered-by/api_logo_pwrdBy_strava_stack_orange.svg",
  },
  white: {
    horizontal: "/strava-branding/powered-by/api_logo_pwrdBy_strava_horiz_white.svg",
    stacked: "/strava-branding/powered-by/api_logo_pwrdBy_strava_stack_white.svg",
  },
  black: {
    horizontal: "/strava-branding/powered-by/api_logo_pwrdBy_strava_horiz_black.svg",
    stacked: "/strava-branding/powered-by/api_logo_pwrdBy_strava_stack_black.svg",
  },
};

const CONNECT_BUTTON_SIZE = { width: 237, height: 48 };
const POWERED_BY_SIZE = {
  horizontal: { width: 365, height: 37 },
  stacked: { width: 176, height: 60 },
} as const;

function combineClasses(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

interface ConnectButtonProps
  extends Omit<ComponentPropsWithoutRef<"button">, "children" | "onClick"> {
  theme?: ConnectButtonTheme;
  oauthUrl?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  logo?: ReactNode;
}

/**
 * Connect-only Strava OAuth button.
 *
 * Do not use this as a general login button when other auth methods exist.
 * Keep the logo asset static, preserve clear space around it, and point the action at the Strava OAuth URL.
 */
export function ConnectButton({
  theme = "orange",
  oauthUrl = "/api/auth/strava",
  onClick,
  logo,
  className,
  disabled,
  type = "button",
  ...buttonProps
}: ConnectButtonProps) {
  const router = useRouter();
  const buttonAsset = CONNECT_BUTTON_ASSETS[theme];

  const buttonClasses =
    theme === "white"
      ? "focus-visible:ring-[#111111]"
      : "focus-visible:ring-[#FC5200]";

  return (
    <button
      {...buttonProps}
      type={type}
      disabled={disabled}
      onClick={(event) => {
        onClick?.(event);

        if (event.defaultPrevented || disabled) {
          return;
        }

        if (/^https?:\/\//i.test(oauthUrl)) {
          window.location.assign(oauthUrl);
          return;
        }

        router.push(oauthUrl);
      }}
      className={combineClasses(
        "inline-flex h-12 overflow-hidden rounded-none border-0 p-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-60",
        buttonClasses,
        className
      )}
    >
      {logo ?? (
        <Image
          src={buttonAsset}
          alt="Connect with Strava"
          width={CONNECT_BUTTON_SIZE.width}
          height={CONNECT_BUTTON_SIZE.height}
          className="block h-12 w-auto"
          priority={false}
        />
      )}
    </button>
  );
}

interface PoweredByStravaProps extends ComponentPropsWithoutRef<"div"> {
  layout?: PoweredByStravaLayout;
  color?: PoweredByStravaColor;
  logo?: ReactNode;
}

/**
 * Attribution lockup for Strava-powered surfaces.
 *
 * Do not animate the logo, keep clear space around the mark, and use #FC5200 or bold text for any
 * "View on Strava" links.
 */
export function PoweredByStrava({
  layout = "horizontal",
  color = "orange",
  logo,
  className,
  ...props
}: PoweredByStravaProps) {
  const asset = POWERED_BY_ASSETS[color][layout];
  const size = POWERED_BY_SIZE[layout];

  return (
    <div
      {...props}
      className={combineClasses(
        "inline-flex max-w-max items-center",
        className
      )}
    >
      {logo ?? (
        <Image
          src={asset}
          alt="Powered by Strava"
          width={size.width}
          height={size.height}
          className="block h-auto w-auto max-w-full"
          priority={false}
        />
      )}
    </div>
  );
}
