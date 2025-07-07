import Image from "next/image";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <div className="flex items-center gap-4">
          <Image
            className="dark:invert"
            src="/next.svg"
            alt="Next.js logo"
            width={180}
            height={38}
            priority
          />
          <span className="text-2xl">+</span>
          <div className="text-2xl font-bold text-green-600">📱 WhatsApp Bot</div>
        </div>
        
        <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg border border-green-200 dark:border-green-800">
          <h2 className="text-xl font-semibold mb-4 text-green-800 dark:text-green-200">🤖 Bot WhatsApp Setup Guide</h2>
          <ol className="list-inside list-decimal text-sm/6 text-left font-[family-name:var(--font-geist-mono)] space-y-3">
            <li className="tracking-[-.01em]">
              Daftar di{" "}
              <a href="https://fonnte.com" target="_blank" className="text-blue-600 underline hover:text-blue-800">
                fonnte.com
              </a>{" "}
              dan dapatkan API token
            </li>
            <li className="tracking-[-.01em]">
              Buat file{" "}
              <code className="bg-black/[.05] dark:bg-white/[.06] px-1 py-0.5 rounded font-[family-name:var(--font-geist-mono)] font-semibold">
                .env.local
              </code>{" "}
              dengan:
              <pre className="mt-2 bg-gray-800 text-green-400 p-3 rounded text-xs overflow-x-auto">
{`FONNTE_TOKEN=your_token_here
FONNTE_DEVICE=your_device_id (optional)`}
              </pre>
            </li>
            <li className="tracking-[-.01em]">
              Set webhook URL di Fonnte dashboard ke:{" "}
              <code className="bg-black/[.05] dark:bg-white/[.06] px-1 py-0.5 rounded font-[family-name:var(--font-geist-mono)] font-semibold">
                https://your-domain.com/api/webhook
              </code>
            </li>
            <li className="tracking-[-.01em]">
              Test endpoint:{" "}
              <a href="/api/webhook" target="_blank" className="text-blue-600 underline hover:text-blue-800">
                /api/webhook
              </a>
            </li>
          </ol>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
          <h3 className="text-lg font-semibold mb-3 text-blue-800 dark:text-blue-200">🎯 Fitur Bot</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Auto Reply:</h4>
              <ul className="space-y-1 text-gray-600 dark:text-gray-300">
                <li>• "halo" atau "hi" → Salam ramah</li>
                <li>• "help" atau "bantuan" → Menu bantuan</li>
                <li>• "produk" → Info produk</li>
                <li>• Pesan lain → Response umum</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Features:</h4>
              <ul className="space-y-1 text-gray-600 dark:text-gray-300">
                <li>• ✅ Webhook receiver</li>
                <li>• ✅ Auto reply system</li>
                <li>• ✅ Message logging</li>
                <li>• ✅ Error handling</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <a
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className="dark:invert"
              src="/vercel.svg"
              alt="Vercel logomark"
              width={20}
              height={20}
            />
            Deploy now
          </a>
          <a
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto md:w-[158px]"
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Read our docs
          </a>
        </div>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a>
      </footer>
    </div>
  );
}
