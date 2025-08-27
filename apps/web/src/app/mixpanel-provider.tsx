"use client";

import React, { useEffect } from "react";
import { usePathname ,useSearchParams} from "next/navigation";
import { initMixpanel, identifyUser, trackEvent } from "../../lib/mixpanel";
import { useSession } from "next-auth/react";
import mixpanel from "mixpanel-browser";

export default function MixpanelProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();


  const pathname = usePathname();

  useEffect(() => {
    initMixpanel();
    console.log("initMixpanel")
  }, []);

  useEffect(() => {
    
    if (status === "authenticated" && session?.user) {
      identifyUser(session.user.email || "UnknownUser");
      mixpanel.people.set({
        $email: session.user.email,
        $name: session.user.name || "", 
      });
      trackEvent("User Logged In", {
        email: session.user.email,
      });
    } 
  }, []);

  const searchParams = useSearchParams();

  useEffect(() => {
    const isPageRefresh = sessionStorage.getItem('hasLoaded');
    const source = searchParams?.get('utm_source') || 'direct';
    if (!isPageRefresh) {
      trackEvent("Page View", {
        path: pathname,
        source
      });      
      sessionStorage.setItem('hasLoaded', 'true');
    }  }, []);

  return <>{children}</>;
}
