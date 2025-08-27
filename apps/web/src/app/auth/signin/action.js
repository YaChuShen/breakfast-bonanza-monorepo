import { getCsrfToken, getProviders } from 'next-auth/react';

export async function getAuthData() {
  const csrfToken = (await getCsrfToken()) ?? null;
  const providers = await getProviders();

  return {
    providers: providers || [],
    csrfToken,
  };
}
