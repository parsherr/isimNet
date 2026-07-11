"use client";

import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function Header() {
  const { data: session } = useSession();

  const name = session?.user?.name ?? "Kullanıcı";
  const image = session?.user?.image;
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/dashboard">
          <Image
            src="/logo.png"
            alt="İşimNet"
            width={120}
            height={36}
            priority
            className="h-9 w-auto"
          />
        </Link>
        <div className="flex items-center gap-2 bg-indigo-50 rounded-full px-3 py-1.5">
          {image ? (
            <Image
              src={image}
              alt={name}
              width={24}
              height={24}
              className="w-6 h-6 rounded-full object-cover"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-indigo-200 flex items-center justify-center">
              <span className="text-indigo-700 text-xs font-bold">{initials}</span>
            </div>
          )}
          <span className="text-indigo-700 text-sm font-medium">
            {name.split(" ")[0]}
          </span>
        </div>
      </div>
    </header>
  );
}