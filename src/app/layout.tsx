import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import type { Metadata } from "next";
import { ConvexClientProvider } from "@/components/convex-client-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { META_THEME_COLORS, siteConfig } from "@/lib/config";
import { fontVariables } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import "@/styles/globals.css";

export const metadata: Metadata = {
	title: "Planner",
	// title: {
	// 	default: siteConfig.name,
	// 	template: `%s - ${siteConfig.name}`,
	// },
	// metadataBase: process.env.NEXT_PUBLIC_APP_URL
	// 	? new URL(process.env.NEXT_PUBLIC_APP_URL)
	// 	: undefined,
	description: siteConfig.description,
	keywords: ["Next.js", "React", "Tailwind CSS", "Convex", "shadcn"],
	authors: [
		{
			name: "ahmoin",
			url: "https://ahnoin.com",
		},
	],
	creator: "ahmoin",
	openGraph: {
		type: "website",
		locale: "en_US",
		url: process.env.NEXT_PUBLIC_APP_URL,
		title: siteConfig.name,
		description: siteConfig.description,
		siteName: siteConfig.name,
		images: [
			{
				url: `${process.env.NEXT_PUBLIC_APP_URL}/opengraph-image.png`,
				width: 1200,
				height: 630,
				alt: siteConfig.name,
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: siteConfig.name,
		description: siteConfig.description,
		images: [`${process.env.NEXT_PUBLIC_APP_URL}/opengraph-image.png`],
		creator: "@ahmoin0",
	},
	icons: {
		icon: "/favicon.ico",
		shortcut: "/favicon-16x16.png",
		apple: "/apple-touch-icon.png",
	},
	manifest: `${siteConfig.url}/site.webmanifest`,
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<ConvexAuthNextjsServerProvider>
			<html lang="en" suppressHydrationWarning>
				<head>
					<script
						// biome-ignore lint/security/noDangerouslySetInnerHtml: needed for theme initialization
						dangerouslySetInnerHTML={{
							__html: `
              try {
                if (localStorage.theme === 'dark' || ((!('theme' in localStorage) || localStorage.theme === 'system') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.querySelector('meta[name="theme-color"]').setAttribute('content', '${META_THEME_COLORS.dark}')
                }
              } catch (_) {}
            `,
						}}
					/>
					<meta name="theme-color" content={META_THEME_COLORS.light} />
				</head>
				<body
					className={cn(
						"text-foreground group/body overscroll-none font-sans antialiased [--footer-height:calc(var(--spacing)*14)] [--header-height:calc(var(--spacing)*14)] xl:[--footer-height:calc(var(--spacing)*24)]",
						fontVariables,
					)}
				>
					<ConvexClientProvider>
						<ThemeProvider>
							{children}
							<Toaster position="top-center" richColors />
						</ThemeProvider>
					</ConvexClientProvider>
				</body>
			</html>
		</ConvexAuthNextjsServerProvider>
	);
}
