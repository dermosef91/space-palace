import Game from "@/components/game"

export default function Home() {
  return (
    <main
      className="flex min-h-screen flex-col items-center justify-between p-4 bg-cover bg-center relative"
      style={{
        backgroundImage:
          'url("https://hebbkx1anhila5yf.public.blob.vercel-storage.com/mosef8868_Generate_an_abstract_background_image_with_a_dark_cos_a86b0087-2144-48a2-9a6b-c426e0dfb127.png-ZDVeiGjMG5RuiFCo9KuLMtToN7tsQU.jpeg")',
        backgroundColor: "#000", // Fallback color
      }}
    >
      {/* Stronger gradient overlay - much more pronounced vignette effect */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(circle at center, rgba(0, 0, 0, 1) 20%, rgba(0, 0, 0, 0.5) 50%, rgba(0, 0, 0, 0) 100%)",
          pointerEvents: "none", // Ensure it doesn't block interaction
        }}
      ></div>

      {/* Content container with higher z-index to appear above the overlay */}
      <div className="w-full max-w-5xl flex flex-col items-center justify-center gap-4 relative z-10">
        <Game />
      </div>
    </main>
  )
}

