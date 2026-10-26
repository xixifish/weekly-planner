import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({ variable: "--font-manrope", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://weekly-planner-jing.vercel.app"),
  title: "Weekly Planner",
  description: "Start a productive week.",
};

// "light" or "dark" when chosen in the profile menu; otherwise follow the system
async function getChosenTheme() {
  const theme = (await cookies()).get("theme")?.value;
  return theme === "light" || theme === "dark" ? theme : undefined;
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const theme = await getChosenTheme();

  return (
    <html
      lang="en"
      data-theme={theme}
      className={`${manrope.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
