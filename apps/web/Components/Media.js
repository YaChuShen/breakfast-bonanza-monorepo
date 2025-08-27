import { Box, useBreakpointValue } from "@chakra-ui/react";
import React, { useEffect, useMemo, useState } from "react";
import { chakraBpNames } from "contents/breakpoints";

const Media = ({
  at,
  greaterThan,
  lessThan,
  greaterThanOrEqual,
  between,
  className = "",
  ...props
}) => {
  const [mounted, setMounted] = useState(false);

  const renderRule = useMemo(() => {
    if (at) return { base: false, [at]: true };
    if (greaterThan) {
      const nextBp = chakraBpNames.findIndex((d) => d === greaterThan) + 1;
      return { base: false, [chakraBpNames[nextBp]]: true };
    }
    if (lessThan) return { base: true, [lessThan]: false };
    if (greaterThanOrEqual) return { base: false, [greaterThanOrEqual]: true };
    if (between)
      return { base: false, [between[0]]: true, [between[1]]: false };
    return { base: true };
  }, [at, greaterThan, lessThan, greaterThanOrEqual, between]);

  const shouldRender = useBreakpointValue(renderRule);

  useEffect(() => setMounted(true), []);

  return mounted && !shouldRender ? null : (
    <Box
      className={[
        className,
        "fresnel-container",
        ...Object.entries({
          at,
          greaterThan,
          lessThan,
          greaterThanOrEqual,
        })
          .filter(([key, value]) => value)
          .map(([key, value]) => `fresnel-${key}-${value}`),
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
};

export default Media;
