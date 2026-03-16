import Image from "next/image";
import { cn } from "@/lib/utils";

export function Logo({ className, iconOnly = false }: { className?: string; iconOnly?: boolean }) {
    return (
        <div className={cn("flex items-center gap-2", className)}>
            <div className={`relative flex items-center justify-center flex-shrink-0 group overflow-hidden w-8 h-8`}>
                <Image src="/icon.png" alt="Reveel Logo" width={32} height={32} className={`relative z-10 transition-transform group-hover:scale-105 duration-300 pointer-events-none object-contain w-full h-full`} />
            </div>
            {!iconOnly && <span className="text-xl font-black tracking-tight text-[#111]">Reveel</span>}
        </div>
    );
}
