const bp = [
  0,
  30, // sm => 480px
  48, // md => 768px
  68, // lg => 1088px
  80, // xl => 1440px
  96, // 2xl => 1536px
  120, // 3xl => 1920px
  140, // 4xl => 2240px
].map((em) => em * 16);

export const chakraBpNames = ['sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl'];
const breakpoints = chakraBpNames.reduce((bps, name, i) => {
  bps[name] = `${bp[i + 1]}px`;
  return bps;
}, {});

export default breakpoints;
