import Image from "next/image";
import placeholderImages from '@/lib/placeholder-images.json';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authImage = placeholderImages.placeholderImages.find(p => p.id === "auth-background");

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="relative grid w-full max-w-6xl grid-cols-1 overflow-hidden rounded-2xl border bg-card shadow-lg md:grid-cols-2">
        <div className="relative hidden h-full flex-col justify-end bg-primary p-10 text-white md:flex">
          {authImage && (
             <Image
              src={authImage.imageUrl}
              alt={authImage.description}
              fill
              className="absolute inset-0 h-full w-full object-cover opacity-20"
              data-ai-hint={authImage.imageHint}
              priority
            />
          )}
          <div className="relative z-20 flex items-center text-5xl font-extrabold tracking-tight">
            MediServe
          </div>
          <p className="relative z-20 mt-4 text-lg">
            Your comprehensive pharmacy management solution.
          </p>
        </div>
        <div className="flex items-center justify-center p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
