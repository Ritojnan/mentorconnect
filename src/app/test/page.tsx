import { authOptions } from '@/lib/auth'
import { getServerSession } from 'next-auth'
import React from 'react'

const page = async () => {
  const serverSession = await getServerSession(authOptions);
  
  return (
    <div>page {serverSession?.user.username}</div>
  )
}

export default page