'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { User } from 'next-auth'
import { Button } from './ui/button'

function Navbar() {
  const { data: session } = useSession()
  const user: User = session?.user as User

  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav
      className={`bg-zinc-900 text-white shadow-md border-b border-neutral-800 transition-all duration-300 ${
        scrolled ? 'py-2' : 'py-4 md:py-6'
      }`}
    >
      <div className="container mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-center">
        {/* Logo with hover + scroll animation */}
        <Link
          href="/"
          className={`text-2xl font-bold tracking-wide mb-2 md:mb-0 transform transition-all duration-300 hover:scale-105 hover:text-indigo-400 ${
            scrolled ? 'text-xl' : 'text-2xl'
          }`}
        >
          👻 AnonBox
        </Link>

        {/* Right Side */}
        <div className="flex flex-col md:flex-row items-center gap-3 md:gap-6 text-sm md:text-base">
          {session ? (
            <>
              <span className="text-gray-300 text-center md:text-left">
                Welcome,&nbsp;
                <span className="font-semibold text-white hover:underline cursor-pointer transition-all duration-150">
                  {user?.username || user?.email}
                </span>
              </span>
              <Button
                onClick={() => signOut()}
                className="bg-zinc-800 text-white hover:bg-red-600 hover:text-white border border-transparent hover:border-red-500 transition-all duration-200 shadow-sm cursor-pointer"
                variant="ghost"
                >
                Logout
                </Button>

            </>
          ) : (
            <Link href="/sign-in" className="cursor-pointer">
              <Button className="bg-zinc-800 text-white hover:bg-red-600  hover:text-white border border-transparent hover:border-red-500 transition-all duration-200 shadow-sm cursor-pointer">
                Login
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
