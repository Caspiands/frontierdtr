import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans, Source_Serif_4 } from "next/font/google";
import "./globals.css";
import "./dtr-base.css";
import "./dtr-extras.css";

const sans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-plex-sans",
  display: "swap",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
  display: "swap",
});

const serif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-source-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Frontier Healthcare DTR 2026–27",
  description:
    "Frontier Healthcare Digital Transformation Roadmap 2026–27: the Frontier website, the Qualitas Health SG group site, IMC, corporate business and AI video, prepared by Caspian Digital Solutions.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${mono.variable} ${serif.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full">
        <script
          dangerouslySetInnerHTML={{
            __html:
              'try{var t=localStorage.getItem("qhs-dtr-theme");if(t==="dark"||t==="light")document.documentElement.setAttribute("data-theme",t);}catch(e){}',
          }}
        />
        {children}
      </body>
    </html>
  );
}
