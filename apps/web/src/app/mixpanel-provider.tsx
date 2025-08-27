'use client';

import mixpanel from 'mixpanel-browser';
import { useSession } from 'next-auth/react';
import { usePathname, useSearchParams } from 'next/navigation';
import React, { Suspense, useEffect } from 'react';
import { identifyUser, initMixpanel, trackEvent } from '../../lib/mixpanel';

function MixpanelTracker() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    initMixpanel();
    console.log('initMixpanel');
  }, []);

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      identifyUser(session.user.email || 'UnknownUser');
      mixpanel.people.set({
        $email: session.user.email,
        $name: session.user.name || '',
      });
      trackEvent('User Logged In', {
        email: session.user.email,
      });
    }
  }, [status, session]);

  useEffect(() => {
    const isPageRefresh = sessionStorage.getItem('hasLoaded');
    const source = searchParams?.get('utm_source') || 'direct';
    if (!isPageRefresh) {
      trackEvent('Page View', {
        path: pathname,
        source,
      });
      sessionStorage.setItem('hasLoaded', 'true');
    }
  }, [pathname, searchParams]);

  return null;
}

export default function MixpanelProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Suspense fallback={null}>
        <MixpanelTracker />
      </Suspense>
      {children}
    </>
  );
}
