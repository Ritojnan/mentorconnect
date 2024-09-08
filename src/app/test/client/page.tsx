'use client';

import { useSession } from 'next-auth/react';
import React from 'react'

const page = () => {
  const clientSession = useSession();
  console.log(clientSession);
  return (
    <div>client session</div>
  )
}

export default page