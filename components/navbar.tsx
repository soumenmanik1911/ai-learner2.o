import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import NavItems from './navItems'
import { SignInButton, UserButton, SignedIn, SignedOut } from '@clerk/nextjs'

const navbar = () => {
  return (
    <nav className = "navbar">
        <Link href = "/">
          <div className = "flex items-center gap-2">
            <Image src = "/images/logo.webp" alt = "logo" width = {64} height = {66} />
          </div>
        </Link>
        <div className = "flex items-center gap-8">
            <NavItems />
           <SignedOut>
                    <SignInButton>
                        <button className="btn-signin">Sign In</button>
                    </SignInButton>
                </SignedOut>
                <SignedIn>
                    <UserButton />
                </SignedIn>
        </div>
    </nav>
   
  )
}

export default navbar
